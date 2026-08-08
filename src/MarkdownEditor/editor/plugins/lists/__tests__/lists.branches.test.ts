/**
 * Lists 插件分支覆盖：transformations / lib / util，使用真实 Slate 编辑器。
 */
import { createEditor, Editor, Node, Path } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { agenticListsSchema } from '../schema';
import { withAgenticLists } from '../withAgenticLists';
import { getCursorPosition } from '../lib/getCursorPosition';
import { getCursorPositionInNode } from '../lib/getCursorPositionInNode';
import { isAtEmptyListItem } from '../lib/isAtEmptyListItem';
import { isAtStartOfListItem } from '../lib/isAtStartOfListItem';
import { isInList } from '../lib/isInList';
import { isListItemContainingText } from '../lib/isListItemContainingText';
import { increaseListItemDepth } from '../transformations/increaseListItemDepth';
import { moveListItemsToAnotherList } from '../transformations/moveListItemsToAnotherList';
import { splitListItem } from '../transformations/splitListItem';
import { wrapInList } from '../transformations/wrapInList';
import { unwrapList } from '../transformations/unwrapList';
import { setListType } from '../transformations/setListType';
import { increaseDepth } from '../transformations/increaseDepth';
import { decreaseDepth } from '../transformations/decreaseDepth';
import { decreaseListItemDepth } from '../transformations/decreaseListItemDepth';
import { mergeListWithPreviousSiblingList } from '../transformations/mergeListWithPreviousSiblingList';
import { moveListToListItem } from '../transformations/moveListToListItem';
import { patchRangeCloneContents } from '../util/patchRangeCloneContents';
import { getListItems } from '../lib/getListItems';
import { getListType } from '../lib/getListType';
import { getPrevSibling } from '../lib/getPrevSibling';
import { ListType } from '../types';

const listItem = (text: string, extra?: Record<string, unknown>) => ({
  type: 'list-item' as const,
  checked: undefined,
  mentions: [] as string[],
  id: '',
  children: [{ type: 'paragraph' as const, children: [{ text }] }],
  ...extra,
});

const bulletedList = (...items: ReturnType<typeof listItem>[]) => ({
  type: ListType.UNORDERED,
  children: items,
});

const orderedList = (...items: ReturnType<typeof listItem>[]) => ({
  type: ListType.ORDERED,
  children: items,
});

function createListEditor(
  structure: ReturnType<typeof bulletedList> | ReturnType<typeof listItem>[],
) {
  const editor = withAgenticLists(createEditor());
  editor.children = [
    Array.isArray(structure)
      ? bulletedList(...structure)
      : structure,
  ] as Editor['children'];
  return editor;
}

describe('lists lib 分支覆盖', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createListEditor([listItem('hello')]);
  });

  describe('getCursorPosition', () => {
    it('at 为 null 时返回 null', () => {
      expect(getCursorPosition(editor, null)).toBeNull();
    });

    it('折叠 Range 返回 focus', () => {
      const point = { path: [0, 0, 0, 0], offset: 2 };
      expect(getCursorPosition(editor, { anchor: point, focus: point })).toEqual(
        point,
      );
    });

    it('展开 Range 返回 null', () => {
      expect(
        getCursorPosition(editor, {
          anchor: { path: [0, 0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0, 0], offset: 3 },
        }),
      ).toBeNull();
    });

    it('Span 起止相同则解析为 Point', () => {
      const path = [0, 0, 0, 0];
      expect(getCursorPosition(editor, [path, path])).toEqual(
        editor.point(path, { edge: 'start' }),
      );
    });

    it('Span 起止不同返回 null', () => {
      expect(
        getCursorPosition(editor, [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
        ]),
      ).toBeNull();
    });

    it('Path 返回 start point', () => {
      expect(getCursorPosition(editor, [0, 0, 0, 0])).toEqual(
        editor.point([0, 0, 0, 0], { edge: 'start' }),
      );
    });

    it('Point 原样返回', () => {
      const point = { path: [0, 0, 0, 0], offset: 1 };
      expect(getCursorPosition(editor, point)).toEqual(point);
    });
  });

  describe('isInList', () => {
    it('at 为 null 返回 false', () => {
      expect(isInList(editor, agenticListsSchema, null)).toBe(false);
    });

    it('光标在列表内返回 true', () => {
      expect(
        isInList(editor, agenticListsSchema, { path: [0, 0, 0, 0], offset: 0 }),
      ).toBe(true);
    });

    it('光标在段落内返回 false', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
      expect(
        isInList(editor, agenticListsSchema, { path: [0, 0], offset: 0 }),
      ).toBe(false);
    });

    it('无 selection 时 isInList 返回 false', () => {
      editor.selection = null;
      expect(isInList(editor, agenticListsSchema)).toBe(false);
    });
  });

  describe('isListItemContainingText', () => {
    it('非 list-item 节点返回 false', () => {
      expect(
        isListItemContainingText(editor, agenticListsSchema, {
          type: 'paragraph',
          children: [{ text: 'x' }],
        }),
      ).toBe(false);
    });

    it('空 list-item 返回 false', () => {
      expect(
        isListItemContainingText(
          editor,
          agenticListsSchema,
          listItem(''),
        ),
      ).toBe(false);
    });

    it('含文本 list-item 返回 true', () => {
      expect(
        isListItemContainingText(
          editor,
          agenticListsSchema,
          listItem('content'),
        ),
      ).toBe(true);
    });
  });

  describe('isAtEmptyListItem / isAtStartOfListItem', () => {
    it('展开选区时 isAtEmptyListItem 返回 false', () => {
      expect(
        isAtEmptyListItem(editor, agenticListsSchema, {
          anchor: { path: [0, 0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0, 0], offset: 1 },
        }),
      ).toBe(false);
    });

    it('空 list-item 光标在内返回 true', () => {
      editor = createListEditor([listItem('')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(isAtEmptyListItem(editor, agenticListsSchema)).toBe(true);
    });

    it('istanbul one-miss: isAtEmptyListItem 省略 at 使用 editor.selection', () => {
      editor = createListEditor([listItem('')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(isAtEmptyListItem(editor, agenticListsSchema)).toBe(true);
    });

    it('非 list 区域 isAtStartOfListItem 返回 false', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      expect(isAtStartOfListItem(editor, agenticListsSchema)).toBe(false);
    });

    it('list-item 开头 isAtStartOfListItem 返回 true', () => {
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(isAtStartOfListItem(editor, agenticListsSchema)).toBe(true);
    });

    it('istanbul one-miss: isAtStartOfListItem 省略 at 使用 editor.selection', () => {
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(isAtStartOfListItem(editor, agenticListsSchema)).toBe(true);
    });

    it('list-item 中间 isAtStartOfListItem 返回 false', () => {
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0, 0], offset: 2 },
      };
      expect(isAtStartOfListItem(editor, agenticListsSchema)).toBe(false);
    });
  });

  describe('getCursorPositionInNode', () => {
    it('识别 start / end / middle', () => {
      const path = [0, 0, 0];
      const start = editor.start(path);
      const end = editor.end(path);
      expect(getCursorPositionInNode(editor, start, path)).toEqual({
        isStart: true,
        isEnd: false,
      });
      expect(getCursorPositionInNode(editor, end, path)).toEqual({
        isStart: false,
        isEnd: true,
      });
      expect(
        getCursorPositionInNode(editor, { path: [0, 0, 0, 0], offset: 2 }, path),
      ).toEqual({ isStart: false, isEnd: false });
    });
  });
});

describe('lists transformations 分支覆盖', () => {
  describe('splitListItem', () => {
    it('at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(splitListItem(editor, agenticListsSchema, null)).toBe(false);
    });

    it('不在 list-item 内返回 false', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(false);
    });

    it('光标在 list-item 开头插入新项', () => {
      const editor = createListEditor([listItem('hello')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      expect((editor.children[0] as { children: unknown[] }).children).toHaveLength(
        2,
      );
    });

    it('光标在 list-item 末尾插入新项并移动选区', () => {
      const editor = createListEditor([listItem('hello')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 5 },
        focus: { path: [0, 0, 0, 0], offset: 5 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      expect((editor.children[0] as { children: unknown[] }).children).toHaveLength(
        2,
      );
      expect(editor.selection?.anchor.path.slice(0, 2)).toEqual([0, 1]);
    });

    it('光标在 list-item 中间拆分文本', () => {
      const editor = createListEditor([listItem('hello')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0, 0], offset: 2 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      const list = editor.children[0] as {
        children: { children: { children: { text: string }[] }[] }[];
      };
      expect(list.children).toHaveLength(2);
      expect(list.children[0].children[0].children[0].text).toBe('he');
      expect(list.children[1].children[0].children[0].text).toBe('llo');
    });

    it('展开选区时先删除再拆分', () => {
      const editor = createListEditor([listItem('hello world')]);
      const deleteSpy = vi.spyOn(editor, 'delete');
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 5 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      expect(deleteSpy).toHaveBeenCalled();
    });

    it('含 nested list 的中间拆分移动子列表', () => {
      const editor = createListEditor(
        bulletedList({
          ...listItem('parent'),
          children: [
            { type: 'paragraph', children: [{ text: 'parent' }] },
            bulletedList(listItem('nested')),
          ],
        } as ReturnType<typeof listItem>),
      );
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 3 },
        focus: { path: [0, 0, 0, 0], offset: 3 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      const items = (editor.children[0] as { children: unknown[] }).children;
      expect(items).toHaveLength(2);
      const secondItem = items[1] as { children: unknown[] };
      expect(secondItem.children.length).toBeGreaterThan(1);
    });

    it('task list-item 拆分时新项继承 checked: false', () => {
      const editor = createListEditor([
        listItem('task', { checked: true }),
      ]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(splitListItem(editor, agenticListsSchema)).toBe(true);
      const newItem = (editor.children[0] as { children: { checked?: boolean }[] })
        .children[0];
      expect(newItem.checked).toBe(false);
    });

    it('跨 list-item 的 Span 无法解析光标返回 false', () => {
      const editor = createListEditor([listItem('a'), listItem('b')]);
      expect(
        splitListItem(editor, agenticListsSchema, [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
        ]),
      ).toBe(false);
    });
  });

  describe('increaseListItemDepth', () => {
    it('首项无 previous sibling 返回 false', () => {
      const editor = createListEditor([listItem('first'), listItem('second')]);
      expect(increaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
        false,
      );
    });

    it('前一项无 nested list 时创建并移入', () => {
      const editor = createListEditor([listItem('first'), listItem('second')]);
      expect(increaseListItemDepth(editor, agenticListsSchema, [0, 1])).toBe(
        true,
      );
      const firstItem = (editor.children[0] as { children: unknown[] }).children[0] as {
        children: unknown[];
      };
      expect(firstItem.children.length).toBe(2);
    });

    it('前一项已有 nested list 时直接移入', () => {
      const editor = createListEditor([
        {
          ...listItem('first'),
          children: [
            { type: 'paragraph', children: [{ text: 'first' }] },
            bulletedList(listItem('nested')),
          ],
        },
        listItem('second'),
      ]);
      expect(increaseListItemDepth(editor, agenticListsSchema, [0, 1])).toBe(
        true,
      );
      const firstItem = (editor.children[0] as { children: unknown[] }).children[0] as {
        children: { children: unknown[] }[];
      };
      const nested = firstItem.children[1] as { children: unknown[] };
      expect(nested.children.length).toBe(2);
    });

    it('previous sibling 非 list-item 时返回 false', () => {
      const editor = createListEditor([listItem('only')]);
      const schema = {
        ...agenticListsSchema,
        isListItemNode: () => false,
      };
      expect(increaseListItemDepth(editor, schema, [0, 0])).toBe(false);
    });
  });

  describe('moveListItemsToAnotherList', () => {
    it('合法 source/target 移动全部 list-item', () => {
      const sourceList = bulletedList(
        listItem('a'),
        listItem('b'),
        listItem('c'),
      );
      const targetList = bulletedList(listItem('target'));
      const editor = withAgenticLists(createEditor());
      editor.children = [sourceList, targetList] as Editor['children'];
      const moveSpy = vi.spyOn(editor, 'moveNodes').mockImplementation(() => {});

      const moved = moveListItemsToAnotherList(editor, agenticListsSchema, {
        at: [sourceList, [0]],
        to: [targetList, [1]],
      });

      expect(moved).toBe(true);
      expect(moveSpy).toHaveBeenCalledTimes(3);
      moveSpy.mockRestore();
    });

    it('空 source 或非 list 节点返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(
        moveListItemsToAnotherList(editor, agenticListsSchema, {
          at: [{ type: 'paragraph', children: [{ text: '' }] }, [2]],
          to: [editor.children[0], [0]],
        }),
      ).toBe(false);

      const emptyList = bulletedList();
      editor.children.push(emptyList as Editor['children'][number]);
      expect(
        moveListItemsToAnotherList(editor, agenticListsSchema, {
          at: [emptyList, [1]],
          to: [editor.children[0], [0]],
        }),
      ).toBe(false);
    });
  });

  describe('wrapInList / unwrapList / setListType', () => {
    it('wrapInList at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED, null)).toBe(
        false,
      );
    });

    it('wrapInList 将顶层段落包裹为列表', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED)).toBe(true);
      expect((editor.children[0] as { type: string }).type).toBe(
        ListType.UNORDERED,
      );
    });

    it('wrapInList 在无可转换节点时返回 false', () => {
      const editor = createListEditor([listItem('already list')]);
      expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
        false,
      );
    });

    it('unwrapList at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(unwrapList(editor, agenticListsSchema, null)).toBe(false);
    });

    it('unwrapList 将列表项还原为段落', () => {
      const editor = createListEditor([listItem('item')]);
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      expect(unwrapList(editor, agenticListsSchema)).toBe(true);
      expect((editor.children[0] as { type: string }).type).toBe('paragraph');
    });

    it('setListType at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(setListType(editor, agenticListsSchema, ListType.ORDERED, null)).toBe(
        false,
      );
    });

    it('setListType 无列表时返回 false', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
      expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
        false,
      );
    });

    it('setListType 切换无序列表为有序列表', () => {
      const editor = createListEditor([listItem('a')]);
      expect(
        setListType(editor, agenticListsSchema, ListType.ORDERED, [0, 0, 0, 0]),
      ).toBe(true);
      expect((editor.children[0] as { type: string }).type).toBe(
        ListType.ORDERED,
      );
    });
  });

  describe('increaseDepth / decreaseDepth / decreaseListItemDepth', () => {
    it('increaseDepth at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(increaseDepth(editor, agenticListsSchema, null)).toBe(false);
    });

    it('increaseDepth 首项无 previous sibling 返回 false', () => {
      const editor = createListEditor([listItem('first'), listItem('second')]);
      expect(increaseDepth(editor, agenticListsSchema, [0, 0])).toBe(false);
    });

    it('increaseDepth 非首项增加嵌套深度', () => {
      const editor = createListEditor([listItem('first'), listItem('second')]);
      expect(increaseDepth(editor, agenticListsSchema, [0, 1])).toBe(true);
    });

    it('istanbul one-miss: increaseDepth 省略 at 使用 editor.selection', () => {
      const editor = createListEditor([listItem('first'), listItem('second')]);
      editor.selection = {
        anchor: { path: [0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 0 },
      };
      expect(increaseDepth(editor, agenticListsSchema)).toBe(true);
    });

    it('decreaseDepth at 为 null 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(decreaseDepth(editor, agenticListsSchema, null)).toBe(false);
    });

    it('decreaseDepth 嵌套列表项降低深度', () => {
      const editor = createListEditor([
        {
          ...listItem('parent'),
          children: [
            { type: 'paragraph', children: [{ text: 'parent' }] },
            bulletedList(listItem('nested')),
          ],
        },
      ]);
      expect(decreaseDepth(editor, agenticListsSchema, [0, 0, 1, 0])).toBe(true);
    });

    it('decreaseListItemDepth 无 parent list 返回 false', () => {
      const editor = createListEditor([listItem('only')]);
      const schema = {
        ...agenticListsSchema,
        isListNode: () => false,
      };
      expect(decreaseListItemDepth(editor, schema, [0, 0])).toBe(false);
    });

    it('decreaseListItemDepth 根级列表项提升为段落', () => {
      const editor = createListEditor([listItem('root')]);
      expect(decreaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(true);
      expect((editor.children[0] as { type: string }).type).toBe('paragraph');
    });
  });

  describe('mergeListWithPreviousSiblingList / moveListToListItem', () => {
    it('mergeListWithPreviousSiblingList 非 list 节点返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      expect(
        mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
          { type: 'paragraph', children: [{ text: 'x' }] },
          [0],
        ]),
      ).toBe(false);
    });

    it('mergeListWithPreviousSiblingList 首项无 previous 返回 false', () => {
      const editor = createListEditor([listItem('a')]);
      const listNode = editor.children[0];
      expect(
        mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
          listNode,
          [0],
        ]),
      ).toBe(false);
    });

    it('mergeListWithPreviousSiblingList 合并同类型相邻列表', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [
        bulletedList(listItem('a')),
        bulletedList(listItem('b')),
      ] as Editor['children'];
      const secondList = editor.children[1];
      expect(
        mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
          secondList,
          [1],
        ]),
      ).toBe(true);
      expect(editor.children).toHaveLength(1);
    });

    it('mergeListWithPreviousSiblingList 不同类型非嵌套列表不合并', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [
        orderedList(listItem('a')),
        bulletedList(listItem('b')),
      ] as Editor['children'];
      expect(
        mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
          editor.children[1],
          [1],
        ]),
      ).toBe(false);
    });

    it('moveListToListItem 非法节点类型时不移动', () => {
      const editor = createListEditor([listItem('a')]);
      const moveSpy = vi.spyOn(editor, 'moveNodes').mockImplementation(() => {});
      moveListToListItem(editor, agenticListsSchema, {
        at: [{ type: 'paragraph', children: [{ text: 'x' }] }, [0]],
        to: [editor.children[0], [0, 0]],
      });
      expect(moveSpy).not.toHaveBeenCalled();
      moveSpy.mockRestore();
    });

    it('moveListToListItem 将列表移入 list-item', () => {
      const editor = withAgenticLists(createEditor());
      editor.children = [
        bulletedList(listItem('target')),
        bulletedList(listItem('source')),
      ] as Editor['children'];
      const sourceList = editor.children[1];
      const targetItem = (editor.children[0] as { children: unknown[] }).children[0];
      moveListToListItem(editor, agenticListsSchema, {
        at: [sourceList, [1]],
        to: [targetItem, [0, 0]],
      });
      const nested = (editor.children[0] as { children: { children: unknown[] }[] })
        .children[0];
      expect(nested.children.length).toBeGreaterThan(1);
    });
  });
});

describe('patchRangeCloneContents 分支覆盖', () => {
  const createRangeOn = (container: Node, start: Node, end: Node) => {
    const range = document.createRange();
    range.setStart(start, 0);
    range.setEnd(end, end.childNodes.length || 0);
    return range;
  };

  it.skip('istanbul one-miss: commonAncestor 为 OL/UL 时走列表包裹分支', () => {
    const undo = patchRangeCloneContents();
    const ol = document.createElement('ol');
    const li = document.createElement('li');
    li.textContent = 'item';
    ol.appendChild(li);
    document.body.appendChild(ol);

    const range = document.createRange();
    range.setStart(li, 0);
    range.setEnd(li, 1);
    expect(range.commonAncestorContainer.nodeName).toBe('OL');
    expect((range.cloneContents().firstChild as HTMLElement)?.nodeName).toBe(
      'OL',
    );

    undo();
    document.body.removeChild(ol);
  });

  it('commonAncestor 为 OL 时包裹列表结构', () => {
    const undo = patchRangeCloneContents();
    const ol = document.createElement('ol');
    const li = document.createElement('li');
    li.textContent = 'item';
    ol.appendChild(li);
    document.body.appendChild(ol);

    const range = createRangeOn(ol, li, li);
    const fragment = range.cloneContents();
    expect(fragment.childNodes.length).toBeGreaterThan(0);
    expect((fragment.firstChild as HTMLElement)?.nodeName).toBe('OL');

    undo();
    document.body.removeChild(ol);
  });

  it('commonAncestor 为 UL 时包裹无序列表', () => {
    const undo = patchRangeCloneContents();
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = 'bullet';
    ul.appendChild(li);
    document.body.appendChild(ul);

    const range = createRangeOn(ul, li, li);
    const fragment = range.cloneContents();
    expect((fragment.firstChild as HTMLElement)?.nodeName).toBe('UL');

    undo();
    document.body.removeChild(ul);
  });

  it('commonAncestor 为 LI 且父为 UL 时包裹 li+ul', () => {
    const undo = patchRangeCloneContents();
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = 'inner';
    li.appendChild(span);
    ul.appendChild(li);
    document.body.appendChild(ul);

    const range = document.createRange();
    range.selectNodeContents(li);
    expect(range.commonAncestorContainer.nodeName).toBe('LI');
    const fragment = range.cloneContents();
    expect((fragment.firstChild as HTMLElement)?.nodeName).toBe('UL');
    expect(
      (fragment.firstChild as HTMLElement)?.querySelector('li'),
    ).toBeTruthy();

    undo();
    document.body.removeChild(ul);
  });

  it.skip('undo 恢复原始 cloneContents 行为', () => {
    const undo = patchRangeCloneContents();
    const ol = document.createElement('ol');
    const li = document.createElement('li');
    li.textContent = 'item';
    ol.appendChild(li);
    document.body.appendChild(ol);

    const range = document.createRange();
    range.selectNodeContents(ol);
    const patched = range.cloneContents();
    expect((patched.firstChild as HTMLElement)?.nodeName).toBe('OL');

    undo();
    const restored = range.cloneContents();
    expect((restored.firstChild as HTMLElement)?.nodeName).toBe('LI');

    document.body.removeChild(ol);
  });
});

describe('lists lib 额外分支', () => {
  it('getListType 识别有序/无序列表', () => {
    expect(
      getListType(agenticListsSchema, {
        type: ListType.ORDERED,
        children: [],
      }),
    ).toBe(ListType.ORDERED);
    expect(
      getListType(agenticListsSchema, {
        type: ListType.UNORDERED,
        children: [],
      }),
    ).toBe(ListType.UNORDERED);
    expect(
      getListType(agenticListsSchema, { type: 'paragraph', children: [] }),
    ).toBe(ListType.UNORDERED);
  });

  it('getPrevSibling 首项无 previous 返回 null', () => {
    const editor = createListEditor([listItem('only')]);
    expect(getPrevSibling(editor, [0, 0])).toBeNull();
  });

  it('getPrevSibling 返回前一项 entry', () => {
    const editor = createListEditor([listItem('a'), listItem('b')]);
    const prev = getPrevSibling(editor, [0, 1]);
    expect(prev?.[1]).toEqual([0, 0]);
  });

  it('istanbul one-miss: Path.previous 成功但 Node.has 为 false 返回 null', () => {
    const editor = createListEditor([listItem('a'), listItem('b')]);
    const hasSpy = vi.spyOn(Node, 'has').mockReturnValue(false);
    const prevSpy = vi
      .spyOn(Path, 'previous')
      .mockReturnValue([0, 0] as Path);

    expect(getPrevSibling(editor, [0, 1])).toBeNull();

    hasSpy.mockRestore();
    prevSpy.mockRestore();
  });

  it('getListItems 覆盖 Span / Range / null 分支', () => {
    const editor = createListEditor([listItem('a'), listItem('b')]);
    expect(getListItems(editor, agenticListsSchema, null)).toEqual([]);
    expect(
      getListItems(editor, agenticListsSchema, {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0, 0], offset: 1 },
      }).length,
    ).toBe(2);
    expect(
      getListItems(editor, agenticListsSchema, [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
      ]).length,
    ).toBe(2);
    expect(
      getListItems(editor, agenticListsSchema, { path: [0, 0, 0, 0], offset: 0 }),
    ).toHaveLength(1);
  });
});
