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
    expect(
      Node.string(editor.children[0] as Parameters<typeof Node.string>[0]),
    ).toBe('');
  });

  it('restores a default paragraph when editor root has no blocks', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [] as any;

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it('does not throw when editor.children is undefined', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    (editor as any).children = undefined;

    expect(() => Editor.normalize(editor, { force: true })).not.toThrow();
    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it('repairs element nodes with missing children array', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ok' }] },
      { type: 'paragraph' } as any,
    ] as any;

    Editor.normalize(editor, { force: true });

    expect((editor.children[1] as any).children).toEqual([{ text: '' }]);
  });

  it('does not throw when normalizeNode runs on a text leaf', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ] as any;

    expect(() =>
      editor.normalizeNode([{ text: 'hi' }, [0, 0]] as any),
    ).not.toThrow();
  });
});
