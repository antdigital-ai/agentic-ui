import { Editor, Path, Transforms } from 'slate';

/** schema / link-card / media 等块在 split 被拦截后，在指定位置插入空段落 */
export function insertEmptyParagraphAfter(
  editor: Editor,
  at: Path,
  select = true,
) {
  Transforms.insertNodes(
    editor,
    [
      {
        type: 'paragraph',
        children: [{ text: '', p: 'true' }],
      },
    ],
    { at, select },
  );
}
