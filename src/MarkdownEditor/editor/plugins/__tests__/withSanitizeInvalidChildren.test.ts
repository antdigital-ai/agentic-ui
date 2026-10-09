import { createEditor, Editor, Node, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { vi } from 'vitest';
import { withSanitizeInvalidChildren } from '../withSanitizeInvalidChildren';

describe('withSanitizeInvalidChildren', () => {
  it('does not traverse unrelated subtrees or stringify on editing and selection', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    const remoteLeaf = { text: 'unrelated' };
    const remoteChildren = [remoteLeaf];
    const remoteParagraph = {
      type: 'paragraph',
      get children() {
        return remoteChildren;
      },
    };
    editor.children = [
      { type: 'paragraph', children: [{ text: 'edit here' }] },
      { type: 'blockquote', children: [remoteParagraph] },
    ];
    Editor.normalize(editor, { force: true });
    const childrenRead = vi.spyOn(remoteParagraph, 'children', 'get');
    const stringify = vi.spyOn(JSON, 'stringify');

    try {
      Transforms.select(editor, { path: [0, 0], offset: 0 });
      Transforms.insertText(editor, 'x');
      Transforms.setNodes(editor, { bold: true }, { at: [0, 0] });
      Transforms.select(editor, { path: [0, 0], offset: 2 });

      expect(childrenRead).not.toHaveBeenCalled();
      expect(stringify).not.toHaveBeenCalled();
      expect(Node.string(editor.children[0])).toBe('xedit here');
      expect(editor.children[1].children[0]).toBe(remoteParagraph);
    } finally {
      childrenRead.mockRestore();
      stringify.mockRestore();
    }
  });

  it('repairs direct root replacements without force', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [{ type: 'paragraph' } as any];

    Editor.normalize(editor);

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it('repairs an in-place mutation when force normalization is requested', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'keep' }] }];
    Editor.normalize(editor, { force: true });
    (editor.children[0].children as unknown[]).push(undefined);

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: 'keep' }]);
  });

  it('defers direct replacement repairs until a normalization batch ends', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
    Editor.normalize(editor, { force: true });

    Editor.withoutNormalizing(editor, () => {
      editor.children = [{ type: 'paragraph' } as any];
      Editor.normalize(editor, { force: true });
    });

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });

  it('repairs imported subtrees before Slate enumerates dirty paths', () => {
    const editor = withSanitizeInvalidChildren(withHistory(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: 'existing' }] }];
    Editor.normalize(editor, { force: true });

    editor.apply({
      type: 'insert_node',
      path: [1],
      node: {
        type: 'blockquote',
        children: [{ type: 'paragraph' }, undefined],
      } as any,
    });

    expect(editor.children[1]).toEqual({
      type: 'blockquote',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
    expect(editor.history.undos).toHaveLength(1);
    HistoryEditor.undo(editor);
    expect(editor.children).toHaveLength(1);
    HistoryEditor.redo(editor);
    expect(editor.children[1].children).toHaveLength(1);
  });

  it('does not record repairs of external data in undo history', () => {
    const editor = withSanitizeInvalidChildren(withHistory(createEditor()));
    editor.children = [
      { type: 'paragraph', children: [{ text: 'keep' }, undefined] as any },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.history.undos).toEqual([]);
    expect(editor.children[0].children).toEqual([{ text: 'keep' }]);
  });

  it('does not insert an extra paragraph during batched replacement', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'old' }] }];
    Editor.normalize(editor, { force: true });

    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: [0] });
      Transforms.insertNodes(
        editor,
        { type: 'paragraph', children: [{ text: 'new' }] },
        { at: [0] },
      );
    });

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'new' }] },
    ]);
  });

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

  it('compacts sparse children arrays (holes) so Node.string does not throw', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    const paragraph = {
      type: 'paragraph',
      children: [{ text: '' }],
    } as any;
    paragraph.children.length = 2;

    editor.children = [paragraph] as any;

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: '' }]);
    expect(
      Node.string(editor.children[0] as Parameters<typeof Node.string>[0]),
    ).toBe('');
  });

  it('compacts sparse editor root without duplicating blocks', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    const root = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    root.length = 2;
    editor.children = root;

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'a' }] },
    ]);
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

  it('merges multiple all-empty root paragraphs into one', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;

    editor.normalizeNode([editor, []]);

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toEqual({
      type: 'paragraph',
      children: [{ text: '' }],
    });
  });

  it('does not merge root when one empty paragraph is followed by text', () => {
    const editor = withSanitizeInvalidChildren(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ] as any;

    editor.normalizeNode([editor, []]);

    expect(editor.children).toHaveLength(2);
    expect((editor.children[0] as any).type).toBe('paragraph');
    expect((editor.children[1] as any).children[0].text).toBe('hello');
  });
});
