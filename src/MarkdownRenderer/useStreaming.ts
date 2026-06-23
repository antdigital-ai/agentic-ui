import { useCallback, useEffect, useRef, useState } from 'react';
import {
  INITIAL_FENCE_STATE,
  updateFenceStateForLine,
  type FenceState,
} from './streaming/fenceTracker';

/**
 * 流式 token 缓存类型。
 * 在流式场景中，部分 Markdown token（link、image、table 等）可能处于未闭合状态，
 * 直接交给 parser 会产生错误结果。此 hook 将已完成的内容和未完成的 pending 分离，
 * 仅将已完成的部分交给 parser。
 *
 * 移植自 @ant-design/x-markdown 的 useStreaming hook。
 */

export enum StreamCacheTokenType {
  Text = 'text',
  Link = 'link',
  Image = 'image',
  Html = 'html',
  Emphasis = 'emphasis',
  List = 'list',
  Table = 'table',
  InlineCode = 'inline-code',
}

interface StreamCache {
  pending: string;
  token: StreamCacheTokenType;
  processedLength: number;
  completeMarkdown: string;
  fenceState: FenceState;
  currentLine: string;
}

interface Recognizer {
  tokenType: StreamCacheTokenType;
  isStartOfToken: (markdown: string) => boolean;
  isStreamingValid: (markdown: string) => boolean;
  getCommitPrefix?: (pending: string) => string | null;
}

const STREAM_INCOMPLETE_REGEX = {
  image: [
    /^!\[[^\]\r\n]{0,1000}$/,
    /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/,
  ],
  link: [
    /^\[(?!\^)[^\]\r\n]{0,1000}$/,
    /^\[(?!\^)[^\r\n]{0,1000}\]\(+[^)\r\n]{0,1000}$/,
  ],
  html: [/^<\/$/, /^<\/?[a-zA-Z][a-zA-Z0-9-]{0,100}[^>\r\n]{0,1000}$/],
  commonEmphasis: [/^(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/],
  list: [
    /^[-+*]\s{0,3}$/,
    /^[-+*]\s{1,3}(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/,
  ],
  'inline-code': [/^`[^`\r\n]{0,300}$/, /^`{2,}$/],
} as const;

const STREAMING_LOADING_PLACEHOLDER = '...';

const parsePipeRowCells = (line: string): string[] | null => {
  const trimmedLine = line.trim();
  if (!trimmedLine.startsWith('|') || !trimmedLine.endsWith('|')) {
    return null;
  }
  const cells = trimmedLine
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
  if (!cells.length) return null;
  return cells;
};

const isTableSeparatorCell = (cell: string): boolean => {
  return /^:?-{3,}:?$/.test(cell);
};

/**
 * 判断表格是否仍不完整。
 * 等待 header + separator + 第一行数据完整闭合后提交。
 */
const isTableIncomplete = (markdown: string) => {
  if (markdown.includes('\n\n')) return false;
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  // 需要至少 3 行：header | separator | 第一行数据
  if (lines.length < 3) return true;
  const [header, separator, firstDataRow] = lines;

  const headerCells = parsePipeRowCells(header);
  if (!headerCells) return false;

  const separatorCells = parsePipeRowCells(separator);
  if (!separatorCells || separatorCells.length !== headerCells.length) {
    return false;
  }
  const isSeparatorValid = separatorCells.every(isTableSeparatorCell);
  if (!isSeparatorValid) return false;

  const firstDataRowTrimmed = firstDataRow?.trim() || '';
  // 第三行仍为空，说明首行数据尚未到达，继续缓存避免提前渲染 table header
  if (!firstDataRowTrimmed) return true;
  // 第三行不是表格行，视为当前表格 token 已完成（例如 header-only 表格后接普通文本）
  if (!firstDataRowTrimmed.startsWith('|')) return false;

  const minPipeDelimiterCount = headerCells.length + 1;
  const currentPipeDelimiterCount =
    firstDataRowTrimmed.match(/\|/g)?.length || 0;

  // 管道分隔符数量不足，说明第一行数据还未输入完整
  if (currentPipeDelimiterCount < minPipeDelimiterCount) return true;

  // 第一行数据必须是闭合的管道行（以 | 结尾），否则继续缓存
  if (!firstDataRowTrimmed.endsWith('|')) return true;

  const firstDataRowCells = parsePipeRowCells(firstDataRow);
  if (!firstDataRowCells || firstDataRowCells.length !== headerCells.length) {
    return true;
  }

  return false;
};

const tokenRecognizerMap: Partial<Record<StreamCacheTokenType, Recognizer>> = {
  [StreamCacheTokenType.Link]: {
    tokenType: StreamCacheTokenType.Link,
    isStartOfToken: (md) => md.startsWith('['),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX.link.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Image]: {
    tokenType: StreamCacheTokenType.Image,
    isStartOfToken: (md) => md.startsWith('!'),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX.image.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Html]: {
    tokenType: StreamCacheTokenType.Html,
    isStartOfToken: (md) => md.startsWith('<'),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX.html.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Emphasis]: {
    tokenType: StreamCacheTokenType.Emphasis,
    isStartOfToken: (md) => md.startsWith('*') || md.startsWith('_'),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX.commonEmphasis.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.List]: {
    tokenType: StreamCacheTokenType.List,
    isStartOfToken: (md) => /^[-+*]/.test(md),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX.list.some((re) => re.test(md)),
    getCommitPrefix: (pending) => {
      const listPrefix = pending.match(/^([-+*]\s{0,3})/)?.[1];
      const rest = listPrefix ? pending.slice(listPrefix.length) : '';
      return listPrefix && rest.startsWith('`') ? listPrefix : null;
    },
  },
  [StreamCacheTokenType.Table]: {
    tokenType: StreamCacheTokenType.Table,
    isStartOfToken: (md) => md.startsWith('|'),
    isStreamingValid: isTableIncomplete,
  },
  [StreamCacheTokenType.InlineCode]: {
    tokenType: StreamCacheTokenType.InlineCode,
    isStartOfToken: (md) => md.startsWith('`'),
    isStreamingValid: (md) =>
      STREAM_INCOMPLETE_REGEX['inline-code'].some((re) => re.test(md)),
  },
};

const commitCache = (cache: StreamCache): void => {
  if (cache.pending) {
    cache.completeMarkdown += cache.pending;
    cache.pending = '';
  }
  cache.token = StreamCacheTokenType.Text;
};

const recognize = (
  cache: StreamCache,
  tokenType: StreamCacheTokenType,
): void => {
  const recognizer = tokenRecognizerMap[tokenType];
  if (!recognizer) return;
  const { token, pending } = cache;
  if (
    token === StreamCacheTokenType.Text &&
    recognizer.isStartOfToken(pending)
  ) {
    cache.token = tokenType;
    return;
  }
  if (token === tokenType && !recognizer.isStreamingValid(pending)) {
    const prefix = recognizer.getCommitPrefix?.(pending);
    if (prefix) {
      cache.completeMarkdown += prefix;
      cache.pending = pending.slice(prefix.length);
      cache.token = StreamCacheTokenType.Text;
      return;
    }
    commitCache(cache);
  }
};

const recognizersInOrder: StreamCacheTokenType[] = Object.values(
  tokenRecognizerMap,
)
  .filter((rec): rec is Recognizer => !!rec)
  .map((rec) => rec.tokenType);

// tokenType → recognize 函数：非 Text 分支用，O(1) 查表替代 switch/线性遍历
const recognizerByType = new Map<
  StreamCacheTokenType,
  (cache: StreamCache) => void
>(
  recognizersInOrder.map((tokenType) => [
    tokenType,
    (cache: StreamCache) => recognize(cache, tokenType),
  ]),
);

// 各 recognizer 启动字符，用于 Text 分支 O(1) 候选过滤
const RECOGNIZER_START_CHARS: Partial<
  Record<StreamCacheTokenType, readonly string[]>
> = {
  [StreamCacheTokenType.Link]: ['['],
  [StreamCacheTokenType.Image]: ['!'],
  [StreamCacheTokenType.Html]: ['<'],
  [StreamCacheTokenType.Emphasis]: ['*', '_'],
  [StreamCacheTokenType.List]: ['-', '+', '*'],
  [StreamCacheTokenType.Table]: ['|'],
  [StreamCacheTokenType.InlineCode]: ['`'],
};

// pending 首字符 → 候选 tokenType[]，保持原 Object.values 遍历序避免 `*`
// 这种重叠首字符（Emphasis vs List）改变胜出方
const recognizersByStartChar = (() => {
  const map = new Map<string, StreamCacheTokenType[]>();
  for (const tokenType of recognizersInOrder) {
    const chars = RECOGNIZER_START_CHARS[tokenType];
    if (!chars) continue;
    for (const ch of chars) {
      const list = map.get(ch);
      if (list) list.push(tokenType);
      else map.set(ch, [tokenType]);
    }
  }
  return map;
})();

const tryRecognizeFromText = (cache: StreamCache): void => {
  const firstChar = cache.pending.charAt(0);
  if (!firstChar) return;
  const candidates = recognizersByStartChar.get(firstChar);
  if (!candidates) return;
  for (const tokenType of candidates) {
    recognize(cache, tokenType);
    // recognize 在 Text 分支命中后会把 cache.token 切走；后续 candidate 必然 noop，可提前退出
    if (cache.token !== StreamCacheTokenType.Text) return;
  }
};

const getInitialCache = (): StreamCache => ({
  pending: '',
  token: StreamCacheTokenType.Text,
  processedLength: 0,
  completeMarkdown: '',
  fenceState: { ...INITIAL_FENCE_STATE },
  currentLine: '',
});

const getStreamingOutput = (cache: StreamCache): string => {
  // 围栏内正文留在 pending、不 commit，但仍需交给下游 parse，否则代码块流式阶段 frozen
  const visible = cache.fenceState.inFenced
    ? cache.completeMarkdown + cache.pending
    : cache.completeMarkdown;
  if (visible) return visible;
  if (cache.pending) return STREAMING_LOADING_PLACEHOLDER;
  return '';
};

/** 流式 token 缓存——暂缓不完整的 link/image/table 等，避免 parser 错误解析 */
export const useStreaming = (input: string, enabled: boolean): string => {
  const [output, setOutput] = useState('');
  const cacheRef = useRef<StreamCache>(getInitialCache());

  const processStreaming = useCallback((text: string): void => {
    if (!text) {
      setOutput('');
      cacheRef.current = getInitialCache();
      return;
    }

    const expectedPrefix =
      cacheRef.current.completeMarkdown + cacheRef.current.pending;
    if (!text.startsWith(expectedPrefix)) {
      cacheRef.current = getInitialCache();
    }

    const cache = cacheRef.current;
    const chunk = text.slice(cache.processedLength);
    if (!chunk) return;

    // 非前缀重置后重建围栏状态（全量兜底，仅此处 O(n)）
    if (cache.processedLength === 0 && text.length > 0) {
      const existingText = cache.completeMarkdown + cache.pending;
      if (existingText.length === 0) {
        cache.fenceState = { ...INITIAL_FENCE_STATE };
        cache.currentLine = '';
      }
    }

    cache.processedLength += chunk.length;

    for (const char of chunk) {
      cache.pending += char;

      if (char === '\n') {
        const prevInFenced = cache.fenceState.inFenced;
        cache.fenceState = updateFenceStateForLine(
          cache.fenceState,
          cache.currentLine,
        );
        cache.currentLine = '';

        if (cache.fenceState.inFenced) {
          continue;
        }
        if (prevInFenced && !cache.fenceState.inFenced) {
          commitCache(cache);
          continue;
        }
      } else {
        cache.currentLine += char;
        if (cache.fenceState.inFenced) {
          continue;
        }
      }
      if (cache.token === StreamCacheTokenType.Text) {
        tryRecognizeFromText(cache);
      } else {
        const recognizeForActive = recognizerByType.get(cache.token);
        recognizeForActive?.(cache);
        if (
          (cache.token as StreamCacheTokenType) === StreamCacheTokenType.Text
        ) {
          tryRecognizeFromText(cache);
        }
      }
      if (cache.token === StreamCacheTokenType.Text) {
        commitCache(cache);
      }
    }

    setOutput(getStreamingOutput(cache));
  }, []);

  useEffect(() => {
    if (typeof input !== 'string') {
      setOutput('');
      cacheRef.current = getInitialCache();
      return;
    }
    if (!enabled) {
      setOutput(input);
      cacheRef.current = getInitialCache();
      return;
    }
    processStreaming(input);
  }, [input, enabled, processStreaming]);

  return output;
};
