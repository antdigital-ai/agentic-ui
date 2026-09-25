import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { decreaseListItemDepth } from '../decreaseListItemDepth';

describe('decreaseListItemDepth', () => {
  it('returns false when list item has no parent list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    expect(decreaseListItemDepth(editor, agenticListsSchema, [0])).toBe(false);
  });

  it('outdents a nested list item to the parent list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'first' }] },
              {
                type: ListType.UNORDERED,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(
      decreaseListItemDepth(editor, agenticListsSchema, [0, 0, 1, 0]),
    ).toBe(true);
    expect((editor.children[0] as any).children.length).toBeGreaterThan(1);
  });

  it('lifts a top-level list item to editor root', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'only' }] }],
          },
        ],
      },
    ];

    expect(decreaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
      true,
    );
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });

  it('removes empty parent list after outdenting the last nested item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'parent' }] },
              {
                type: ListType.UNORDERED,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'child' }] },
                    ],
                  },
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'sibling' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(
      decreaseListItemDepth(editor, agenticListsSchema, [0, 0, 1, 0]),
    ).toBe(true);
  });
});
