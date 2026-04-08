/**
 * remark 插件：将 remark-directive 的 containerDirective 转为与 remarkContainer 相同的 HTML 结构
 * （div.markdown-container + type 类名，可选 title 通过 attributes.title）
 *
 * 依赖 remark-directive 解析，语法示例：
 * :::info
 * 这是信息提示块。
 * :::
 *
 * :::warning{title="警告标题"}
 * 这是带标题的警告块。
 * :::
 */
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface RemarkDirectiveContainerOptions {
  className?: string;
  containerTag?: string;
  titleElement?: Record<string, unknown> | null;
}

const DEFAULT_CLASS_NAME = 'markdown-container';
const DEFAULT_CONTAINER_TAG = 'div';
const TITLE_CLASS_NAME = 'markdown-container__title';

function createTitleParagraph(
  title: string,
  titleProps: Record<string, unknown>,
) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', value: title }],
    data: {
      hName: 'div',
      hProperties: {
        className: [TITLE_CLASS_NAME],
        ...titleProps,
      },
    },
  };
}

export const remarkDirectiveContainer: Plugin<
  [RemarkDirectiveContainerOptions?]
> = (options = {}) => {
  const className = options.className ?? DEFAULT_CLASS_NAME;
  const containerTag = options.containerTag ?? DEFAULT_CONTAINER_TAG;
  const titleElement = options.titleElement ?? {
    className: [TITLE_CLASS_NAME],
  };
  const titleProps =
    titleElement && typeof titleElement === 'object'
      ? (titleElement as Record<string, unknown>)
      : { className: [TITLE_CLASS_NAME] };

  return (tree: any) => {
    visit(tree, 'containerDirective', (node: any) => {
      const name = node.name?.toLowerCase() ?? 'note';
      const attrs = node.attributes ?? {};
      const title =
        typeof attrs.title === 'string'
          ? attrs.title
          : attrs.title
            ? String(attrs.title)
            : undefined;

      const data = node.data ?? (node.data = {});
      data.hName = containerTag;
      data.hProperties = {
        className: [className, name],
      };

      if (title?.trim()) {
        const titleNode = createTitleParagraph(title.trim(), titleProps);
        if (Array.isArray(node.children)) {
          node.children.unshift(titleNode);
        } else {
          node.children = [titleNode];
        }
      }
    });
  };
};

export default remarkDirectiveContainer;
