import { useCallback, useEffect, useRef, useState } from 'react';

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
}

interface Recognizer {
  tokenType: StreamCacheTokenType;
  isStartOfToken: (markdown: string) => boolean;
  isStreamingValid: (markdown: string) => boolean;
  getCommitPrefix?: (pending: string) => string | null;
}

const STREAM_INCOMPLETE_REGEX = {
  image: [/^!\[[^\]\r\n]{0,1000}$/, /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/],
  link: [/^\[[^\]\r\n]{0,1000}$/, /^\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/],
  html: [/^<\/$/, /^<\/?[a-zA-Z][a-zA-Z0-9-]{0,100}[^>\r\n]{0,1000}$/],
  commonEmphasis: [/^(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/],
  list: [/^[-+*]\s{0,3}$/, /^[-+*]\s{1,3}(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/],
  'inline-code': [/^`[^`\r\n]{0,300}$/],
} as const;

const isTableIncomplete = (markdown: string) => {
  if (markdown.includes('\n\n')) return false;
  const lines = markdown.split('\n');
  if (lines.length <= 1) return true;
  const [header, separator] = lines;
  if (!/^\|.*\|$/.test(header.trim())) return false;
  const columns = separator.trim().split('|').map((c) => c.trim()).filter(Boolean);
  return columns.every((col, i) =>
    i === columns.length - 1
      ? col === ':' || /^:?-+:?$/.test(col)
      : /^:?-+:?$/.test(col),
  );
};

const tokenRecognizerMap: Partial<Record<StreamCacheTokenType, Recognizer>> = {
  [StreamCacheTokenType.Link]: {
    tokenType: StreamCacheTokenType.Link,
    isStartOfToken: (md) => md.startsWith('['),
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX.link.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Image]: {
    tokenType: StreamCacheTokenType.Image,
    isStartOfToken: (md) => md.startsWith('!'),
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX.image.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Html]: {
    tokenType: StreamCacheTokenType.Html,
    isStartOfToken: (md) => md.startsWith('<'),
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX.html.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.Emphasis]: {
    tokenType: StreamCacheTokenType.Emphasis,
    isStartOfToken: (md) => md.startsWith('*') || md.startsWith('_'),
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX.commonEmphasis.some((re) => re.test(md)),
  },
  [StreamCacheTokenType.List]: {
    tokenType: StreamCacheTokenType.List,
    isStartOfToken: (md) => /^[-+*]/.test(md),
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX.list.some((re) => re.test(md)),
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
    isStreamingValid: (md) => STREAM_INCOMPLETE_REGEX['inline-code'].some((re) => re.test(md)),
  },
};

const commitCache = (cache: StreamCache): void => {
  if (cache.pending) {
    cache.completeMarkdown += cache.pending;
    cache.pending = '';
  }
  cache.token = StreamCacheTokenType.Text;
};

const recognize = (cache: StreamCache, tokenType: StreamCacheTokenType): void => {
  const recognizer = tokenRecognizerMap[tokenType];
  if (!recognizer) return;
  const { token, pending } = cache;
  if (token === StreamCacheTokenType.Text && recognizer.isStartOfToken(pending)) {
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

const recognizeHandlers = Object.values(tokenRecognizerMap).map((rec) => ({
  tokenType: rec!.tokenType,
  recognize: (cache: StreamCache) => recognize(cache, rec!.tokenType),
}));

const getInitialCache = (): StreamCache => ({
  pending: '',
  token: StreamCacheTokenType.Text,
  processedLength: 0,
  completeMarkdown: '',
});

const isInCodeBlock = (text: string, isFinalChunk = false): boolean => {
  const lines = text.split('\n');
  let inFenced = false;
  let fenceChar = '';
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].endsWith('\r') ? lines[i].slice(0, -1) : lines[i];
    const match = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (match) {
      const fence = match[1];
      const after = match[2];
      const char = fence[0];
      const len = fence.length;
      if (!inFenced) {
        inFenced = true;
        fenceChar = char;
        fenceLen = len;
      } else {
        const isValidEnd = char === fenceChar && len >= fenceLen && /^\s*$/.test(after);
        if (isValidEnd && (isFinalChunk || i < lines.length - 1)) {
          inFenced = false;
          fenceChar = '';
          fenceLen = 0;
        }
      }
    }
  }
  return inFenced;
};

/**
 * 流式 Markdown 缓存 hook。
 *
 * 逐字符扫描输入，识别不完整的 Markdown token（link、image、table、emphasis 等），
 * 将已完成的内容输出，不完整的部分暂缓，避免 parser 错误解析。
 *
 * @param input - 完整的 markdown 内容（持续增长）
 * @param enabled - 是否启用流式缓存（非流式直接透传）
 * @returns 安全的可解析 markdown 字符串
 */
export const useStreaming = (input: string, enabled: boolean): string => {
  const [output, setOutput] = useState('');
  const cacheRef = useRef<StreamCache>(getInitialCache());

  const processStreaming = useCallback((text: string): void => {
    if (!text) {
      setOutput('');
      cacheRef.current = getInitialCache();
      return;
    }

    const expectedPrefix = cacheRef.current.completeMarkdown + cacheRef.current.pending;
    if (!text.startsWith(expectedPrefix)) {
      cacheRef.current = getInitialCache();
    }

    const cache = cacheRef.current;
    const chunk = text.slice(cache.processedLength);
    if (!chunk) return;

    cache.processedLength += chunk.length;
    for (const char of chunk) {
      cache.pending += char;
      if (isInCodeBlock(cache.completeMarkdown + cache.pending)) {
        commitCache(cache);
        continue;
      }
      if (cache.token === StreamCacheTokenType.Text) {
        for (const handler of recognizeHandlers) handler.recognize(cache);
      } else {
        const handler = recognizeHandlers.find((h) => h.tokenType === cache.token);
        handler?.recognize(cache);
        if ((cache.token as StreamCacheTokenType) === StreamCacheTokenType.Text) {
          for (const h of recognizeHandlers) h.recognize(cache);
        }
      }
      if (cache.token === StreamCacheTokenType.Text) {
        commitCache(cache);
      }
    }

    setOutput(cache.completeMarkdown);
  }, []);

  useEffect(() => {
    if (typeof input !== 'string') {
      setOutput('');
      return;
    }
    enabled ? processStreaming(input) : setOutput(input);
  }, [input, enabled, processStreaming]);

  return output;
};
