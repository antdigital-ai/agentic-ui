import { createEditor, Transforms } from 'slate';
import { vi } from 'vitest';
import { withLinkAndMediaPlugin } from '../withLinkAndMediaPlugin';

describe('withLinkAndMediaPlugin', () => {
  it('应在 split_node 且节点为 link-card 时插入新段落并返回 true', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [
      {
        type: 'link-card',
        children: [{ text: 'link' }],
      },
    ];

    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 0,
      properties: { type: 'link-card' },
    });

    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      [{ type: 'paragraph', children: [{ text: '', p: 'true' }] }],
      { at: [1], select: true },
    );
    insertNodesSpy.mockRestore();
  });

  it('应在 split_node 且节点为 media 时插入新段落', () => {
    const editor = withLinkAndMediaPlugin(createEditor());
    editor.children = [
      {
        type: 'media',
        children: [{ text: '' }],
      },
    ];

    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 0,
      properties: { type: 'media' },
    });

    expect(insertNodesSpy).toHaveBeenCalled();
    insertNodesSpy.mockRestore();
  });
});
