/**
 * increaseListItemDepth deepen2：前项非 list-item。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { increaseListItemDepth } from '../increaseListItemDepth';

describe('increaseListItemDepth deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('前项非 list-item 时早退', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
        children: [
          { type: 'paragraph', children: [{ text: 'x' }] },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as any;
    expect(() =>
      increaseListItemDepth(editor, agenticListsSchema, [0, 1]),
    ).not.toThrow();
  });
});
