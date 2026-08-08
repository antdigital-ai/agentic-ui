/**
 * unwrapList deepen：无 list-item 时 iterations=0 早退（避免无限循环场景）。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { unwrapList } from '../unwrapList';

describe('unwrapList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('段落选区无 list-item 时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(unwrapList(editor, agenticListsSchema)).toBe(false);
  });

  it('at=null 返回 false', () => {
    const editor = createEditor();
    editor.selection = null;
    expect(unwrapList(editor, agenticListsSchema, null)).toBe(false);
  });
});
