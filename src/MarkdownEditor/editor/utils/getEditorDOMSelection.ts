import type { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

interface DOMSelectionRoot {
  getSelection?: () => Selection | null;
}

/** Read a native selection only when both endpoints belong to this editor. */
export function getEditorDOMSelection(editor: Editor): Selection | null {
  try {
    const element = ReactEditor.toDOMNode(editor, editor);
    const root = element.getRootNode() as Node & DOMSelectionRoot;
    const selection = root.getSelection
      ? root.getSelection()
      : element.ownerDocument.getSelection();
    if (
      !selection?.anchorNode ||
      !selection.focusNode ||
      !ReactEditor.hasDOMNode(editor, selection.anchorNode) ||
      !ReactEditor.hasDOMNode(editor, selection.focusNode)
    ) {
      return null;
    }
    return selection;
  } catch {
    // Unmounted editors have no DOM mapping and cannot own a native selection.
    return null;
  }
}
