/**
 * normalizeOrphanNestedList deepen：无 previous sibling 时 unwrap。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { normalizeOrphanNestedList } from '../normalizeOrphanNestedList';

describe('normalizeOrphanNestedList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('孤儿嵌套 list 且无前驱时 unwrap', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: ListType.UNORDERED,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'n' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    const item = (editor.children[0] as any).children[0];
    const changed = normalizeOrphanNestedList(editor, agenticListsSchema, [
      item,
      [0, 0],
    ]);
    expect(changed).toBe(true);
  });

  it('非 list-item 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    expect(
      normalizeOrphanNestedList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });
});
