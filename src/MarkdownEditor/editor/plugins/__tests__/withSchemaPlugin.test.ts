import { createEditor, Transforms } from 'slate';
import { vi } from 'vitest';
import { withSchemaPlugin } from '../withSchemaPlugin';

describe('withSchemaPlugin', () => {
  it('split_node 且 type 为 schema 时应在其后插入段落', () => {
    const editor = withSchemaPlugin(createEditor());
    editor.children = [
      {
        type: 'schema',
        children: [{ text: 'schema content' }],
      },
    ];

    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 0,
      properties: { type: 'schema' },
    });

    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      [{ type: 'paragraph', children: [{ text: '', p: 'true' }] }],
      { at: [1], select: true },
    );
    insertNodesSpy.mockRestore();
  });

  it('非 schema 操作时应调用原始 apply', () => {
    const baseEditor = createEditor();
    const originalApply = vi.fn();
    const editor = withSchemaPlugin({
      ...baseEditor,
      apply: originalApply,
    } as any);
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];

    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 1,
      text: 'a',
    });

    expect(originalApply).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'insert_text', text: 'a' }),
    );
  });
});
