import { createEditor, Node, Transforms } from 'slate';
import { vi } from 'vitest';
import { withCardPlugin } from '../withCardPlugin';

describe('withCardPlugin', () => {
  it('insert_text 父节点为 card-before 时阻止输入', () => {
    const editor = withCardPlugin(createEditor());
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'body' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ];
    const textBefore = Node.get(editor, [0, 0, 0]);
    editor.apply({
      type: 'insert_text',
      path: [0, 0, 0],
      offset: 0,
      text: 'x',
    });
    const textAfter = Node.get(editor, [0, 0, 0]);
    expect((textAfter as any).text).toBe((textBefore as any).text);
  });

  it('insert_text 父节点为 card-after 且 grandParent 非 card 时 return true', () => {
    const editor = withCardPlugin(createEditor());
    // card-after 作为根子节点，其 grandParent 为根，非 card
    editor.children = [{ type: 'card-after', children: [{ text: '' }] }];
    const textBefore = (Node.get(editor, [0, 0]) as any).text;
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'a',
    });
    const textAfter = (Node.get(editor, [0, 0]) as any).text;
    expect(textAfter).toBe(textBefore);
  });

  it('insert_node 父节点为 card-after 且 grandParent 为 card 时插入到卡片后', () => {
    const editor = withCardPlugin(createEditor());
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'body' }] },
          { type: 'card-after', children: [] },
        ],
      },
    ];
    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');
    editor.apply({
      type: 'insert_node',
      path: [0, 2, 0],
      node: { type: 'paragraph', children: [{ text: 'new' }] },
    });
    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.any(Object),
      expect.objectContaining({ at: [1] }),
    );
    insertNodesSpy.mockRestore();
  });

  it('insert_node 父节点为 card-after 且 grandParent 非 card 时插入到 parent path', () => {
    const editor = withCardPlugin(createEditor());
    editor.children = [{ type: 'card-after', children: [] }];
    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');
    editor.apply({
      type: 'insert_node',
      path: [0, 0],
      node: { type: 'paragraph', children: [{ text: 'new' }] },
    });
    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.any(Object),
      expect.objectContaining({ at: [0] }),
    );
    insertNodesSpy.mockRestore();
  });

  it('insertFragment 在非 card 区域时应调用原始 insertFragment', () => {
    const base = createEditor();
    const origInsertFragment = vi.fn();
    base.insertFragment = origInsertFragment;
    const editor = withCardPlugin(base);
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    editor.insertFragment([{ text: 'pasted' }]);
    expect(origInsertFragment).toHaveBeenCalledWith([{ text: 'pasted' }]);
  });
});
