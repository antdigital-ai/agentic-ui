import { Editor, Element, Node, NodeEntry, Transforms } from 'slate';
import { BulletedListNode, NumberedListNode } from '../../el';

/**
 * 判断节点是否为列表类型
 */
export const isListType = (
  node: any,
): node is BulletedListNode | NumberedListNode => {
  return (
    Element.isElement(node) &&
    (node.type === 'bulleted-list' || node.type === 'numbered-list')
  );
};

/**
 * 根据 order 属性返回列表类型
 */
export const getListType = (
  order?: boolean,
): 'bulleted-list' | 'numbered-list' => {
  return order ? 'numbered-list' : 'bulleted-list';
};

/**
 * 扩展编辑器以处理列表节点的规范化
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够规范化列表结构
 *
 * @description
 * 该插件重写编辑器的 `normalizeNode` 方法，确保列表结构符合规范：
 * - `bulleted-list` 和 `numbered-list` 的直接子节点必须是 `list-item`
 * - `list-item` 的第一个子节点应该是块级元素（如 `paragraph`）
 * - 自动修复不符合规范的结构
 */
export const withListsPlugin = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    // 规则 1: 列表节点的直接子节点必须是 list-item
    if (isListType(node)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type !== 'list-item') {
          // 将非 list-item 节点转换为 list-item
          Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath });
          return;
        }
      }
    }

    // 规则 2: list-item 的子节点结构规范化
    if (Element.isElement(node) && node.type === 'list-item') {
      // 确保 list-item 至少有一个子节点
      if (node.children.length === 0) {
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [...path, 0] },
        );
        return;
      }

      // 确保第一个子节点是块级元素（paragraph 或其他块级元素）
      const firstChild = node.children[0];
      if (
        Element.isElement(firstChild) &&
        !Editor.isBlock(editor, firstChild) &&
        firstChild.type !== 'paragraph'
      ) {
        // 如果不是块级元素，包裹为 paragraph
        Transforms.wrapNodes(
          editor,
          { type: 'paragraph', children: [] },
          { at: [...path, 0] },
        );
        return;
      }

      // 确保 list-item 的子节点中，除了第一个块级元素外，其他都是列表类型
      // 允许的结构: [paragraph, bulleted-list?, numbered-list?]
      for (let i = 1; i < node.children.length; i++) {
        const child = node.children[i];
        if (Element.isElement(child)) {
          if (!isListType(child)) {
            // 如果不是列表类型，且不是第一个块级元素，需要处理
            // 如果它是块级元素，应该移到前面或转换为列表
            if (Editor.isBlock(editor, child)) {
              // 将块级元素包裹为新的 list-item，并创建新的列表
              const listType = getListType();
              Transforms.wrapNodes(
                editor,
                {
                  type: 'list-item',
                  checked: undefined,
                  mentions: [],
                  id: '',
                  children: [],
                },
                { at: [...path, i] },
              );
              Transforms.wrapNodes(
                editor,
                {
                  type: listType,
                  children: [],
                },
                { at: [...path, i] },
              );
              return;
            }
          }
        }
      }
    }

    // 规则 3: 向后兼容 - 将旧的 'list' 类型转换为新类型
    if (Element.isElement(node) && node.type === 'list') {
      const listType = getListType((node as any).order);
      Transforms.setNodes(editor, { type: listType }, { at: path });
      // 移除 order 属性（已由类型表示）
      if ((node as any).order !== undefined) {
        Transforms.unsetNodes(editor, 'order', { at: path });
      }
      return;
    }

    // 执行原始的规范化逻辑
    normalizeNode(entry);
  };

  return editor;
};
