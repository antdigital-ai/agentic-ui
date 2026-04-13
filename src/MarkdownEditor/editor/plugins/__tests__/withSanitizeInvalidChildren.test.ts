import { createEditor, Editor, Node } from 'slate';
import { withSanitizeInvalidChildren } from '../withSanitizeInvalidChildren';

describe('withSanitizeInvalidChildren', () => {
  it('strips undefined children so Node.string does not throw', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }, undefined] as any,
      },
    ] as any;

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: '' }]);
    expect(Node.string(editor.children[0] as Parameters<typeof Node.string>[0])).toBe(
      '',
    );
  });

  it('restores a default paragraph when editor root has no blocks', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [] as any;

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });
});
