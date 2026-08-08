/**
 * wrapInList deepen2：空 selection。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { wrapInList } from '../wrapInList';
import { ListType } from '../../types';

describe('wrapInList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('有选区包裹列表', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() =>
      wrapInList(editor, agenticListsSchema, ListType.UNORDERED),
    ).not.toThrow();
  });
});
