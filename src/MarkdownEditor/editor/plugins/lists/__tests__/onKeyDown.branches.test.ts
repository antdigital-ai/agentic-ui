import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { onKeyDown } from '../onKeyDown';

describe('lists/onKeyDown 分支覆盖', () => {
  it('istanbul one-miss: 未 withAgenticLists 时直接返回', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const normalizeSpy = vi.spyOn(editor, 'normalize');
    const result = onKeyDown(editor, { key: 'Tab' } as any);

    expect(result).toBeUndefined();
    expect(normalizeSpy).not.toHaveBeenCalled();
    normalizeSpy.mockRestore();
  });
});
