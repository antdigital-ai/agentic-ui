import { HistoryEditor } from 'slate-history';
import { describe, expect, it } from 'vitest';
import { createTestMarkdownEditor } from '../../__tests__/helpers/createTestMarkdownEditor';

describe('withMarkdown stack + history (production editor factory)', () => {
  it('schema split_node 拦截后 undo 撤销插入的空段落', () => {
    const editor = createTestMarkdownEditor([]);
    editor.children = [
      {
        type: 'schema',
        children: [{ text: 'schema content' }],
      },
    ];

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 0,
      properties: { type: 'schema' },
    });

    expect(editor.children).toHaveLength(2);
    expect(editor.children[1]).toMatchObject({ type: 'paragraph' });

    HistoryEditor.undo(editor);

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toMatchObject({ type: 'schema' });
  });

  it('链接末尾连续空格跳出 url 后 undo 恢复结构', () => {
    const editor = createTestMarkdownEditor([]);
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'https://example.com ',
            url: 'https://example.com',
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 20 },
      focus: { path: [0, 0], offset: 20 },
    };

    const before = JSON.stringify(editor.children);

    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 20,
      text: ' ',
    });

    expect(JSON.stringify(editor.children)).not.toBe(before);

    HistoryEditor.undo(editor);

    expect(JSON.stringify(editor.children)).toBe(before);
  });

  it('link-card split_node 拦截后 undo 撤销插入段落', () => {
    const editor = createTestMarkdownEditor([]);
    editor.children = [
      {
        type: 'link-card',
        children: [{ text: 'link' }],
      },
    ];

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 0,
      properties: { type: 'link-card' },
    });

    expect(editor.children).toHaveLength(2);

    HistoryEditor.undo(editor);

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toMatchObject({ type: 'link-card' });
  });
});
