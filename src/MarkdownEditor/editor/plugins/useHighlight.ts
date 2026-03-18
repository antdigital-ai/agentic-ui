import { Editor, Element, Node, NodeEntry, Path, Range } from 'slate';
import { EditorStore } from '../store';
import { EditorUtils } from '../utils/editorUtils';

// 预编译正则表达式，避免重复创建
const HTML_REG = /<[a-z]+[\s"'=:;()\w\-[\]/.]*\/?>(.*<\/[a-z]+>:?)?/g;
const LINK_REG =
  /(https?|ftp):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/gi;
const FOOTNOTE_REG = /\[\^[^\]]+\]/g;
const TABLE_ROW_REG = /^\|([^|]+\|)+$/;
/** 至少一个非 } 字符，避免匹配 {{}}、{{ 等不完整表达式 */
const JINJA_VARIABLE_REG = /\{\{[^}]+\}\}/g;
/** 至少一个非 % 字符，避免匹配 {%%} */
const JINJA_TAG_REG = /\{%[^%]+%\}/g;
/** 单行内注释，避免跨多行高亮造成大段误匹配（编辑器场景） */
const JINJA_COMMENT_REG = /\{#[^\n]*?#\}/g;

export const cacheTextNode = new WeakMap<
  object,
  { path: Path; range: Range[] }
>();

export const clearInlineKatex = (editor: Editor) => {
  const inlineMath = Array.from<any>(
    Editor.nodes(editor, {
      match: (n) => n.type === 'inline-katex',
      at: [],
    }),
  );
  inlineMath.forEach((c) => cacheTextNode.delete(c[0]));
};

const PARAGRAPH_TYPES = new Set(['paragraph', 'table-cell', 'head']);
const highlightNodes = new Set([
  'paragraph',
  'table-cell',
  'table',
  'code',
  'head',
  'inline-katex',
]);

// 创建 range 对象的工厂函数，复用 path 数组
const createRange = (
  path: Path,
  childIndex: number,
  offset: number,
  length: number,
  props: Record<string, any> = {},
) => {
  const childPath = path.concat(childIndex);
  return {
    anchor: { path: childPath, offset },
    focus: { path: childPath, offset: offset + length },
    ...props,
  };
};

/** 创建可跨子节点的 range（用于 Jinja 等可能被 inline code 分割的匹配） */
const createRangeSpanningChildren = (
  path: Path,
  children: { text?: string }[],
  globalStart: number,
  globalEnd: number,
  props: Record<string, any> = {},
) => {
  let offset = 0;
  let anchorPath: Path | null = null;
  let anchorOffset = 0;
  let focusPath: Path | null = null;
  let focusOffset = 0;

  for (let i = 0; i < children.length; i++) {
    const text = children[i]?.text ?? '';
    const len = text.length;
    const childStart = offset;
    const childEnd = offset + len;

    if (globalStart < childEnd && anchorPath === null) {
      anchorPath = path.concat(i);
      anchorOffset = Math.max(0, globalStart - childStart);
    }
    if (globalEnd <= childEnd && focusPath === null) {
      focusPath = path.concat(i);
      focusOffset = Math.min(len, globalEnd - childStart);
      break;
    }
    offset = childEnd;
  }

  if (anchorPath && focusPath) {
    return {
      anchor: { path: anchorPath, offset: anchorOffset },
      focus: { path: focusPath, offset: focusOffset },
      ...props,
    };
  }
  return null;
};

// 处理文本节点的匹配逻辑
const processTextMatches = (
  text: string,
  path: Path,
  childIndex: number,
): any[] => {
  const ranges: any[] = [];

  // 匹配 footnote reference
  let match: RegExpMatchArray | null;
  FOOTNOTE_REG.lastIndex = 0;
  while ((match = FOOTNOTE_REG.exec(text)) !== null) {
    const index = match.index;
    if (typeof index === 'number') {
      ranges.push(
        createRange(path, childIndex, index, match[0].length, {
          fnc: true,
          fnd: false,
        }),
      );
    }
  }

  // 匹配 HTML
  HTML_REG.lastIndex = 0;
  while ((match = HTML_REG.exec(text)) !== null) {
    const index = match.index;
    if (typeof index === 'number') {
      ranges.push(
        createRange(path, childIndex, index, match[0].length, {
          html: true,
        }),
      );
    }
  }

  return ranges;
};

// 处理链接匹配
const processLinkMatches = (
  text: string,
  path: Path,
  childIndex: number,
): any[] => {
  const ranges: any[] = [];
  let match: RegExpMatchArray | null;

  LINK_REG.lastIndex = 0;
  while ((match = LINK_REG.exec(text)) !== null) {
    const index = match.index;
    if (typeof index === 'number') {
      ranges.push(
        createRange(path, childIndex, index, match[0].length, {
          link: match[0],
        }),
      );
    }
  }

  return ranges;
};

/** Jinja 关键字集合 */
const JINJA_KEYWORDS = new Set([
  'set',
  'if',
  'elif',
  'else',
  'endif',
  'for',
  'endfor',
  'in',
  'and',
  'or',
  'not',
  'with',
  'without',
  'true',
  'false',
  'is',
  'none',
]);

/** 解析 {% %} 标签内部内容，返回子 token 的 [start, end, prop][] */
const tokenizeJinjaTagContent = (
  content: string,
  baseOffset: number,
): Array<{ start: number; end: number; prop: string }> => {
  const tokens: Array<{ start: number; end: number; prop: string }> = [];
  let pos = 0;

  const addToken = (len: number, prop: string) => {
    if (len > 0) {
      tokens.push({
        start: baseOffset + pos,
        end: baseOffset + pos + len,
        prop,
      });
      pos += len;
    }
  };

  while (pos < content.length) {
    const rest = content.slice(pos);

    // 占位符 $(xxx:yyy)
    const placeholderMatch = rest.match(/^\$\([^)]+\)/);
    if (placeholderMatch) {
      addToken(placeholderMatch[0].length, 'jinjaPlaceholder');
      continue;
    }

    // 字符串 '...' 或 "..."
    const singleStrMatch = rest.match(/^'([^'\\]|\\.)*'/);
    const doubleStrMatch = rest.match(/^"([^"\\]|\\.)*"/);
    const strMatch = singleStrMatch || doubleStrMatch;
    if (strMatch) {
      addToken(strMatch[0].length, 'jinjaString');
      continue;
    }

    // 数字（含小数）
    const numMatch = rest.match(/^\d+(\.\d+)?/);
    if (numMatch) {
      addToken(numMatch[0].length, 'jinjaNumber');
      continue;
    }

    // 过滤器 | name
    const filterMatch = rest.match(/^\|\s*[a-zA-Z_][a-zA-Z0-9_]*/);
    if (filterMatch) {
      addToken(filterMatch[0].length, 'jinjaFilter');
      continue;
    }

    // 关键字（需与标识符区分）
    const wordMatch = rest.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      addToken(
        word.length,
        JINJA_KEYWORDS.has(word) ? 'jinjaKeyword' : 'jinjaVariableName',
      );
      continue;
    }

    // 比较运算符（多字符优先）
    if (
      rest.startsWith('==') ||
      rest.startsWith('!=') ||
      rest.startsWith('>=') ||
      rest.startsWith('<=')
    ) {
      addToken(2, 'jinjaDelimiter');
      continue;
    }
    if ('=<>'.includes(rest[0])) {
      addToken(1, 'jinjaDelimiter');
      continue;
    }

    // 其他符号或空格：作为 jinjaDelimiter（括括号等）或跳过
    pos += 1;
  }
  return tokens;
};

/** 解析 {{ }} 变量块内部，返回子 token（变量名、过滤器、占位符） */
const tokenizeJinjaVariableContent = (
  content: string,
  baseOffset: number,
): Array<{ start: number; end: number; prop: string }> => {
  const tokens: Array<{ start: number; end: number; prop: string }> = [];
  let i = 0;

  while (i < content.length) {
    const rest = content.slice(i);
    const ph = rest.match(/^\$\([^)]+\)/);
    if (ph) {
      tokens.push({
        start: baseOffset + i,
        end: baseOffset + i + ph[0].length,
        prop: 'jinjaPlaceholder',
      });
      i += ph[0].length;
      continue;
    }
    const flt = rest.match(/^\|\s*[a-zA-Z_][a-zA-Z0-9_]*/);
    if (flt) {
      tokens.push({
        start: baseOffset + i,
        end: baseOffset + i + flt[0].length,
        prop: 'jinjaFilter',
      });
      i += flt[0].length;
      continue;
    }
    const word = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_]*/);
    if (word) {
      tokens.push({
        start: baseOffset + i,
        end: baseOffset + i + word[0].length,
        prop: 'jinjaVariableName',
      });
      i += word[0].length;
      continue;
    }
    i += 1;
  }
  return tokens;
};

/** 在整段文本上匹配 Jinja，支持被 inline code 分割的语法（如 {% if `x` %}） */
const processJinjaMatchesOnFullText = (
  fullText: string,
  path: Path,
  children: { text?: string }[],
): any[] => {
  const ranges: any[] = [];

  const addRange = (start: number, end: number, prop: string) => {
    const range = createRangeSpanningChildren(path, children, start, end, {
      [prop]: true,
    });
    if (range) ranges.push(range);
  };

  // 注释：整块灰色
  JINJA_COMMENT_REG.lastIndex = 0;
  let match: RegExpMatchArray | null;
  while ((match = JINJA_COMMENT_REG.exec(fullText)) !== null) {
    const start = match.index;
    const matched = match[0];
    if (typeof start === 'number' && matched) {
      addRange(start, start + matched.length, 'jinjaComment');
    }
  }

  // 变量 {{ }}：细粒度高亮
  JINJA_VARIABLE_REG.lastIndex = 0;
  while ((match = JINJA_VARIABLE_REG.exec(fullText)) !== null) {
    const start = match.index;
    const matched = match[0];
    if (typeof start !== 'number' || !matched) continue;
    const openLen = 2; // {{
    const closeLen = 2; // }}
    const innerStart = start + openLen;
    const innerEnd = start + matched.length - closeLen;
    const innerContent = matched.slice(openLen, matched.length - closeLen);

    addRange(start, innerStart, 'jinjaDelimiter');
    const varTokens = tokenizeJinjaVariableContent(innerContent, innerStart);
    if (varTokens.length > 0) {
      varTokens.forEach((t) => addRange(t.start, t.end, t.prop));
    } else if (innerContent.trim()) {
      addRange(innerStart, innerEnd, 'jinjaVariableName');
    }
    addRange(innerEnd, start + matched.length, 'jinjaDelimiter');
  }

  // 标签 {% %}：细粒度高亮
  JINJA_TAG_REG.lastIndex = 0;
  while ((match = JINJA_TAG_REG.exec(fullText)) !== null) {
    const start = match.index;
    const matched = match[0];
    if (typeof start !== 'number' || !matched) continue;
    const openLen = 2; // {%
    const closeLen = 2; // %}
    const innerStart = start + openLen;
    const innerEnd = start + matched.length - closeLen;
    const innerContent = matched.slice(openLen, matched.length - closeLen);

    addRange(start, innerStart, 'jinjaDelimiter');
    const tagTokens = tokenizeJinjaTagContent(innerContent, innerStart);
    tagTokens.forEach((t) => addRange(t.start, t.end, t.prop));
    addRange(innerEnd, start + matched.length, 'jinjaDelimiter');
  }

  return ranges;
};

export function useHighlight(store?: EditorStore, jinjaEnabled?: boolean) {
  return ([node, path]: NodeEntry): Range[] => {
    // 快速路径：非元素节点或不在高亮节点列表中
    if (!Element.isElement(node) || !highlightNodes.has(node.type)) {
      return [];
    }

    const ranges = store?.highlightCache.get(node) || [];
    const cacheText = cacheTextNode.get(node);
    const isCached = cacheText && Path.equals(cacheText.path, path);

    // 处理 paragraph 和 table-cell
    if (PARAGRAPH_TYPES.has(node.type)) {
      if (isCached) {
        ranges.push(...cacheText.range);
      } else {
        const allTextRanges: any[] = [];
        const children = node.children;
        const childrenLength = children.length;

        const fullText = Node.string(node);

        for (let i = 0; i < childrenLength; i++) {
          const child = children[i];

          // 处理 footnote 和 HTML
          if (child.text && !EditorUtils.isDirtLeaf(child)) {
            allTextRanges.push(...processTextMatches(child.text, path, i));
          }

          // 处理链接
          if (child.text && !child.url && !child.docId && !child.hash) {
            allTextRanges.push(...processLinkMatches(child.text, path, i));
          }
        }

        // Jinja 在整段文本上匹配，支持 {% if `x` %} 等被 inline code 分割的语法
        if (jinjaEnabled && fullText) {
          allTextRanges.push(
            ...processJinjaMatchesOnFullText(fullText, path, children),
          );
        }

        // 统一缓存
        cacheTextNode.set(node, { path, range: allTextRanges });
        ranges.push(...allTextRanges);
      }
    }

    // 处理特殊段落（代码块或表格行）
    if (
      node.type === 'paragraph' &&
      node.children.length === 1 &&
      !EditorUtils.isDirtLeaf(node.children[0])
    ) {
      if (isCached) {
        ranges.push(...cacheText.range);
      } else {
        const str = Node.string(node);
        const strLength = str.length;

        if (str.startsWith('```')) {
          const range = createRange(path, 0, 0, 3, { color: '#a3a3a3' });
          ranges.push(range);
          cacheTextNode.set(node, { path, range: [range] });
        } else if (TABLE_ROW_REG.test(str)) {
          const range = createRange(path, 0, 0, strLength, {
            color: '#a3a3a3',
          });
          ranges.push(range);
          cacheTextNode.set(node, { path, range: [range] });
        }
      }
    }

    return ranges;
  };
}
