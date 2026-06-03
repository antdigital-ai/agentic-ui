import {
  Editor,
  Element,
  Node,
  Operation,
  Path,
  Range,
  Transforms,
} from 'slate';
import type { CardAfterNode, CardBeforeNode, CardNode, ParagraphNode } from '../../el';
import { clearCardAreaText, hasRange, isCardEmpty } from './utils';

const EMPTY_PARAGRAPH: ParagraphNode = {
  type: 'paragraph',
  children: [{ text: '' }],
};

type CardSlotElement = CardBeforeNode | CardAfterNode;

export const isCardSlotElement = (
  node: Node | null | undefined,
): node is CardSlotElement =>
  Element.isElement(node) &&
  (node.type === 'card-before' || node.type === 'card-after');

/** 删 card 后若文档为空，补一个空段落，避免后续 selection 拿到无效 path */
export const ensureNonEmptyEditor = (editor: Editor): void => {
  if (!editor.children || editor.children.length === 0) {
    Transforms.insertNodes(editor, EMPTY_PARAGRAPH, { at: [0], select: true });
  }
};

export const safeParentPath = (path: Path): Path | null => {
  if (!path || path.length === 0) {
    return null;
  }
  return Path.parent(path);
};

export const safeGetNode = (editor: Editor, path: Path | null): Node | null => {
  if (!path || !Editor.hasPath(editor, path)) {
    return null;
  }
  try {
    return Node.get(editor, path);
  } catch {
    return null;
  }
};

export const getCardSlotParent = (
  editor: Editor,
  leafPath: Path,
): { parentPath: Path; parentNode: Node } | null => {
  const parentPath = safeParentPath(leafPath);
  if (!parentPath) {
    return null;
  }
  const parentNode = safeGetNode(editor, parentPath);
  if (!parentNode) {
    return null;
  }
  return { parentPath, parentNode };
};

/**
 * 若给定 path 是 card-after 的内部 text 节点路径（[card, 2, 0]），
 * 返回它所属的 card 的 path 与节点；否则返回 null。
 */
export const findCardForCardAfterInner = (
  editor: Editor,
  innerPath: Path,
): { cardPath: Path; cardAfterPath: Path } | null => {
  const cardAfterPath = safeParentPath(innerPath);
  if (!cardAfterPath) {
    return null;
  }
  const cardPath = safeParentPath(cardAfterPath);
  if (!cardPath) {
    return null;
  }
  const cardNode = safeGetNode(editor, cardPath);
  if (!Element.isElement(cardNode) || cardNode.type !== 'card') {
    return null;
  }
  return { cardPath, cardAfterPath };
};

export const redirectCardAfterText = (
  editor: Editor,
  innerPath: Path,
  text: string,
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) {
    return false;
  }

  Editor.withoutNormalizing(editor, () => {
    const afterCardPath = Path.next(ctx.cardPath);
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text }] } satisfies ParagraphNode,
      { at: afterCardPath },
    );
    const newTextPath = [...afterCardPath, 0];
    Transforms.select(editor, {
      anchor: { path: newTextPath, offset: text.length },
      focus: { path: newTextPath, offset: text.length },
    });
    clearCardAreaText(editor, ctx.cardAfterPath);
  });
  return true;
};

export const redirectCardAfterFragment = (
  editor: Editor,
  innerPath: Path,
  fragment: Node[],
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) {
    return false;
  }

  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, fragment, {
      at: Path.next(ctx.cardPath),
      select: true,
    });
    clearCardAreaText(editor, ctx.cardAfterPath);
  });
  return true;
};

export const redirectCardAfterNode = (
  editor: Editor,
  innerPath: Path,
  node: Node,
): boolean => {
  const ctx = findCardForCardAfterInner(editor, innerPath);
  if (!ctx) {
    return false;
  }

  Transforms.insertNodes(editor, node, {
    at: Path.next(ctx.cardPath),
  });
  return true;
};

export const collectCardPathsForTextOperation = (
  editor: Editor,
  textPath: Path,
): Path[] => {
  const paths: Path[] = [];
  let currentPath: Path = textPath;

  while (currentPath.length > 0) {
    try {
      const node = Node.get(editor, currentPath);
      if (Element.isElement(node) && node.type === 'card') {
        paths.push(currentPath);
        break;
      }
      currentPath = Path.parent(currentPath);
    } catch {
      break;
    }
  }

  return paths;
};

export const pruneEmptyCardsAtPaths = (
  editor: Editor,
  cardPaths: Path[],
): void => {
  for (const cardPath of cardPaths) {
    const cardNode = safeGetNode(editor, cardPath);
    if (
      Element.isElement(cardNode) &&
      cardNode.type === 'card' &&
      isCardEmpty(cardNode)
    ) {
      Transforms.removeNodes(editor, { at: cardPath });
      ensureNonEmptyEditor(editor);
    }
  }
};

/**
 * remove_node / insert_node 仍由 Operation 管线触发，保留在 apply 层。
 */
export const handleCardRemoveNodeOperation = (
  editor: Editor,
  operation: Operation & { type: 'remove_node' },
  apply: (op: Operation) => void,
): boolean => {
  const { node } = operation;

  if (Element.isElement(node) && node.type === 'card') {
    apply(operation);
    ensureNonEmptyEditor(editor);
    return true;
  }

  if (Element.isElement(node) && node.type === 'card-after') {
    const cardPath = safeParentPath(operation.path);
    const cardNode = safeGetNode(editor, cardPath);
    if (
      cardPath &&
      Element.isElement(cardNode) &&
      cardNode.type === 'card'
    ) {
      apply({
        type: 'remove_node',
        path: cardPath,
        node: cardNode,
      });
      ensureNonEmptyEditor(editor);
      return true;
    }
    apply(operation);
    return true;
  }

  if (Element.isElement(node) && node.type === 'card-before') {
    const cardPath = safeParentPath(operation.path);
    const cardNode = safeGetNode(editor, cardPath);
    if (
      cardPath &&
      Element.isElement(cardNode) &&
      cardNode.type === 'card'
    ) {
      apply({
        type: 'remove_node',
        path: cardPath,
        node: cardNode,
      });
      ensureNonEmptyEditor(editor);
      return true;
    }
    apply(operation);
    return true;
  }

  const parentPath = safeParentPath(operation.path);
  if (parentPath) {
    const parentNode = safeGetNode(editor, parentPath);
    if (
      Element.isElement(parentNode) &&
      parentNode.type === 'card' &&
      isCardEmpty(parentNode)
    ) {
      Transforms.removeNodes(editor, { at: parentPath });
      ensureNonEmptyEditor(editor);
      return true;
    }
  }

  return false;
};

export const handleCardInsertNodeOperation = (
  editor: Editor,
  operation: Operation & { type: 'insert_node' },
): boolean => {
  const parentPath = safeParentPath(operation.path);
  const parentNode = safeGetNode(editor, parentPath);

  if (isCardSlotElement(parentNode) && parentNode.type === 'card-before') {
    return true;
  }

  if (isCardSlotElement(parentNode) && parentNode.type === 'card-after') {
    if (redirectCardAfterNode(editor, operation.path, operation.node)) {
      return true;
    }
    if (parentPath) {
      Transforms.insertNodes(editor, operation.node, { at: parentPath });
      return true;
    }
  }

  return false;
};

export const tryHandleCardInsertText = (
  editor: Editor,
  text: string,
  insertText: (value: string) => void,
): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  const slot = getCardSlotParent(editor, selection.anchor.path);
  if (!slot) {
    return false;
  }

  if (slot.parentNode.type === 'card-before') {
    return true;
  }

  if (slot.parentNode.type === 'card-after') {
    if (redirectCardAfterText(editor, selection.anchor.path, text)) {
      return true;
    }
  }

  insertText(text);
  return true;
};

export const tryHandleCardInsertFragment = (
  editor: Editor,
  fragment: Node[],
  insertFragment: (value: Node[]) => void,
): boolean => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) {
    return false;
  }

  const slot = getCardSlotParent(editor, selection.anchor.path);
  if (!slot) {
    return false;
  }

  if (slot.parentNode.type === 'card-before') {
    return true;
  }

  if (slot.parentNode.type === 'card-after') {
    if (redirectCardAfterFragment(editor, selection.anchor.path, fragment)) {
      return true;
    }
  }

  insertFragment(fragment);
  return true;
};

export const handleCardDeleteBackward = (
  editor: Editor,
  unit: Parameters<Editor['deleteBackward']>[0],
  deleteBackward: Editor['deleteBackward'],
): boolean => {
  const { selection } = editor;
  if (!selection || !hasRange(editor, selection) || !Range.isCollapsed(selection)) {
    return false;
  }

  const slot = getCardSlotParent(editor, selection.anchor.path);
  if (!slot) {
    return false;
  }

  if (slot.parentNode.type === 'card-before') {
    return true;
  }

  if (slot.parentNode.type === 'card-after') {
    const cardAfterPath = slot.parentPath;
    const cardPath = safeParentPath(cardAfterPath);
    const cardNode = safeGetNode(editor, cardPath);

    if (
      cardPath &&
      Element.isElement(cardNode) &&
      cardNode.type === 'card' &&
      Array.isArray((cardNode as CardNode).children) &&
      (cardNode as CardNode).children.length >= 2
    ) {
      const contentIndex = cardAfterPath[cardAfterPath.length - 1] - 1;
      if (contentIndex >= 0) {
        const contentPath = [...cardPath, contentIndex];
        if (Editor.hasPath(editor, contentPath)) {
          Transforms.select(editor, Editor.end(editor, contentPath));
          return true;
        }
      }
      Transforms.removeNodes(editor, { at: cardPath });
      ensureNonEmptyEditor(editor);
      return true;
    }
  }

  deleteBackward(unit);
  return true;
};
