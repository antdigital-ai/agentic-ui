/**
 * decreaseDepth deepen：at=null 与空 refs。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { decreaseDepth } from '../decreaseDepth';

describe('decreaseDepth deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('at=null / selection=null 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    editor.selection = null;
    expect(decreaseDepth(editor, agenticListsSchema, null)).toBe(false);
    expect(decreaseDepth(editor, agenticListsSchema)).toBe(false);
  });

  it('无 list-item 时 handled 保持 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(decreaseDepth(editor, agenticListsSchema)).toBe(false);
  });
});
