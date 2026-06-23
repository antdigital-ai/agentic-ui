import { Editor, Element, NodeEntry, Transforms } from 'slate';

import { legacyFootnoteReferenceElementToTextLeaf } from '../parser/parse/parseFootnote';

const INLINE_FOOTNOTE_PARENT_TYPES = new Set([
  'paragraph',
  'table-cell',
  'head',
  'list-item-text',
]);

/**
 * 将历史 `footnoteReference` 元素归一为带 `fnc` 的文本叶子，与 `FncLeaf` 编辑路径对齐。
 */
export const withFootnoteReferenceNormalize = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (
      Element.isElement(node) &&
      (node as { type?: string }).type === 'footnoteReference'
    ) {
      const leaf = legacyFootnoteReferenceElementToTextLeaf(
        node as Parameters<typeof legacyFootnoteReferenceElementToTextLeaf>[0],
      );

      if (path.length === 1) {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(
          editor,
          { type: 'paragraph', children: [leaf] },
          { at: path },
        );
        return;
      }

      const parent = Editor.parent(editor, path);
      const parentType = Element.isElement(parent[0])
        ? (parent[0] as { type?: string }).type
        : undefined;

      if (parentType && INLINE_FOOTNOTE_PARENT_TYPES.has(parentType)) {
        Transforms.removeNodes(editor, { at: path });
        Transforms.insertNodes(editor, leaf, { at: path });
        return;
      }

      Transforms.removeNodes(editor, { at: path });
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [leaf] },
        { at: path },
      );
      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
