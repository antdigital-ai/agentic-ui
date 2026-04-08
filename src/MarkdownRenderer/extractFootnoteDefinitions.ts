import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/** 与 `fncProps.onFootnoteDefinitionChange` 数组元素一致 */
export interface FootnoteDefinitionRow {
  id: any;
  placeholder: any;
  origin_text: any;
  url: any;
  origin_url: any;
}

const mdastFootnoteProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm, { singleTilde: false });

const mdastPlainText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) {
    return node.children.map(mdastPlainText).join('');
  }
  return '';
};

/**
 * 从 Markdown 源码提取 GFM 脚注定义，结构与 Slate 只读 Editor 中
 * `fncProps.onFootnoteDefinitionChange` 入参对齐。
 */
export const extractFootnoteDefinitionsFromMarkdown = (
  content: string,
): FootnoteDefinitionRow[] => {
  if (!content?.trim()) return [];
  try {
    const tree = mdastFootnoteProcessor.parse(content) as any;
    const list: FootnoteDefinitionRow[] = [];
    visit(tree, 'footnoteDefinition', (node: any) => {
      list.push({
        id: node.identifier,
        placeholder: node.label ?? node.identifier,
        origin_text: mdastPlainText({ children: node.children }),
        url: undefined,
        origin_url: undefined,
      });
    });
    return list;
  } catch {
    return [];
  }
};
