/**
 * remark 插件：支持 ::: type [title] 容器语法（兼容 markdown-it-container）
 *
 * 语法示例：
 * :::info
 * 这是信息提示块。
 * :::
 *
 * ::: warning 警告标题
 * 这是带标题的警告块。
 * :::
 */
import type { Plugin } from 'unified';

const REGEX_BEGIN = /^\s*:::\s*(\w+)\s*(.*)?/;
const REGEX_END = /^\s*:::$/;

interface RemarkContainerOptions {
  className?: string;
  containerTag?: string;
  titleElement?: Record<string, unknown> | null;
}

const isLiteralNode = (node: any): node is { type: 'text'; value: string } =>
  node && 'value' in node && typeof node.value === 'string';

const isParagraph = (node: any): boolean => node?.type === 'paragraph';

export const remarkContainer: Plugin<[RemarkContainerOptions?]> = (
  options = {},
) => {
  const className = options.className ?? 'markdown-container';
  const containerTag = options.containerTag ?? 'div';
  const titleElement = options.titleElement ?? {
    className: ['markdown-container__title'],
  };

  const constructContainer = (children: any[], type: string) => ({
    type: 'container',
    children,
    data: {
      hName: containerTag,
      hProperties: {
        className: [className, type.toLowerCase()],
      },
    },
  });

  const constructTitle = (title: string) => ({
    type: 'paragraph',
    children: [{ type: 'text', value: title }],
    data: {
      hName: 'div',
      hProperties: {
        className: [`${className}__title`],
        ...(titleElement && { ...titleElement }),
      },
    },
  });

  const transformChildren = (parent: any) => {
    if (!parent?.children) return;

    const children: any[] = [];
    const len = parent.children.length;
    let currentIndex = -1;

    while (currentIndex < len - 1) {
      currentIndex += 1;
      const currentNode = parent.children[currentIndex];
      children.push(currentNode);

      if (!isParagraph(currentNode)) continue;

      const firstChild = currentNode.children?.[0];
      if (!isLiteralNode(firstChild)) continue;

      const match = firstChild.value.match(REGEX_BEGIN);
      if (!match) continue;

      children.pop();
      const beginIndex = currentIndex;
      let innerIndex = currentIndex - 1;

      while (innerIndex < len - 1) {
        innerIndex += 1;
        const innerNode = parent.children[innerIndex];
        if (!isParagraph(innerNode)) continue;

        const innerFirst = innerNode.children?.[0];
        if (!isLiteralNode(innerFirst) || !REGEX_END.test(innerFirst.value))
          continue;

        const [, type, title] = match;
        const containerChildren = parent.children.slice(
          beginIndex + 1,
          innerIndex,
        );

        if (title?.trim() && titleElement !== null) {
          containerChildren.unshift(constructTitle(title.trim()));
        }

        const container = constructContainer(
          containerChildren,
          type?.toLowerCase() ?? 'note',
        );
        children.push(container);
        currentIndex = innerIndex;
        break;
      }
    }

    parent.children = children;
  };

  return (tree: any) => {
    if (tree?.type === 'root') {
      transformChildren(tree);
    }
  };
};

export default remarkContainer;
