import { Editor, Element, NodeEntry, Text } from 'slate';

import {
  childArrayHasInvalidEntries,
  getChildList,
  normalizeEditorRootEntry,
  normalizeElementMissingChildrenArray,
  normalizeElementWithInvalidChildren,
  runSanitizeRepairLoop,
  sanitizeNode,
  stripInvalidChildrenOnTextLeaf,
} from './sanitizeInvalidChildrenBehavior';

/**
 * 外部或合并后的 value 可能在 `children` 中混入 `undefined` / `null`；
 * Slate 的 `Node.string` 会对每个子节点调用 `Text.isText`，遇 `undefined` 即抛错。
 * 在 normalize 最外层剔除非法子节点，避免编辑器与 toMarkdown 崩溃。
 *
 * 修复一律经 `EditorUtils.replaceEditorContent` / `Transforms`，不直接改 `editor.children`
 * 或就地 `Object.assign` / `delete` 节点。
 */
export const withSanitizeInvalidChildren = (editor: Editor) => {
  const { apply, normalize, normalizeNode } = editor;
  let knownChildren = editor.children;
  let needsFullSanitize = false;
  let repairing = false;

  editor.apply = (operation) => {
    if (!repairing && editor.children !== knownChildren) {
      needsFullSanitize = true;
    }

    // Slate 在 normalizeNode 前枚举 insert_node 的子树，先修复导入节点，
    // 避免缺少 children 或稀疏数组使 dirty-path 枚举提前抛错。
    let nextOperation = operation;
    if (operation.type === 'insert_node') {
      const node = sanitizeNode(operation.node);
      if (node !== operation.node) {
        nextOperation = { ...operation, node: node as typeof operation.node };
      }
    }

    try {
      apply(nextOperation);
    } finally {
      knownChildren = editor.children;
    }
  };

  editor.normalize = (options?: Parameters<Editor['normalize']>[0]) => {
    // 与 Slate 默认 `normalize` 一致：在 `withoutNormalizing` 嵌套批次末尾仍会调用
    // `Editor.normalize`，此时 `isNormalizing` 为 false，文档可能短暂为空（合法中间态）。
    // 若在此处 `repairBrokenChildArrays` 强行插入默认块，会与后续 `insertNodes` 叠成双段落。
    if (!Editor.isNormalizing(editor)) {
      return normalize.call(editor, options);
    }

    // 普通操作由 Slate 的 dirty paths 驱动 normalizeNode；只有外部直接替换
    // children / force normalize 才需要在 Slate 枚举整树前做完整检查。
    if (
      !repairing &&
      (options?.force ||
        needsFullSanitize ||
        (!options?.operation && editor.children !== knownChildren) ||
        !Array.isArray(editor.children) ||
        editor.children.length === 0)
    ) {
      repairing = true;
      needsFullSanitize = false;
      try {
        runSanitizeRepairLoop(editor);
      } finally {
        repairing = false;
        knownChildren = editor.children;
      }
    }
    try {
      return normalize.call(editor, options);
    } finally {
      knownChildren = editor.children;
    }
  };

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (Text.isText(node)) {
      if (stripInvalidChildrenOnTextLeaf(editor, path, node)) {
        normalizeNode(entry);
        return;
      }
      normalizeNode(entry);
      return;
    }

    if (Editor.isEditor(node) && path.length === 0) {
      const childList = getChildList(node);
      if (normalizeEditorRootEntry(editor, childList, normalizeNode)) {
        return;
      }
      normalizeNode(entry);
      return;
    }

    if (!Editor.isEditor(node) && !Text.isText(node)) {
      const rawChildren = (node as { children?: unknown }).children;
      if (!Array.isArray(rawChildren)) {
        normalizeElementMissingChildrenArray(editor, node, path, normalizeNode);
        return;
      }
    }

    if (Element.isElement(node)) {
      const childList = getChildList(node);
      if (childArrayHasInvalidEntries(childList)) {
        normalizeElementWithInvalidChildren(editor, node, path);
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
