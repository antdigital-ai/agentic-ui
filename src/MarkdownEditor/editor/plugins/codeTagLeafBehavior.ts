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

  const text = currentNode.text ?? '';
  const removed = operation.text ?? '';
  const nextText =
    text.slice(0, operation.offset) + text.slice(operation.offset + removed.length);

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
    const afterText = afterNode.text ?? '';
    if (afterText.length === 0 || afterText.trim() === '') {
      Transforms.unsetNodes(editor, [...MARK_LEAF_KEYS], {
        at: operation.path,
        match: Text.isText,
      });
    }
  });
  return true;
};

export const shouldExitMarkOnInsertBreak = (
  leaf: CustomLeaf & { text: string },
  offset: number,
): boolean => {
  const text = leaf.text ?? '';
  if (text.length === 0) {
    return true;
  }
  if (offset !== text.length) {
    return false;
  }
  return text === '\n' || text.endsWith('\n');
};

/** 第二次 Enter：从 mark 叶节点移到后续普通文本 */
export const moveSelectionOutOfMarkLeaf = (editor: Editor): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  try {
    const node = Node.get(editor, selection.anchor.path);
    if (!Text.isText(node) || !(node as CustomLeaf).mark) {
      return false;
    }

    const path = selection.anchor.path;

    Editor.withoutNormalizing(editor, () => {
      if ((node.text ?? '').length === 0) {
        Transforms.unsetNodes(editor, [...MARK_LEAF_KEYS], {
          at: path,
          match: Text.isText,
        });
      }

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
    });
    return true;
  } catch {
    return false;
  }
};

export const handleMarkInsertBreak = (
  editor: Editor,
  insertBreak: () => void,
): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  let node: Node;
  try {
    node = Node.get(editor, selection.anchor.path);
  } catch {
    return false;
  }

  if (!Text.isText(node) || !(node as CustomLeaf).mark) {
    return false;
  }

  const leaf = node as CustomLeaf & { text: string };
  if (!shouldExitMarkOnInsertBreak(leaf, selection.anchor.offset)) {
    return false;
  }

  const path = selection.anchor.path;
  const text = leaf.text ?? '';

  if (
    text.length > 0 &&
    text.endsWith('\n') &&
    selection.anchor.offset === text.length
  ) {
    Editor.withoutNormalizing(editor, () => {
      const breakOffset = text.length - 1;
      if (breakOffset > 0) {
        Transforms.splitNodes(editor, {
          at: { path, offset: breakOffset },
          match: Text.isText,
        });
        const tailPath = Path.next(path);
        Transforms.unsetNodes(editor, [...MARK_LEAF_KEYS], {
          at: tailPath,
          match: Text.isText,
        });
        Transforms.select(editor, Editor.start(editor, tailPath));
      } else {
        Transforms.unsetNodes(editor, [...MARK_LEAF_KEYS], {
          at: path,
          match: Text.isText,
        });
      }
    });
    insertBreak();
    return true;
  }

  moveSelectionOutOfMarkLeaf(editor);
  insertBreak();
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

/** mark 叶末尾已有空格时，再按空格在 mark 外插入（与 tag 双空格一致） */
export const tryInsertTextOutsideMarkOnDoubleSpace = (
  editor: Editor,
  text: string,
): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  let node: Node;
  try {
    node = Node.get(editor, selection.anchor.path);
  } catch {
    return false;
  }

  const leaf = node as CustomLeaf & { text: string };
  if (!Text.isText(node) || !leaf.mark || leaf.tag || leaf.code) {
    return false;
  }

  if (text !== ' ' || selection.anchor.offset !== leaf.text.length) {
    return false;
  }

  if (leaf.text.charAt(leaf.text.length - 1) !== ' ') {
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
