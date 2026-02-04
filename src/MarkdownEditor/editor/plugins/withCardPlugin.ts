import { Editor, Node, Operation, Path, Range, Transforms } from 'slate';
import { clearCardAreaText, hasRange, isCardEmpty } from './utils';

/**
 * 处理卡片相关节点的操作
 *
 * @param editor - Slate编辑器实例
 * @param operation - 要处理的操作
 * @param apply - 原始的apply函数
 * @returns 如果操作被处理则返回true，否则返回false
 *
 * @description
 * 处理以下卡片相关操作:
 * - 删除卡片节点 (remove_node)，包括card、card-before和card-after
 * - 在卡片后插入文本 (insert_text)
 * - 在卡片内插入节点 (insert_node)
 * - 检查并删除空卡片
 */
const handleCardOperation = (
  editor: Editor,
  operation: Operation,
  apply: (op: Operation) => void,
): boolean => {
  if (operation.type === 'remove_node') {
    const { node } = operation;

    // 删除card时，直接删除整个卡片
    if (node.type === 'card') {
      // 直接执行原始操作，避免递归
      apply(operation);
      return true;
    }

    // 删除card-after时，删除整个卡片
    if (node.type === 'card-after') {
      Transforms.removeNodes(editor, {
        at: Path.parent(operation.path),
      });
      return true;
    }

    // 删除card-before时，阻止操作
    if (node.type === 'card-before') {
      return true;
    }

    // 检查操作后的父级是否为空卡片，如果是则删除
    if (operation.path && operation.path.length > 0) {
      try {
        const parentPath = Path.parent(operation.path);
        const parentNode = Node.get(editor, parentPath);
        if (
          parentNode &&
          parentNode.type === 'card' &&
          isCardEmpty(parentNode)
        ) {
          Transforms.removeNodes(editor, {
            at: parentPath,
          });
          return true;
        }
      } catch (error) {
        // 如果无法获取父节点，忽略错误
      }
    }
  }

  if (operation.type === 'insert_text') {
    try {
      const parentNode = Node.get(editor, Path.parent(operation.path));

      // card-before 不允许任何文本输入
      if (parentNode.type === 'card-before') {
        return true; // 阻止输入
      }

      // card-after 的输入会插入到卡片后面的新段落中
      if (parentNode.type === 'card-after') {
        try {
          const grandParentPath = Path.parent(Path.parent(operation.path));
          const grandParentNode = Node.get(editor, grandParentPath);

          if (grandParentNode.type === 'card') {
            // 使用 Editor.withoutNormalizing 确保操作的原子性
            Editor.withoutNormalizing(editor, () => {
              // 先创建新段落
              Transforms.insertNodes(
                editor,
                {
                  type: 'paragraph',
                  children: [{ text: operation.text }],
                },
                {
                  at: Path.next(grandParentPath),
                },
              );
              // 然后选中新创建的段落
              const newParagraphPath = Path.next(grandParentPath);
              const textPath = [...newParagraphPath, 0];
              Transforms.select(editor, {
                anchor: { path: textPath, offset: operation.text.length },
                focus: { path: textPath, offset: operation.text.length },
              });
              clearCardAreaText(editor, operation.path);
            });
            return true;
          }
        } catch (error) {
          // 如果获取父级节点失败，继续阻止输入
        }
        return true;
      }
    } catch (error) {
      // 如果无法获取父节点，允许操作继续
    }
  }

  if (operation.type === 'insert_node') {
    const parentNode = Node.get(editor, Path.parent(operation.path));

    // card-before 不允许任何节点插入
    if (parentNode.type === 'card-before') {
      return true; // 阻止插入
    }

    // card-after 的节点插入会放到卡片后面
    if (parentNode.type === 'card-after') {
      if (
        Node.get(editor, Path.parent(Path.parent(operation.path))).type ===
        'card'
      ) {
        const cardPath = Path.parent(Path.parent(operation.path));
        Transforms.insertNodes(editor, operation.node, {
          at: Path.next(cardPath),
        });
        return true;
      }
      Transforms.insertNodes(editor, operation.node, {
        at: Path.parent(operation.path),
      });
      return true;
    }
  }

  // 对于删除文本操作，我们需要在操作执行后检查卡片是否变空
  // 这将在 editor.apply 的最后处理

  return false;
};

/**
 * 扩展编辑器以处理卡片节点的操作和行为
 *
 * @param editor - 要扩展的Slate编辑器实例
 * @returns 增强后的编辑器实例，能够处理卡片相关操作
 *
 * @description
 * 该插件重写编辑器的 `apply`、`insertText`、`insertFragment` 和 `deleteBackward` 方法，
 * 添加对卡片节点的特殊处理逻辑，包括：
 * - 卡片节点的删除、插入和文本操作
 * - 卡片空检查逻辑
 * - 卡片区域的文本和片段插入处理
 */
export const withCardPlugin = (editor: Editor) => {
  const { apply, insertText, insertFragment, deleteBackward } = editor;

  editor.apply = (operation: Operation) => {
    // 尝试处理卡片相关操作
    if (handleCardOperation(editor, operation, apply)) {
      return;
    }

    // 记录操作前可能涉及的卡片路径，用于操作后检查
    let cardPathsToCheck: Path[] = [];

    if (operation.type === 'remove_text' || operation.type === 'insert_text') {
      if (operation.path && operation.path.length > 0) {
        try {
          // 向上查找是否在卡片内
          let currentPath = operation.path;
          while (currentPath.length > 0) {
            const node = Node.get(editor, currentPath);
            if (node && node.type === 'card') {
              cardPathsToCheck.push(currentPath);
              break;
            }
            currentPath = Path.parent(currentPath);
          }
        } catch (error) {
          // 如果无法获取节点，忽略错误
        }
      }
    }

    // 执行原始操作
    apply(operation);

    // 操作执行后，检查涉及的卡片是否变空
    for (const cardPath of cardPathsToCheck) {
      try {
        const cardNode = Node.get(editor, cardPath);
        if (cardNode && cardNode.type === 'card' && isCardEmpty(cardNode)) {
          Transforms.removeNodes(editor, {
            at: cardPath,
          });
        }
      } catch (error) {
        // 如果节点已被删除或不存在，忽略错误
      }
    }
  };

  editor.insertText = (text: string) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      try {
        const node = Node.get(editor, Path.parent(selection.anchor.path));

        // card-before 不允许任何文本输入
        if (node.type === 'card-before') {
          return; // 阻止输入
        }

        // card-after 的输入会插入到卡片后面的新段落中
        if (node.type === 'card-after') {
          const grandParentPath = Path.parent(
            Path.parent(selection.anchor.path),
          );
          const grandParent = Node.get(editor, grandParentPath);

          if (grandParent.type === 'card') {
            Editor.withoutNormalizing(editor, () => {
              Transforms.insertNodes(
                editor,
                {
                  type: 'paragraph',
                  children: [{ text: text }],
                },
                {
                  at: Path.next(grandParentPath),
                },
              );
              // 选中新创建的段落
              const newParagraphPath = Path.next(grandParentPath);
              const textPath = [...newParagraphPath, 0];
              Transforms.select(editor, {
                anchor: { path: textPath, offset: text.length },
                focus: { path: textPath, offset: text.length },
              });
              const cardAfterPath = [...grandParentPath, 2, 0];
              clearCardAreaText(editor, cardAfterPath);
            });
            return;
          }
        }
      } catch (error) {
        // 如果无法获取节点，继续原有逻辑
      }
    }

    insertText(text);
  };

  editor.insertFragment = (fragment: any) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      try {
        const node = Node.get(editor, Path.parent(selection.anchor.path));

        // card-before 不允许任何片段插入
        if (node.type === 'card-before') {
          return; // 阻止插入
        }

        // card-after 的片段插入会放到卡片后面
        if (node.type === 'card-after') {
          const grandParentPath = Path.parent(
            Path.parent(selection.anchor.path),
          );
          const grandParent = Node.get(editor, grandParentPath);

          if (grandParent.type === 'card') {
            // 将片段内容插入到卡片后面
            Transforms.insertNodes(editor, fragment, {
              at: Path.next(grandParentPath),
              select: true,
            });
            return;
          }
        }
      } catch (error) {
        // 如果无法获取节点，继续原有逻辑
      }
    }

    insertFragment(fragment);
  };

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;

    if (
      selection &&
      hasRange(editor, selection) &&
      Range.isCollapsed(selection)
    ) {
      const node = Node.get(editor, Path.parent(selection.anchor.path));
      if (node.type === 'card-before') {
        return;
      }
      if (node.type === 'card-after') {
        Transforms.removeNodes(editor, {
          at: Path.parent(selection.anchor.path),
        });
        return;
      }
    }
    deleteBackward(unit);
  };

  return editor;
};
