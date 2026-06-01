import { visit } from 'unist-util-visit';

/** 匹配文本中残留的 `[^name]` 形式脚注引用 */
const FOOTNOTE_REF_PATTERN = /\[\^([^\]]+)\]/g;

/**
 * rehype 插件：将文本中残留的 `[^N]` 模式转为 fnc 标记元素。
 *
 * `remark-gfm` 只在有对应 `footnoteDefinition` 时才会转换 `footnoteReference`，
 * 但 AI 对话场景中 `[^1]` 常被用作内联引用（无底部定义）。
 *
 * 此插件在 hast 层面补充处理这些"裸引用"——将其包成
 * `<span data-fnc="fnc" data-fnc-name="N">N</span>`，
 * 配合 `markdownReactShared` 中的 `span` 渲染器即可统一显示为脚注链接。
 */
export const rehypeFootnoteRef = () => {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      const value = node.value as string;
      if (!FOOTNOTE_REF_PATTERN.test(value)) return;

      FOOTNOTE_REF_PATTERN.lastIndex = 0;
      const children: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = FOOTNOTE_REF_PATTERN.exec(value)) !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          });
        }
        children.push({
          type: 'element',
          tagName: 'span',
          properties: {
            'data-fnc': 'fnc',
            'data-fnc-name': match[1],
          },
          children: [{ type: 'text', value: match[1] }],
        });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
        return index + children.length;
      }
    });
  };
};
