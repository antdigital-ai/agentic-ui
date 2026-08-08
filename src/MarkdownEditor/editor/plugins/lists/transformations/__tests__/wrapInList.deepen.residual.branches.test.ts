/**
 * wrapInList deepen：at=null 早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { wrapInList } from '../wrapInList';

describe('wrapInList deepen residual branches', () => {
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
    expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED, null)).toBe(
      false,
    );
    expect(wrapInList(editor, agenticListsSchema, ListType.ORDERED)).toBe(false);
  });
});
