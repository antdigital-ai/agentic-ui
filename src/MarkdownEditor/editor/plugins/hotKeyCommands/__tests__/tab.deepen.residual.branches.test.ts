/**
 * tab deepen：非表格单元格时 shift/非 shift 路径；无 selection 早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabKey } from '../tab';

describe('tab deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('无 selection 早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as any;
    editor.selection = null;
    const tab = new TabKey(editor);
    const preventDefault = vi.fn();
    tab.run({ preventDefault, shiftKey: false } as any);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('普通段落 Tab / Shift+Tab 不抛', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '\thello' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const tab = new TabKey(editor);
    expect(() =>
      tab.run({ preventDefault: vi.fn(), shiftKey: true } as any),
    ).not.toThrow();
    expect(() =>
      tab.run({ preventDefault: vi.fn(), shiftKey: false } as any),
    ).not.toThrow();
  });
});
