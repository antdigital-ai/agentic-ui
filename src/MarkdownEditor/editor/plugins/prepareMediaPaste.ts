import { Editor, Path, Transforms } from 'slate';
import { getSelectedMediaBlockPath } from './cardPluginBehavior';

/** Call only after accepting a payload: media children are hidden anchors. */
export const prepareMediaPaste = (editor: Editor): boolean => {
  const mediaPath = getSelectedMediaBlockPath(editor);
  if (!mediaPath) return false;
  Transforms.insertNodes(
    editor,
    { type: 'paragraph', children: [{ text: '' }] },
    { at: Path.next(mediaPath), select: true },
  );
  return true;
};
