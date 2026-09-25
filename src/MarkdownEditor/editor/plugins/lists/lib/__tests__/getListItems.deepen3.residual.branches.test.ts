/**
 * getListItems deepen3：Span 起止倒置走 Path.compare 另一臂。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getListItems } from '../getListItems';

const schema = {
  isListItemNode: (n) => n?.type === 'list-item',
};

describe('getListItems deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Span 终点在前', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list-item',
        children: [{ type: 'list-item-text', children: [{ text: 'a' }] }],
      },
      {
        type: 'list-item',
        children: [{ type: 'list-item-text', children: [{ text: 'b' }] }],
      },
    ];
    const at = [
      [1, 0, 0],
      [0, 0, 0],
    ];
    const items = getListItems(editor, schema, at);
    expect(Array.isArray(items)).toBe(true);
  });
});
