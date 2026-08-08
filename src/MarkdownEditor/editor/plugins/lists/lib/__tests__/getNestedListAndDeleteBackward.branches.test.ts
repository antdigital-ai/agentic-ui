/**
 * getNestedList / isDeleteBackwardAllowed / ListsEditor registry 分支。
 */
import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { withAgenticLists } from '../../withAgenticLists';
import { ListsEditor } from '../../ListsEditor';
import { getNestedList } from '../getNestedList';
import { isDeleteBackwardAllowed } from '../isDeleteBackwardAllowed';
import { ListType } from '../../types';

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

const bulletedList = (...items: ReturnType<typeof listItem>[]) => ({
  type: ListType.UNORDERED,
  children: items,
});

function createListEditor(
  structure: ReturnType<typeof bulletedList>,
) {
  const editor = withAgenticLists(createEditor());
  editor.children = [structure] as Editor['children'];
  return editor;
}

describe('getNestedList branches', () => {
  it('无嵌套 list 返回 null', () => {
    const editor = createListEditor(bulletedList(listItem('a')));
    expect(getNestedList(editor, agenticListsSchema, [0, 0])).toBeNull();
  });

  it('有嵌套 list 返回 entry', () => {
    const nested = bulletedList(listItem('child'));
    const editor = createListEditor(
      bulletedList(listItem('parent', nested)),
    );
    const entry = getNestedList(editor, agenticListsSchema, [0, 0]);
    expect(entry).not.toBeNull();
    expect(entry![1]).toEqual([0, 0, 1]);
  });

  it('嵌套非 list 节点返回 null', () => {
    const editor = createListEditor(
      bulletedList(
        listItem('x', {
          type: 'paragraph',
          children: [{ text: 'not-list' }],
        }),
      ),
    );
    expect(getNestedList(editor, agenticListsSchema, [0, 0])).toBeNull();
  });
});

describe('isDeleteBackwardAllowed branches', () => {
  it('选区不在 list 内返回 true', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ] as Editor['children'];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema),
    ).toBe(true);
  });

  it('at 为 null 且无选区返回 true', () => {
    const editor = createListEditor(bulletedList(listItem('a')));
    editor.selection = null;
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema, null),
    ).toBe(true);
  });

  it('首个顶层 list-item 且在开头不允许', () => {
    const editor = createListEditor(
      bulletedList(listItem('first'), listItem('second')),
    );
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema),
    ).toBe(false);
  });

  it('第二个 sibling 允许', () => {
    const editor = createListEditor(
      bulletedList(listItem('first'), listItem('second')),
    );
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema),
    ).toBe(true);
  });

  it('嵌套 list-item 允许', () => {
    const nested = bulletedList(listItem('child'));
    const editor = createListEditor(
      bulletedList(listItem('parent', nested)),
    );
    editor.selection = {
      anchor: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
    };
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema),
    ).toBe(true);
  });

  it('首项但不在开头允许', () => {
    const editor = createListEditor(bulletedList(listItem('hello')));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0, 0], offset: 2 },
    };
    expect(
      isDeleteBackwardAllowed(editor, agenticListsSchema),
    ).toBe(true);
  });
});

describe('ListsEditor registry branches', () => {
  it('未启用 lists 时 isListsEnabled false 且 schema undefined', () => {
    const editor = createEditor();
    expect(ListsEditor.isListsEnabled(editor)).toBe(false);
    expect(ListsEditor.getListsSchema(editor)).toBeUndefined();
  });

  it('withAgenticLists 后启用并返回 schema', () => {
    const editor = withAgenticLists(createEditor());
    expect(ListsEditor.isListsEnabled(editor)).toBe(true);
    const schema = ListsEditor.getListsSchema(editor);
    expect(schema?.isListNode).toBeTypeOf('function');
  });

  it('wrapInList 默认 UNORDERED', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'x' }] },
    ] as Editor['children'];
    Transforms.select(editor, Editor.start(editor, []));
    ListsEditor.wrapInList(editor);
    expect((editor.children[0] as any).type).toBe(ListType.UNORDERED);
  });
});
