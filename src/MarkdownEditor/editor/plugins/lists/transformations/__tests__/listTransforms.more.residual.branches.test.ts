/**
 * getListItems / setListType / increase|decrease depth residual。
 */
import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';
import { getListItems } from '../../lib/getListItems';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { decreaseDepth } from '../decreaseDepth';
import { increaseListItemDepth } from '../increaseListItemDepth';
import { setListType } from '../setListType';

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

const bulleted = (...items: ReturnType<typeof listItem>[]) => ({
  type: ListType.UNORDERED,
  children: items,
});

function listEditor(structure: ReturnType<typeof bulleted>) {
  const editor = withAgenticLists(createEditor());
  editor.children = [structure] as Editor['children'];
  return editor;
}

describe('lists transformations / getListItems residual', () => {
  it('getListItems：at=null / Point / Path / Span / Range', () => {
    const editor = listEditor(bulleted(listItem('a'), listItem('b')));
    editor.selection = null;
    expect(getListItems(editor, agenticListsSchema, null)).toEqual([]);
    expect(getListItems(editor, agenticListsSchema)).toEqual([]);

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    expect(
      getListItems(editor, agenticListsSchema, {
        path: [0, 0, 0, 0],
        offset: 0,
      }).length,
    ).toBeGreaterThan(0);
    expect(getListItems(editor, agenticListsSchema, [0, 0]).length).toBeGreaterThan(
      0,
    );
    expect(
      getListItems(editor, agenticListsSchema, [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
      ]).length,
    ).toBeGreaterThan(0);
    expect(
      getListItems(editor, agenticListsSchema, {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 1 },
      }).length,
    ).toBeGreaterThan(0);
  });

  it('setListType：无选区 / 无 list / 切换 ordered', () => {
    const plain = withAgenticLists(createEditor());
    plain.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    plain.selection = null;
    expect(setListType(plain, agenticListsSchema, ListType.ORDERED)).toBe(
      false,
    );

    plain.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(setListType(plain, agenticListsSchema, ListType.ORDERED)).toBe(
      false,
    );

    const editor = listEditor(bulleted(listItem('a')));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    };
    expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
      true,
    );
    expect((editor.children[0] as { type: string }).type).toBe(
      ListType.ORDERED,
    );
  });

  it('increaseListItemDepth：无 prev sibling 返回 false；有则嵌套', () => {
    const editor = listEditor(bulleted(listItem('first'), listItem('second')));
    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
      false,
    );
    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 1])).toBe(
      true,
    );
  });

  it('decreaseDepth：at=null false；顶层 list-item 可 unwrap', () => {
    const editor = listEditor(bulleted(listItem('only')));
    editor.selection = null;
    expect(decreaseDepth(editor, agenticListsSchema, null)).toBe(false);
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    expect(decreaseDepth(editor, agenticListsSchema)).toBe(true);
  });
});
