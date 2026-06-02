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

  it('editor.insertFragment 在 card-after 内时把片段挪到卡后', () => {
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
    Transforms.select(editor, { path: [0, 2, 0], offset: 0 });
    editor.insertFragment([
      { type: 'paragraph', children: [{ text: 'pasted' }] },
    ]);
    expect(editor.children.length).toBe(2);
    expect((editor.children[0] as any).type).toBe('card');
    expect((editor.children[1] as any).type).toBe('paragraph');
    expect((editor.children[1] as any).children[0].text).toBe('pasted');
  });

  it('editor.insertText 在 card 之外的"假 card-after"上走默认 insertText', () => {
    const base = createEditor();
    const origInsertText = vi.fn();
    base.insertText = origInsertText;
    const editor = withCardPlugin(base);
    editor.children = [{ type: 'card-after', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });
    editor.insertText('x');
    expect(origInsertText).toHaveBeenCalledWith('x');
  });

  it('insert_text 父节点为 card-after（不在 card 内）apply 层仍然阻止', () => {
    const base = createEditor();
    const origApply = vi.fn();
    base.apply = origApply;
    const editor = withCardPlugin(base);
    editor.children = [{ type: 'card-after', children: [{ text: '' }] }];
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'x',
    });
    expect(origApply).not.toHaveBeenCalled();
  });

  it('insert_node 路径长度不足时不应抛错', () => {
    const editor = withCardPlugin(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    expect(() =>
      editor.apply({
        type: 'insert_node',
        path: [1],
        node: { type: 'paragraph', children: [{ text: 'x' }] },
      }),
    ).not.toThrow();
    expect(editor.children.length).toBe(2);
  });

  it('删 card 后 editor.children 为空时自动补空段落', () => {
    const editor = withCardPlugin(createEditor());
    editor.children = [
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'x' }] },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ];
    Transforms.removeNodes(editor, { at: [0] });
    expect(editor.children.length).toBe(1);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });
});
