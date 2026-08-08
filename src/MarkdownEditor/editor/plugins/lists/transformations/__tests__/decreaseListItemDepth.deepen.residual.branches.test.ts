/**
 * decreaseListItemDepth deepen：根级 list-item（无 parentListItem）分支。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { decreaseListItemDepth } from '../decreaseListItemDepth';

describe('decreaseListItemDepth deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('顶层 bulleted-list 中的 list-item 走 parentListItem 缺失分支', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ] as any;
    const ok = decreaseListItemDepth(editor, agenticListsSchema, [0, 0]);
    expect(ok).toBe(true);
  });
});
