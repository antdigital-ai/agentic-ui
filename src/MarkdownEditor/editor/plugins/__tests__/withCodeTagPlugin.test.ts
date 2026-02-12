import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { withCodeTagPlugin } from '../withCodeTagPlugin';

describe('withCodeTagPlugin', () => {
  it('should handle remove_text when tag node text equals operation text', () => {
    const editor = withCodeTagPlugin(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', tag: true, code: true }],
      },
    ];

    const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: 'x',
    });

    expect(removeNodesSpy).toHaveBeenCalled();
    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ tag: true, code: true, text: ' ' }),
      expect.any(Object),
    );
    removeNodesSpy.mockRestore();
    insertNodesSpy.mockRestore();
  });

  it('should call apply when tag node but text !== operation.text', () => {
    const base = createEditor();
    const originalApply = vi.fn();
    base.apply = originalApply;
    const editor = withCodeTagPlugin(base);
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'ab', tag: true, code: true }],
      },
    ];
    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: 'a',
    });
    expect(originalApply).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'remove_text', text: 'a' }),
    );
  });

  it('should handle insert_text when tag node and non-space text', () => {
    const editor = withCodeTagPlugin(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '  ', tag: true, code: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 2,
      text: 'a',
    });

    expect(removeNodesSpy).toHaveBeenCalled();
    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ text: 'a', tag: true, code: true }),
      expect.objectContaining({ at: [0, 0], select: true }),
    );
    removeNodesSpy.mockRestore();
    insertNodesSpy.mockRestore();
  });

  it('should swallow split_node when node has tag', () => {
    const editor = withCodeTagPlugin(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', tag: true, code: true }],
      },
    ];

    const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
    editor.apply({
      type: 'split_node',
      path: [0, 0],
      position: 1,
      properties: {},
    });
    expect(removeNodesSpy).not.toHaveBeenCalled();
    removeNodesSpy.mockRestore();
  });

  it('should catch error in deleteBackward when Editor.previous throws', () => {
    const editor = withCodeTagPlugin(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    const previousSpy = vi.spyOn(Editor, 'previous').mockImplementation(() => {
      throw new Error('previous fail');
    });

    expect(() => editor.deleteBackward('character')).not.toThrow();
    previousSpy.mockRestore();
  });

  it('当 tag 为父节点唯一子节点时 deleteBackward 应 setNodes 转为普通文本', () => {
    const editor = withCodeTagPlugin(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'x', tag: true, code: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'y' }],
      },
    ];
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };

    const tagNode = { text: 'x', tag: true, code: true };
    const previousPath: [number, number] = [0, 0];
    const previousSpy = vi
      .spyOn(Editor, 'previous')
      .mockReturnValue([tagNode, previousPath] as any);

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
    editor.deleteBackward('character');
    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        tag: false,
        code: false,
        text: ' ',
        triggerText: undefined,
      }),
      expect.objectContaining({ at: [0, 0] }),
    );
    previousSpy.mockRestore();
    setNodesSpy.mockRestore();
  });
});
