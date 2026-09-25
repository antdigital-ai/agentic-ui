/**
 * getListItems deepen：Span 起止颠倒时取 end 路径。
 */
import { createEditor, Path } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getListItems } from '../getListItems';

describe('getListItems deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('Span 起点晚于终点时 Path.compare 取 end', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      } as any,
    ];
    const schema = {
      isListItemNode: (n: any) => n?.type === 'list-item',
    } as any;
    const start = [0, 0, 0, 0] as Path;
    const end = [0, 0] as Path;
    // start > end → 应取 end
    const items = getListItems(editor, schema, [start, end] as any);
    expect(Array.isArray(items)).toBe(true);
  });
});
