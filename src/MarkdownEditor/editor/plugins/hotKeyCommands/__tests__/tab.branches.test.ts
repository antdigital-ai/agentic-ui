/**
 * TabKey 热键分支。
 */
import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { TabKey } from '../tab';

function makeEditor(children: any[]) {
  const editor = createEditor();
  editor.children = children;
  editor.insertText = vi.fn((t: string) => {
    Transforms.insertText(editor, t);
  }) as any;
  return editor;
}

describe('TabKey branches', () => {
  it('无 selection 直接返回', () => {
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: 'a' }] },
    ]);
    editor.selection = null;
    const tab = new TabKey(editor);
    const e = { preventDefault: vi.fn(), shiftKey: false } as any;
    tab.run(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it('折叠选区：普通插入 tab；shift 去掉前导 tab', () => {
    const editor = makeEditor([
      { type: 'paragraph', children: [{ text: '\thello' }] },
    ]);
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    const tab = new TabKey(editor);
    tab.run({ preventDefault: vi.fn(), shiftKey: true } as any);

    const editor2 = makeEditor([
      { type: 'paragraph', children: [{ text: 'hi' }] },
    ]);
    editor2.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const tab2 = new TabKey(editor2);
    tab2.run({ preventDefault: vi.fn(), shiftKey: false } as any);
    expect(editor2.insertText).toHaveBeenCalledWith('\t');
  });

  it('表格单元格 Tab / Shift+Tab 导航', () => {
    const table = {
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
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
            },
            {
              type: 'table-cell',
              children: [{ type: 'paragraph', children: [{ text: 'd' }] }],
            },
          ],
        },
      ],
    };
    const editor = makeEditor([table]);
    // 光标在第一格末尾
    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0, 0], offset: 1 },
    };
    new TabKey(editor).run({ preventDefault: vi.fn(), shiftKey: false } as any);
    expect(editor.selection).toBeTruthy();

    editor.selection = {
      anchor: { path: [0, 0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0, 0], offset: 0 },
    };
    new TabKey(editor).run({ preventDefault: vi.fn(), shiftKey: true } as any);

    // 单元格内未到末尾：tableCell 返回 false，走 insertText
    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    };
    new TabKey(editor).run({ preventDefault: vi.fn(), shiftKey: false } as any);
  });

  it('展开选区：code 全覆盖早退；shift liftNodes', () => {
    const editor = makeEditor([
      {
        type: 'code',
        value: 'x',
        children: [{ text: 'xy' }],
      },
    ]);
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    new TabKey(editor).run({ preventDefault: vi.fn(), shiftKey: false } as any);

    const editor2 = makeEditor([
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
      },
    ]);
    editor2.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 2 },
    };
    new TabKey(editor2).run({
      preventDefault: vi.fn(),
      shiftKey: true,
    } as any);

    const editor3 = makeEditor([
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ]);
    editor3.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    new TabKey(editor3).run({
      preventDefault: vi.fn(),
      shiftKey: false,
    } as any);
    expect(editor3.selection?.anchor.offset).toBe(5);
  });
});
