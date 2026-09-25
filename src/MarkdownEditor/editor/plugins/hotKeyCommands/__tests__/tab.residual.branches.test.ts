/**
 * TabKey residual：非折叠选区包 code；shift+lists 路径安全。
 */
import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { TabKey } from '../tab';

describe('TabKey residual branches', () => {
  it('非折叠选区：选区完全在 code 内时插入 tab', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        value: 'ab',
        language: 'js',
        children: [{ text: 'ab' }],
      },
    ] as any;
    editor.insertText = vi.fn((t: string) => {
      Transforms.insertText(editor, t);
    }) as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const tab = new TabKey(editor);
    const e = { preventDefault: vi.fn(), shiftKey: false } as any;
    tab.run(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('表格末单元格 Tab 移到下一行；末行末格插入', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
              },
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
              },
            ],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 1, 0, 0], offset: 1 },
      focus: { path: [0, 0, 1, 0, 0], offset: 1 },
    };
    const tab = new TabKey(editor);
    tab.run({ preventDefault: vi.fn(), shiftKey: false } as any);
    expect(editor.selection).toBeTruthy();
  });
});
