/**
 * isAtEmptyListItem deepen：listItems 数量不为 1 早退。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { isAtEmptyListItem } from '../isAtEmptyListItem';

describe('isAtEmptyListItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('选区落在非 list-item 时 length!==1 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(isAtEmptyListItem(editor, agenticListsSchema)).toBe(false);
  });
});
