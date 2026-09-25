/**
 * decreaseListItemDepth deepen2：非法 path。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { decreaseListItemDepth } from '../decreaseListItemDepth';

describe('decreaseListItemDepth deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非法 path 安全', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    expect(() =>
      decreaseListItemDepth(editor, agenticListsSchema, [0]),
    ).not.toThrow();
  });
});
