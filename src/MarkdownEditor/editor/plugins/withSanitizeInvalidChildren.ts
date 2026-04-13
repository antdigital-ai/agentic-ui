import { Editor, Node, NodeEntry, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';

import { EditorUtils } from '../utils/editorUtils';

const isValidChild = (child: unknown): child is Node =>
  child !== undefined && child !== null && Node.isNode(child);

const getChildList = (node: Node): unknown[] => {
  if (!('children' in node)) {
    return [];
  }
  const { children } = node as { children?: unknown };
  return Array.isArray(children) ? children : [];
};

const createDefaultBlock = () => ({
  type: 'paragraph' as const,
  children: [{ text: '' }],
});

const rebuildElement = (node: Node): Node => {
  let children = getChildList(node).filter(isValidChild) as Node[];
  if (
    children.length === 0 &&
    'type' in node &&
    (node as { type?: string }).type
  ) {
    children = [{ text: '' }];
  }
  const { children: _drop, ...rest } = node as Node & { children?: unknown };
  return { ...rest, children } as Node;
};

const runWithoutHistory = (editor: Editor, fn: () => void) => {
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
const rebuildOrDefaultBlock = (raw: unknown): Node => {
  if (
    raw &&
    typeof raw === 'object' &&
    !Node.isText(raw as Node) &&
    typeof (raw as { type?: unknown }).type === 'string'
  ) {
    return rebuildElement(raw as Node);
  }
  return createDefaultBlock();
};

const repairBrokenChildArrays = (editor: Editor): boolean => {
  if (!Array.isArray(editor.children)) {
    /* eslint-disable no-param-reassign */
    editor.children = [createDefaultBlock()];
    /* eslint-enable no-param-reassign */
    return true;
  }

  if (editor.children.length === 0) {
    EditorUtils.replaceEditorContent(editor, [createDefaultBlock()]);
    return true;
  }

  for (let i = 0; i < editor.children.length; i++) {
    const child = editor.children[i];
    if (!isValidChild(child)) {
      /* eslint-disable no-param-reassign */
      editor.children[i] = rebuildOrDefaultBlock(child);
      /* eslint-enable no-param-reassign */
      return true;
    }
  }

  const fixBranch = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') {
      return false;
    }
    if (Node.isText(node as Node)) {
      return false;
    }
    const rawChildren = (node as { children?: unknown }).children;
    if (!Array.isArray(rawChildren)) {
      Object.assign(node as object, rebuildElement(node as Node));
      return true;
    }
    if (rawChildren.some((c) => !isValidChild(c))) {
      const fixedChildren = rawChildren.filter(isValidChild) as Node[];
      (node as { children: Node[] }).children =
        fixedChildren.length === 0 ? [{ text: '' }] : fixedChildren;
      return true;
    }
    for (let i = 0; i < rawChildren.length; i++) {
      if (fixBranch(rawChildren[i])) {
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < editor.children.length; i++) {
    if (fixBranch(editor.children[i])) {
      return true;
    }
  }
  return false;
};

/**
 * 外部或合并后的 value 可能在 `children` 中混入 `undefined` / `null`；
 * Slate 的 `Node.string` 会对每个子节点调用 `Text.isText`，遇 `undefined` 即抛错。
 * 在 normalize 最外层剔除非法子节点，避免编辑器与 toMarkdown 崩溃。
 */
export const withSanitizeInvalidChildren = (editor: Editor) => {
  const { normalizeNode, normalize } = editor;

  editor.normalize = (options?: Parameters<Editor['normalize']>[0]) => {
    let guard = 0;
    while (guard < 100 && repairBrokenChildArrays(editor)) {
      guard += 1;
    }
    return normalize.call(editor, options);
  };

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    // `Node.isNode` is true for text leaves, but they have no `children`; never call `.some` on them.
    if (Node.isText(node)) {
      normalizeNode(entry);
      return;
    }

    if (Editor.isEditor(node) && path.length === 0) {
      const childList = getChildList(node);
      const hasInvalid = childList.some((c) => !isValidChild(c));
      if (hasInvalid || childList.length === 0) {
        const nextNodes =
          childList.length === 0
            ? [createDefaultBlock()]
            : (childList.map((c) =>
                isValidChild(c) ? c : rebuildOrDefaultBlock(c),
              ) as Node[]);
        EditorUtils.replaceEditorContent(editor, nextNodes);
        normalizeNode(entry);
        return;
      }
      normalizeNode(entry);
      return;
    }

    if (!Editor.isEditor(node) && !Node.isText(node)) {
      const rawChildren = (node as { children?: unknown }).children;
      if (!Array.isArray(rawChildren)) {
        Object.assign(node as object, rebuildElement(node as Node));
        normalizeNode(entry);
        return;
      }
    }

    if (Node.isElement(node)) {
      const childList = getChildList(node);
      const hasInvalid = childList.some((c) => !isValidChild(c));
      if (hasInvalid) {
        const applyRebuild = () => {
          Editor.withoutNormalizing(editor, () => {
            const rebuilt = rebuildElement(node);
            Transforms.removeNodes(editor, { at: path, voids: true });
            Transforms.insertNodes(editor, rebuilt, { at: path, voids: true });
          });
        };
        runWithoutHistory(editor, applyRebuild);
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
