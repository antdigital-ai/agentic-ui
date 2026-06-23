import { createEditor, Transforms } from 'slate';
import { vi } from 'vitest';
import { withListsPlugin } from '../withListsPlugin';

describe('withListsPlugin', () => {
  it('should wrap non-list-item child of list in list-item', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'bulleted-list',
        children: [{ type: 'paragraph', children: [{ text: 'x' }] } as any],
      },
    ];

    const wrapNodesSpy = vi.spyOn(editor, 'wrapNodes');
    editor.normalizeNode([editor.children[0] as any, [0]]);

    expect(wrapNodesSpy).toHaveBeenCalled();
    wrapNodesSpy.mockRestore();
  });

  it('should normalize empty list-item via slate defaults', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list-item',
        children: [],
      },
    ] as any;

    expect(() =>
      editor.normalizeNode([editor.children[0], [0]]),
    ).not.toThrow();
  });

  it('should wrap bare text child of list-item in list-item-text', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list-item',
        children: [{ text: 'x' }],
      },
    ] as any;

    const wrapNodesSpy = vi.spyOn(editor, 'wrapNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(wrapNodesSpy).toHaveBeenCalled();
    wrapNodesSpy.mockRestore();
  });

  it('should coerce block non-list-item-text child to paragraph', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { type: 'heading-one', children: [{ text: 'b' }] },
        ],
      },
    ] as any;

    const setNodesSpy = vi.spyOn(editor, 'setNodes');
    editor.normalizeNode([editor.children[0], [0]]);

    expect(setNodesSpy).toHaveBeenCalled();
    setNodesSpy.mockRestore();
  });

  it('should convert legacy list type to numbered-list and unset order', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list',
        order: true,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '' }] }],
          },
        ],
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

  it('should merge adjacent bulleted lists of the same type', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ] as any;

    const mergeNodesSpy = vi.spyOn(editor, 'mergeNodes');
    editor.normalizeNode([editor.children[1], [1]]);

    expect(mergeNodesSpy).toHaveBeenCalledWith({ at: [1] });
    mergeNodesSpy.mockRestore();
  });

  it('should not merge ordered and bulleted lists', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '1' }] }],
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
          },
        ],
      },
    ] as any;

    const mergeNodesSpy = vi.spyOn(editor, 'mergeNodes');
    editor.normalizeNode([editor.children[1], [1]]);

    expect(mergeNodesSpy).not.toHaveBeenCalled();
    mergeNodesSpy.mockRestore();
  });

  it('should convert legacy list without order to bulleted-list', () => {
    const editor = withListsPlugin(createEditor());
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '' }] }],
          },
        ],
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
