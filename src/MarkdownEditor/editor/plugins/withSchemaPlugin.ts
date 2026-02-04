import { Editor, Node, Operation, Path, Transforms } from 'slate';

/**
 * 处理schema相关节点的操作
 *
 * @param editor - Slate编辑器实例
 * @param operation - 要处理的操作
 * @returns 如果操作被处理则返回true，否则返回false
 *
 * @description
 * 处理以下schema相关操作:
 * - 拆分schema节点 (split_node)，在拆分点之后插入新的段落节点
 */
const handleSchemaOperation = (
  editor: Editor,
  operation: Operation,
): boolean => {
  if (
    operation.type === 'split_node' &&
    operation.properties?.type === 'schema'
  ) {
    const node = Node.get(editor, operation.path);
    if (node?.type === 'schema') {
      Transforms.insertNodes(
        editor,
        [
          {
            type: 'paragraph',
            children: [{ text: '', p: 'true' }],
          },
        ],
        {
          at: Path.next(operation.path),
          select: true,
        },
      );
    }
    return true;
  }

  return false;
};

/**
 * 扩展编辑器以处理schema节点的操作
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够处理schema相关操作
 *
 * @description
 * 该插件重写编辑器的 `apply` 方法，添加对schema节点的特殊处理逻辑。
 */
export const withSchemaPlugin = (editor: Editor) => {
  const { apply } = editor;

  editor.apply = (operation: Operation) => {
    // 尝试处理schema相关操作
    if (handleSchemaOperation(editor, operation)) {
      return;
    }

    // 否则执行原始操作
    apply(operation);
  };

  return editor;
};
