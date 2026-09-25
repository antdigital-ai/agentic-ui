/**
 * increaseDepth deepen2：省略 at 且 selection 非空 → 默认参取值。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { increaseDepth } from '../increaseDepth';

describe('increaseDepth deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 at：走 editor.selection 默认参', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'bulleted-list',
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
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };
    expect(() => increaseDepth(editor, agenticListsSchema)).not.toThrow();
  });
});
