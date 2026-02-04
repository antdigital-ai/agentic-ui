import { Editor, Node, Operation, Path, Range, Transforms } from 'slate';
import { hasRange } from './utils';

/**
 * 处理代码和标签相关节点的操作
 *
 * @param editor - Slate编辑器实例
 * @param operation - 要处理的操作
 * @param apply - 原始的apply函数
 * @returns 如果操作被处理则返回true，否则返回false
 *
 * @description
 * 处理以下代码和标签相关操作:
 * - 删除文本 (remove_text)，处理特殊触发文本和空标签
 * - 删除节点 (remove_node)，处理代码块周围的空格
 * - 插入文本 (insert_text)，处理代码块中的空格插入
 */
const handleCodeTagOperation = (
  editor: Editor,
  operation: Operation,
  apply: (op: Operation) => void,
): boolean => {
  if (operation.type === 'remove_text') {
    const currentNode = Node.get(editor, operation.path);

    if (currentNode?.tag) {
      // 处理空标签的删除
      if (currentNode.text?.trim() === '') {
        Editor.withoutNormalizing(editor, () => {
          Transforms.setNodes(
            editor,
            { tag: false, code: false, text: ' ', triggerText: undefined },
            { at: operation.path },
          );
        });
        return true;
      }

      if (currentNode.text === operation.text) {
        Editor.withoutNormalizing(editor, () => {
          Transforms.removeNodes(editor, { at: operation.path });
          Transforms.insertNodes(
            editor,
            { ...currentNode, tag: true, code: true, text: ' ' },
            { at: operation.path, select: true },
          );
        });
        return true;
      }
      // 光标在 tag 内部，执行原始的删除操作
      apply(operation);
      return true;
    }
  }

  if (operation.type === 'insert_text') {
    const currentNode = Node.get(editor, operation.path);
    if (
      currentNode?.tag &&
      operation.text === ' ' &&
      editor.selection?.focus.offset === currentNode.text.length
    ) {
      // 检查前一个字符是否是空格
      const lastChar = currentNode.text.charAt(currentNode.text.length - 1);
      if (lastChar === ' ') {
        // 如果前一个输入是空格，且当前输入也是空格，则插入一个空格到 tag 节点外
        Transforms.insertNodes(editor, [{ text: ' ' }]);
        return true;
      }
    }

    if (
      currentNode?.tag &&
      operation.text.trim().length > 0 &&
      currentNode.text.trim().length === 0
    ) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(editor, { at: operation.path });
        Transforms.insertNodes(
          editor,
          { ...currentNode, tag: true, code: true, text: operation.text },
          { at: operation.path, select: true },
        );
      });
      return true;
    }
  }

  if (operation.type === 'split_node') {
    const node = Node.get(editor, operation.path);
    if (node?.tag || node?.code) {
      return true;
    }
  }
  return false;
};

/**
 * 扩展编辑器以处理代码和标签节点的操作
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够处理代码和标签相关操作
 *
 * @description
 * 该插件重写编辑器的 `apply` 和 `deleteBackward` 方法，添加对代码和标签节点的特殊处理逻辑。
 */
export const withCodeTagPlugin = (editor: Editor) => {
  const { apply, deleteBackward } = editor;

  editor.apply = (operation: Operation) => {
    // 尝试处理代码和标签相关操作
    if (handleCodeTagOperation(editor, operation, apply)) {
      return;
    }

    // 否则执行原始操作
    apply(operation);
  };

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;

    if (
      selection &&
      hasRange(editor, selection) &&
      Range.isCollapsed(selection)
    ) {
      const curNode = Node.get(editor, selection.anchor.path);

      // 检查前一个节点是否是 tag
      try {
        const [previousNode, previousPath] =
          Editor.previous(editor, {
            at: selection.anchor.path,
          }) || [];

        const isBeforeTag = selection && selection.anchor.offset <= 1;
        if ((previousNode as any)?.tag && previousPath && isBeforeTag) {
          // 如果当前节点不为空,且只有一个文本
          if (
            curNode.text?.trim() &&
            curNode.text.trimEnd().length === 1 &&
            selection.anchor.offset > 0
          ) {
            Transforms.insertText(editor, '', { at: selection.anchor.path });
            Transforms.insertNodes(
              editor,
              {
                type: 'paragraph',
                children: [{ text: ' ' }],
              },
              {
                at: selection.anchor.path,
                select: true,
              },
            );
            return;
          } else if (curNode.text?.trim() && selection.anchor.offset > 0) {
            deleteBackward(unit);
            return;
          }
          // 如果前一个节点是 tag，直接删除整个 tag
          Editor.withoutNormalizing(editor, () => {
            const parent = Node.get(editor, Path.parent(previousPath));
            const index = previousPath[previousPath.length - 1];

            if (parent.children.length === 1) {
              // 如果是唯一的节点，转换为普通文本
              Transforms.setNodes(
                editor,
                { tag: false, code: false, text: ' ', triggerText: undefined },
                { at: previousPath },
              );
            } else if (index === 0) {
              // 如果是第一个节点，删除并合并下一个节点
              Transforms.removeNodes(editor, { at: previousPath });
            } else {
              // 如果是中间或最后节点，先合并再删除
              Transforms.removeNodes(editor, { at: previousPath });
            }
          });
          return;
        }
      } catch (error) {
        // 如果获取前一个节点失败，继续执行原始删除操作
      }
      try {
        const node = Node.get(editor, selection.anchor.path);
        if (
          node?.tag &&
          node?.text?.trim()?.length < 1 &&
          selection?.anchor?.offset < 1
        ) {
          const text = node?.text?.replace(node.triggerText || '', '');
          Transforms.setNodes(
            editor,
            {
              tag: false,
              code: false,
            },
            { at: selection.anchor.path },
          );
          Transforms.insertText(editor, text, {
            at: selection.anchor.path,
          });
          return;
        }
      } catch {}
    }
    deleteBackward(unit);
  };

  return editor;
};
