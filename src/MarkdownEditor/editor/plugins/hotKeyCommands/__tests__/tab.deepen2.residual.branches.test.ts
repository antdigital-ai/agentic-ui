/**
 * tab deepen2：扩展选区 code 内早退；普通 Tab 折叠到 end。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabKey } from '../tab';

describe('tab deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('选区覆盖整个 code 块时早退', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        language: 'js',
        value: 'a',
        children: [{ text: 'ab' }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const tab = new TabKey(editor);
    const preventDefault = vi.fn();
    tab.run({ preventDefault, shiftKey: false } as any);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('扩展选区普通 Tab 折叠到 end', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    };
    const tab = new TabKey(editor);
    tab.run({ preventDefault: vi.fn(), shiftKey: false } as any);
    expect(editor.selection?.anchor.offset).toBe(4);
  });

  it('扩展选区含嵌套块时 Shift+Tab 可运行', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 5 },
    };
    const tab = new TabKey(editor);
    expect(() =>
      tab.run({ preventDefault: vi.fn(), shiftKey: true } as any),
    ).not.toThrow();
  });
});
