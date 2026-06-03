import { Editor, Node, Operation, Path, Range, Text, Transforms } from 'slate';
import type { CustomLeaf } from '../../el';
import { hasRange } from './utils';
import {
  getOrphanTagStripProps,
  MARK_DECORATION_KEYS,
  type CodeTagTextLeaf,
} from './inlineLeafNormalizeUtils';

export type { CodeTagTextLeaf } from './inlineLeafNormalizeUtils';

const MARK_LEAF_KEYS = MARK_DECORATION_KEYS;

export const isCodeTagTextLeaf = (
  node: Node,
): node is CodeTagTextLeaf =>
  Text.isText(node) && !!(node.tag || node.code);

const tagPlaceholderLeaf = (source: CodeTagTextLeaf): CodeTagTextLeaf => ({
  ...source,
  tag: true,
  code: true,
  text: ' ',
});

const stripTagMarks = (leaf: CodeTagTextLeaf): Partial<CodeTagTextLeaf> =>
  getOrphanTagStripProps(leaf);

/**
 * remove_text 仍可能由选区删除、剪切等一次性触发，保留在 apply 层的唯一入口。
 */
export const handleTagRemoveTextOperation = (
  editor: Editor,
  operation: Operation & { type: 'remove_text' },
  apply: (op: Operation) => void,
): boolean => {
  const currentNode = Node.get(editor, operation.path);
  if (!isCodeTagTextLeaf(currentNode) || !currentNode.tag) {
    return false;
  }

  if (currentNode.text?.trim() === '') {
    Editor.withoutNormalizing(editor, () => {
      Transforms.setNodes(editor, stripTagMarks(currentNode), {
        at: operation.path,
      });
    });
    return true;
  }

  if (currentNode.text === operation.text) {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: operation.path });
      Transforms.insertNodes(editor, tagPlaceholderLeaf(currentNode), {
        at: operation.path,
        select: true,
      });
    });
    return true;
  }

  apply(operation);
  return true;
};

/**
 * mark 高亮（含 @ 助理等 label）删空正文后，清理 mark 相关属性，避免残留装饰条。
 */
export const handleMarkRemoveTextOperation = (
  editor: Editor,
  operation: Operation & { type: 'remove_text' },
  apply: (op: Operation) => void,
): boolean => {
  let currentNode: Node;
  try {
    currentNode = Node.get(editor, operation.path);
  } catch {
    return false;
  }

  if (!Text.isText(currentNode) || !(currentNode as CustomLeaf).mark) {
    return false;
  }

  const text = currentNode.text;
  const nextText =
    text.slice(0, operation.offset) +
    text.slice(operation.offset + operation.text.length);

  if (nextText.length > 0 && nextText.trim() !== '') {
    return false;
  }

  Editor.withoutNormalizing(editor, () => {
    apply(operation);
    if (!Editor.hasPath(editor, operation.path)) {
      return;
    }
    const afterNode = Node.get(editor, operation.path);
    if (!Text.isText(afterNode)) {
      return;
    }
    if (afterNode.text.length === 0 || afterNode.text.trim() === '') {
      Transforms.unsetNodes(editor, [...MARK_LEAF_KEYS], {
        at: operation.path,
        match: Text.isText,
      });
    }
  });
  return true;
};

export const moveSelectionOutOfCodeTagLeaf = (editor: Editor): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  try {
    const node = Node.get(editor, selection.anchor.path);
    if (!isCodeTagTextLeaf(node)) {
      return false;
    }

    const path = selection.anchor.path;
    const nextPath = Path.next(path);
    if (Editor.hasPath(editor, nextPath)) {
      Transforms.select(editor, Editor.start(editor, nextPath));
    } else {
      Transforms.insertNodes(
        editor,
        { text: '' },
        { at: nextPath, select: true },
      );
    }
    return true;
  } catch {
    return false;
  }
};

export const tryInsertTextOutsideTagOnDoubleSpace = (
  editor: Editor,
  text: string,
): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  const node = Node.get(editor, selection.anchor.path);
  if (
    !isCodeTagTextLeaf(node) ||
    !node.tag ||
    text !== ' ' ||
    selection.anchor.offset !== node.text.length
  ) {
    return false;
  }

  const lastChar = node.text.charAt(node.text.length - 1);
  if (lastChar !== ' ') {
    return false;
  }

  Transforms.insertNodes(editor, [{ text: ' ' }]);
  return true;
};

export const handleTagDeleteBackward = (
  editor: Editor,
  unit: Parameters<Editor['deleteBackward']>[0],
  deleteBackward: Editor['deleteBackward'],
): boolean => {
  const { selection } = editor;
  if (!selection || !hasRange(editor, selection) || !Range.isCollapsed(selection)) {
    return false;
  }

  const anchorPath = selection.anchor.path;

  try {
    const curNode = Node.get(editor, anchorPath);
    const isBeforeTag = selection.anchor.offset <= 1;
    const previous = Editor.previous(editor, { at: anchorPath });

    if (previous) {
      const [previousNode, previousPath] = previous;
      if (
        isCodeTagTextLeaf(previousNode) &&
        previousNode.tag &&
        isBeforeTag
      ) {
        if (
          Text.isText(curNode) &&
          curNode.text?.trim() &&
          curNode.text.trimEnd().length === 1 &&
          selection.anchor.offset > 0
        ) {
          Transforms.insertText(editor, '', { at: anchorPath });
          Transforms.insertNodes(
            editor,
            {
              type: 'paragraph',
              children: [{ text: ' ' }],
            },
            {
              at: anchorPath,
              select: true,
            },
          );
          return true;
        }

        if (Text.isText(curNode) && curNode.text?.trim() && selection.anchor.offset > 0) {
          deleteBackward(unit);
          return true;
        }

        Editor.withoutNormalizing(editor, () => {
          const parent = Node.get(editor, Path.parent(previousPath));

          if (parent.children.length === 1) {
            Transforms.setNodes(
              editor,
              stripTagMarks(previousNode as CodeTagTextLeaf),
              { at: previousPath },
            );
          } else {
            Transforms.removeNodes(editor, { at: previousPath });
          }
        });
        return true;
      }
    }

    if (
      isCodeTagTextLeaf(curNode) &&
      curNode.tag &&
      curNode.text?.trim()?.length < 1 &&
      selection.anchor.offset < 1
    ) {
      const text = curNode.text?.replace(curNode.triggerText || '', '') ?? '';
      Transforms.setNodes(
        editor,
        {
          tag: false,
          code: false,
        },
        { at: anchorPath },
      );
      Transforms.insertText(editor, text, {
        at: anchorPath,
      });
      return true;
    }
  } catch {
    return false;
  }

  return false;
};
