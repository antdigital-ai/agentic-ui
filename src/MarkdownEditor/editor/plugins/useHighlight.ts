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

const processJinjaMatches = (
  text: string,
  path: Path,
  childIndex: number,
): any[] => {
  const ranges: any[] = [];
  const collect = (reg: RegExp, prop: string) => {
    reg.lastIndex = 0;
    let match: RegExpMatchArray | null;
    while ((match = reg.exec(text)) !== null) {
      const index = match.index;
      if (typeof index === 'number') {
        ranges.push(
          createRange(path, childIndex, index, match[0].length, {
            [prop]: true,
          }),
        );
      }
    }
  };
  collect(JINJA_VARIABLE_REG, 'jinjaVariable');
  collect(JINJA_TAG_REG, 'jinjaTag');
  collect(JINJA_COMMENT_REG, 'jinjaComment');
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

          if (jinjaEnabled && child.text && !EditorUtils.isDirtLeaf(child)) {
            allTextRanges.push(...processJinjaMatches(child.text, path, i));
          }
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
