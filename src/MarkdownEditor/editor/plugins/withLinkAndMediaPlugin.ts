import { Editor, Node, Operation, Path, Transforms } from 'slate';

/**
 * 处理链接卡片和媒体相关节点的操作
 *
 * @param editor - Slate编辑器实例
 * @param operation - 要处理的操作
 * @returns 如果操作被处理则返回true，否则返回false
 *
 * @description
 * 处理以下链接和媒体相关操作:
 * - 拆分链接卡片或媒体节点 (split_node)
 * - 删除链接卡片内的节点 (remove_node)
 */
const handleLinkAndMediaOperation = (
  editor: Editor,
  operation: Operation,
): boolean => {
  if (
    operation.type === 'split_node' &&
    (operation.properties?.type === 'link-card' ||
      operation.properties?.type === 'media')
  ) {
    const node = Node.get(editor, operation.path);
    if (['link-card', 'media'].includes(node?.type)) {
      Transforms.insertNodes(
        editor,
        [
          {
            type: 'paragraph',
            children: [{ text: '', p: 'true' }],
          },
        ],
        {
          at: Path.next([operation.path.at(0)!]),
          select: true,
        },
      );
    }
    return true;
  }

  if (operation.type === 'remove_node') {
    const parentNode = Node.get(editor, Path.parent(operation.path));
    if ('link-card' === parentNode.type) {
      Transforms.removeNodes(editor, {
        at: Path.parent(operation.path),
      });
      return true;
    }
  }

  return false;
};

/**
 * 扩展编辑器以处理链接卡片和媒体节点的操作
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够处理链接和媒体相关操作
 *
 * @description
 * 该插件重写编辑器的 `apply` 方法，添加对链接卡片和媒体节点的特殊处理逻辑。
 */
export const withLinkAndMediaPlugin = (editor: Editor) => {
  const { apply } = editor;

  editor.apply = (operation: Operation) => {
    // 尝试处理链接和媒体相关操作
    if (handleLinkAndMediaOperation(editor, operation)) {
      return;
    }

    // 否则执行原始操作
    apply(operation);
  };

  return editor;
};
