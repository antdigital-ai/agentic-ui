/**
 * lists setListType / normalizeListItemChildren / decreaseListItemDepth mid-tail。
 */
import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';
import { normalizeListItemChildren } from '../../normalizations/normalizeListItemChildren';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { decreaseListItemDepth } from '../decreaseListItemDepth';
import { setListType } from '../setListType';

const withLists = () => {
  const editor = createEditor();
  editor.isInline = () => false;
  return editor;
};

describe('list transforms midtail branches', () => {
  it('setListType：无列表返回 false；有列表改写 type', () => {
    const editor = withLists();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(
      setListType(editor, agenticListsSchema, ListType.ORDERED),
    ).toBe(false);

    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    };
    expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
      true,
    );
    expect((editor.children[0] as any).type).toBe(ListType.ORDERED);

    expect(
      setListType(editor, agenticListsSchema, ListType.UNORDERED, null),
    ).toBe(false);
  });

  it('normalizeListItemChildren：嵌套 list-item lift；非首位 list-item-text wrap', () => {
    const editor = withLists();
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'nested' }] }],
          },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeListItemChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);

    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { type: 'paragraph', children: [{ text: 'b' }] },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeListItemChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);
  });

  it('normalizeListItemChildren：text 后紧跟再 text 时 merge', () => {
    const editor = withLists();
    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'a' }] },
          { text: 'bare' },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeListItemChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);
  });

  it('decreaseListItemDepth：顶层 list-item 提升到 root', () => {
    const editor = withLists();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'only' }] },
            ],
          },
        ],
      },
    ] as Editor['children'];
    expect(decreaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
      true,
    );
  });

  it('decreaseListItemDepth：嵌套 list-item 移到祖父并清理空父 list', () => {
    const editor = withLists();
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
                      { type: 'paragraph', children: [{ text: 'sib' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as Editor['children'];
    expect(decreaseListItemDepth(editor, agenticListsSchema, [0, 0, 1, 0])).toBe(
      true,
    );
  });

  it('setListType：目标 type 与当前相同时仍返回 boolean', () => {
    const editor = withLists();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    expect(typeof setListType(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
      'boolean',
    );
  });
});
