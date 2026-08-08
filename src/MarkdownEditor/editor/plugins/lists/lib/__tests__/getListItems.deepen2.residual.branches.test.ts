/**
 * getListItems deepen2：Point / Path 位置；空 at。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getListItems } from '../getListItems';

describe('getListItems deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('at 为 null 返回空；Point 路径可用', () => {
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
    expect(getListItems(editor, schema, null)).toEqual([]);
    const items = getListItems(editor, schema, {
      path: [0, 0, 0, 0],
      offset: 0,
    } as any);
    expect(Array.isArray(items)).toBe(true);
  });
});
