/**
 * increaseDepth deepen：at=null 早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { increaseDepth } from '../increaseDepth';

describe('increaseDepth deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('at=null / selection=null 返回 false', () => {
    const editor = createEditor();
    editor.selection = null;
    expect(increaseDepth(editor, agenticListsSchema, null)).toBe(false);
    expect(increaseDepth(editor, agenticListsSchema)).toBe(false);
  });
});
