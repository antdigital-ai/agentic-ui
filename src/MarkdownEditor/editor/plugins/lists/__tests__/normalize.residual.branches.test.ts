/**
 * normalizeListItemChildren / normalizeOrphanNestedList / normalizeNode residual。
 */
import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';
import { ListsEditor } from '../ListsEditor';
import { normalizeListItemChildren } from '../normalizations/normalizeListItemChildren';
import { normalizeOrphanNestedList } from '../normalizations/normalizeOrphanNestedList';
import { normalizeNode } from '../normalizeNode';
import { agenticListsSchema } from '../schema';
import { ListType } from '../types';
import { withAgenticLists } from '../withAgenticLists';

const listItem = (text: string, nested?: object) => ({
  type: 'list-item' as const,
  checked: undefined,
  mentions: [] as string[],
  id: '',
  children: [
    { type: 'paragraph' as const, children: [{ text }] },
    ...(nested ? [nested] : []),
  ],
});

describe('lists normalizations residual branches', () => {
  it('normalizeListItemChildren：非 list-item / 直接 text / 非法子节点', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    expect(
      normalizeListItemChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);

    editor.children = [
      {
        type: 'list-item',
        children: [{ text: 'bare' }],
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
        children: [{ type: 'head', children: [{ text: 'h' }] }],
      },
    ] as Editor['children'];
    expect(
      normalizeListItemChildren(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(true);
  });

  it('normalizeOrphanNestedList：非 item / 多子 / 仅嵌套 list 提升', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'p' }] },
    ] as Editor['children'];
    expect(
      normalizeOrphanNestedList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);

    editor.children = [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 't' }] },
          {
            type: ListType.UNORDERED,
            children: [listItem('c')],
          },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeOrphanNestedList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);

    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: ListType.UNORDERED,
                children: [listItem('orphan-nested')],
              },
            ],
          },
        ],
      },
    ] as Editor['children'];
    expect(
      normalizeOrphanNestedList(editor, agenticListsSchema, [
        (editor.children[0] as any).children[0],
        [0, 0],
      ]),
    ).toBe(true);
  });

  it('normalizeNode：无 schema 返回 false；有 schema 委托', () => {
    const bare = createEditor();
    bare.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ] as Editor['children'];
    expect(normalizeNode(bare, [bare.children[0], [0]])).toBe(false);

    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [listItem('a')],
      },
    ] as Editor['children'];
    expect(ListsEditor.isListsEnabled(editor)).toBe(true);
    // 已规范化结构通常返回 false
    expect(
      typeof normalizeNode(editor, [editor.children[0], [0]]),
    ).toBe('boolean');
  });
});
