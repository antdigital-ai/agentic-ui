import { Editor, Element, NodeEntry, Text } from 'slate';

import {
  childArrayHasInvalidEntries,
  getChildList,
  normalizeEditorRootEntry,
  normalizeElementMissingChildrenArray,
  normalizeElementWithInvalidChildren,
  runSanitizeRepairLoop,
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
  const { normalize, normalizeNode } = editor;

  editor.normalize = (options?: Parameters<Editor['normalize']>[0]) => {
    // 与 Slate 默认 `normalize` 一致：在 `withoutNormalizing` 嵌套批次末尾仍会调用
    // `Editor.normalize`，此时 `isNormalizing` 为 false，文档可能短暂为空（合法中间态）。
    // 若在此处 `repairBrokenChildArrays` 强行插入默认块，会与后续 `insertNodes` 叠成双段落。
    if (Editor.isNormalizing(editor)) {
      runSanitizeRepairLoop(editor);
    }
    return normalize.call(editor, options);
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
        normalizeElementMissingChildrenArray(
          editor,
          node,
          path,
          normalizeNode,
        );
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
