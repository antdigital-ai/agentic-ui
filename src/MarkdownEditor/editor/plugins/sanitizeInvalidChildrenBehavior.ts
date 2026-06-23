import { Editor, Element, Node, NodeEntry, Path, Text, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';

import { EditorUtils } from '../utils/editorUtils';

const MAX_REPAIR_ITERATIONS = 100;

export const isValidChild = (child: unknown): child is Node =>
  child !== undefined && child !== null && Node.isNode(child);

/**
 * `Array.prototype.some` skips sparse holes; Slate still sees missing indices and
 * can pass `undefined` as `leaf` into `renderLeaf`, which then throws in `Text.isText`.
 */
export const childArrayHasInvalidEntries = (rawChildren: unknown[]): boolean => {
  for (let i = 0; i < rawChildren.length; i += 1) {
    if (!(i in rawChildren) || !isValidChild(rawChildren[i])) {
      return true;
    }
  }
  return false;
};

export const getChildList = (node: Node): unknown[] => {
  if (!('children' in node)) {
    return [];
  }
  const { children } = node as { children?: unknown };
  return Array.isArray(children) ? children : [];
};

export const createDefaultBlock = (): Element => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

export const rebuildElement = (node: Node): Element => {
  let children = getChildList(node).filter(isValidChild) as Node[];
  if (
    children.length === 0 &&
    Element.isElement(node) &&
    typeof node.type === 'string'
  ) {
    children = [{ text: '' }];
  }
  const { children: _drop, ...rest } = node as Element & { children?: unknown };
  return { ...rest, children } as Element;
};

export const runWithoutHistory = (editor: Editor, fn: () => void): void => {
  if (HistoryEditor.isHistoryEditor(editor)) {
    HistoryEditor.withoutSaving(editor, fn);
  } else {
    fn();
  }
};

/**
 * Slate 的 `Node.nodes` / `Editor.normalize` 在遍历时假定非文本节点必有数组型 `children`。
 * 若仅有 `type` 而缺少 `children`，会在进入自定义 `normalizeNode` 之前就抛错，必须先修树。
 */
export const rebuildOrDefaultBlock = (raw: unknown): Node => {
  if (
    raw &&
    typeof raw === 'object' &&
    !Text.isText(raw as Node) &&
    typeof (raw as { type?: unknown }).type === 'string'
  ) {
    return rebuildElement(raw as Node);
  }
  return createDefaultBlock();
};

/** 压缩根级子节点：去掉空洞与 null/undefined；残缺元素对象则 rebuild，不凭空多插空段落。 */
export const compactEditorRootChildren = (raw: unknown[]): Node[] => {
  const out: Node[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (!(i in raw)) {
      continue;
    }
    const c = raw[i];
    if (isValidChild(c)) {
      out.push(c);
      continue;
    }
    if (c === undefined || c === null) {
      continue;
    }
    out.push(rebuildOrDefaultBlock(c));
  }
  return out;
};

const sanitizeTextLeaf = (node: Node): Node => {
  if (!Text.isText(node)) {
    return node;
  }
  if (!('children' in (node as object))) {
    return node;
  }
  const { children: _drop, ...leaf } = node as Text & { children?: unknown };
  return leaf as Node;
};

export function sanitizeNode(node: Node): Node {
  if (Text.isText(node)) {
    return sanitizeTextLeaf(node);
  }

  const rawChildren = (node as { children?: unknown }).children;
  if (!Array.isArray(rawChildren)) {
    return rebuildElement(node);
  }

  const sanitizedChildren: Node[] = [];
  for (let i = 0; i < rawChildren.length; i += 1) {
    if (!(i in rawChildren)) {
      continue;
    }
    const child = rawChildren[i];
    if (!isValidChild(child)) {
      if (child !== undefined && child !== null) {
        sanitizedChildren.push(sanitizeNode(rebuildOrDefaultBlock(child)));
      }
      continue;
    }
    sanitizedChildren.push(sanitizeNode(child));
  }

  const children =
    sanitizedChildren.length === 0 ? [{ text: '' }] : sanitizedChildren;

  const { children: _drop, ...rest } = node as Element & { children?: unknown };
  return { ...rest, children } as Node;
}

/** 不可变方式整树清洗，供 replaceEditorContent 使用。 */
export const sanitizeEditorChildren = (raw: unknown): Node[] => {
  if (!Array.isArray(raw)) {
    return [createDefaultBlock()];
  }
  const compacted = compactEditorRootChildren(raw);
  if (compacted.length === 0) {
    return [createDefaultBlock()];
  }
  return compacted.map((child) => sanitizeNode(child));
};

export const areNodeArraysEqual = (a: Node[], b: Node[]): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const rootChildrenNeedDirectAssignment = (raw: unknown): boolean =>
  !Array.isArray(raw) || childArrayHasInvalidEntries(raw);

/**
 * 替换编辑器根节点：结构完好时走 Transforms；稀疏洞/undefined 等损坏根只能直接赋值，
 * 否则 removeNodes 会因无效 path 抛错（见 withSanitizeInvalidChildren 稀疏根用例）。
 */
export const setEditorChildrenSafely = (editor: Editor, nodes: Node[]): void => {
  const normalized = EditorUtils.coalesceRootAllEmptyParagraphs(nodes);

  if (rootChildrenNeedDirectAssignment(editor.children)) {
    runWithoutHistory(editor, () => {
      EditorUtils.safeDeselect(editor);
      /* eslint-disable no-param-reassign -- 损坏根无法走 Operation 管线 */
      editor.children = normalized;
      /* eslint-enable no-param-reassign */
    });
    return;
  }

  EditorUtils.replaceEditorContent(editor, normalized);
};

/**
 * 在 normalize 守卫阶段修复非法 children。
 */
export const repairBrokenChildArrays = (editor: Editor): boolean => {
  const next = sanitizeEditorChildren(editor.children);
  if (areNodeArraysEqual(editor.children, next)) {
    return false;
  }
  setEditorChildrenSafely(editor, next);
  return true;
};

export const replaceNodeAtPath = (
  editor: Editor,
  path: Path,
  nextNode: Node,
): void => {
  const applyReplace = () => {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: path, voids: true });
      Transforms.insertNodes(editor, nextNode, { at: path, voids: true });
    });
  };
  runWithoutHistory(editor, applyReplace);
};

export const stripInvalidChildrenOnTextLeaf = (
  editor: Editor,
  path: Path,
  node: Node,
): boolean => {
  if (!Text.isText(node) || !('children' in (node as object))) {
    return false;
  }
  const { children: _drop, ...leaf } = node as Text & { children?: unknown };
  runWithoutHistory(editor, () => {
    Transforms.setNodes(editor, leaf, { at: path });
  });
  return true;
};

export const normalizeEditorRootEntry = (
  editor: Editor,
  childList: unknown[],
  normalizeNode: (entry: NodeEntry) => void,
): boolean => {
  const hasInvalid = childArrayHasInvalidEntries(childList);
  if (hasInvalid || childList.length === 0) {
    const fixedTop = compactEditorRootChildren(childList);
    const nextNodes =
      fixedTop.length === 0 ? [createDefaultBlock()] : fixedTop;
    setEditorChildrenSafely(editor, nextNodes);
    normalizeNode([editor, []]);
    return true;
  }

  const validTop = childList.filter(isValidChild) as Node[];
  if (validTop.length > 1) {
    const collapsed = EditorUtils.coalesceRootAllEmptyParagraphs(validTop);
    if (collapsed.length < validTop.length) {
      setEditorChildrenSafely(editor, collapsed);
      normalizeNode([editor, []]);
      return true;
    }
  }

  return false;
};

export const normalizeElementWithInvalidChildren = (
  editor: Editor,
  node: Element,
  path: Path,
): void => {
  replaceNodeAtPath(editor, path, rebuildElement(node));
};

export const normalizeElementMissingChildrenArray = (
  editor: Editor,
  node: Node,
  path: Path,
  normalizeNode: (entry: NodeEntry) => void,
): void => {
  runWithoutHistory(editor, () => {
    Transforms.setNodes(editor, rebuildElement(node), { at: path });
  });
  normalizeNode([Node.get(editor, path), path]);
};

export const runSanitizeRepairLoop = (editor: Editor): void => {
  let guard = 0;
  while (guard < MAX_REPAIR_ITERATIONS && repairBrokenChildArrays(editor)) {
    guard += 1;
  }
};
