/**
 * increaseListItemDepth deepen：无前驱 / 前驱非 list-item。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { increaseListItemDepth } from '../increaseListItemDepth';

describe('increaseListItemDepth deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('首个 list-item 无 previous sibling 返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as any;
    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
      false,
    );
  });
});
