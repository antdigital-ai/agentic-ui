import { Editor, Node, Path } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * 行内节点类型集合
 */
export const inlineNode = new Set(['break', 'inline-katex']);

/**
 * 空节点类型集合
 */
export const voidNode = new Set(['hr', 'break']);

/**
 * 检查编辑器是否包含有效的范围
 * @param editor - Slate编辑器实例
 * @param range - 要检查的范围
 * @returns 如果范围有效则返回true
 */
export function hasRange(
  editor: Editor,
  range: { anchor: any; focus: any },
): boolean {
  const { anchor, focus } = range;
  return (
    Editor.hasPath(editor, anchor.path) && Editor.hasPath(editor, focus.path)
  );
}

/**
 * 清空卡片区域的文本内容 - 使用零宽字符替换
 * @param editor - Slate编辑器实例
 * @param path - 要清空的节点路径
 */
export const clearCardAreaText = (editor: Editor, path: Path) => {
  try {
    const node = Node.get(editor, path);
    if (node) {
      // 尝试直接DOM操作，设置为零宽字符
      try {
        const domNode = ReactEditor.toDOMNode(editor, node);

        if (domNode) {
          const zeroWidthNode = domNode?.querySelector(
            '[data-slate-zero-width]',
          );
          if (zeroWidthNode) {
            zeroWidthNode.textContent = '\uFEFF';
          }
        }
      } catch (domError) {
        // DOM operation failed, falling back to Slate transforms
      }
    }
  } catch (error) {
    // 如果操作失败，忽略错误
  }
};

/**
 * 检查卡片是否为空
 * @param cardNode - 卡片节点
 * @returns 如果卡片为空则返回true
 */
export const isCardEmpty = (cardNode: any): boolean => {
  if (!cardNode || cardNode.type !== 'card' || !cardNode.children) {
    return false;
  }

  // 查找实际内容节点（非card-before和card-after的节点）
  const contentNodes = cardNode.children.filter(
    (child: any) => child.type !== 'card-before' && child.type !== 'card-after',
  );

  // 如果没有内容节点，则为空
  if (contentNodes.length === 0) {
    return true;
  }

  // 检查内容节点是否为空
  return contentNodes.every((node: any) => {
    if (!node.children || node.children.length === 0) {
      return true;
    }
    // 检查是否只包含空文本
    return node.children.every((child: any) => {
      return child.text === '' || (child.text && child.text.trim() === '');
    });
  });
};
