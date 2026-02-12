import { createEditor, Editor, Transforms } from 'slate';
import { vi } from 'vitest';
import { withListsPlugin } from '../withListsPlugin';

describe('withListsPlugin', () => {
  it('should convert non list-item child of list to list-item', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          { type: 'paragraph', children: [{ text: 'x' }] } as any,
        ],
      },
    ];

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
    editor.normalizeNode([editor.children[0] as any, [0]]);

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { type: 'list-item' },
      { at: [0, 0] },
    );
    setNodesSpy.mockRestore();
  });

  it('should insert paragraph when list-item has no children', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list-item',
        children: [],
      },
    ] as any;

    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph', children: [{ text: '' }] },
      { at: [0, 0] },
    );
    insertNodesSpy.mockRestore();
  });

  it('should wrap non-block first child of list-item in paragraph', () => {
    const editor = withListsPlugin(createEditor());
    const firstChild = { type: 'link', children: [{ text: 'x' }], url: '' };
    editor.children = [
      {
        type: 'list-item',
        children: [firstChild],
      },
    ] as any;

    const isBlockSpy = vi.spyOn(Editor, 'isBlock').mockImplementation((_e, n) => {
      return (n as any).type === 'link' ? false : true;
    });
    const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(wrapNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'paragraph', children: [] }),
      { at: [0, 0] },
    );
    wrapNodesSpy.mockRestore();
    isBlockSpy.mockRestore();
  });

  it('should wrap block non-list child at index 1 in list-item and list', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { type: 'paragraph', children: [{ text: 'b' }] },
        ],
      },
    ] as any;

    const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(wrapNodesSpy).toHaveBeenCalled();
    wrapNodesSpy.mockRestore();
  });

  it('should convert legacy list type to bulleted-list and unset order', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list',
        order: true,
        children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: '' }] }] }],
      },
    ] as any;

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
    const unsetNodesSpy = vi.spyOn(Transforms, 'unsetNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { type: 'numbered-list' },
      { at: [0] },
    );
    expect(unsetNodesSpy).toHaveBeenCalledWith(editor, 'order', { at: [0] });
    setNodesSpy.mockRestore();
    unsetNodesSpy.mockRestore();
  });

  it('should convert legacy list without order to bulleted-list', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list',
        children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: '' }] }] }],
      },
    ] as any;

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
    const unsetNodesSpy = vi.spyOn(Transforms, 'unsetNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { type: 'bulleted-list' },
      { at: [0] },
    );
    expect(unsetNodesSpy).not.toHaveBeenCalled();
    setNodesSpy.mockRestore();
    unsetNodesSpy.mockRestore();
  });
});
