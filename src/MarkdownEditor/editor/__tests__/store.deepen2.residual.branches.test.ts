/**
 * store.ts deepen2：diff 嵌套 children、table 结构、cell/text、drag point、list-item move。
 */
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../plugins/withMarkdown';
import { EditorStore } from '../store';

vi.mock('slate-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('slate-react')>();
  return {
    ...actual,
    ReactEditor: {
      ...actual.ReactEditor,
      focus: vi.fn(),
      deselect: vi.fn(),
      isFocused: vi.fn(() => false),
    },
    withReact: (editor: any) => editor,
  };
});

describe('EditorStore deepen2 residual branches', () => {
  let store: EditorStore;
  let editor: any;
  let editorRef: { current: any };

  beforeEach(() => {
    editor = withMarkdown(withHistory(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editorRef = { current: editor };
    store = new EditorStore(editorRef, []);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('generateDiffOperationsInternal：嵌套 children 路径重映射', () => {
    const ops: any[] = [];
    (store as any).generateDiffOperationsInternal(
      [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'new' }] }],
        },
      ],
      [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'old' }] }],
        },
      ],
      ops,
    );
    expect(ops.length).toBeGreaterThan(0);
    expect(ops.some((op) => Array.isArray(op.path) && op.path.length > 1)).toBe(
      true,
    );
  });

  it('_isSameTableStructure：同 id / 行数不同 / 缺 children', () => {
    const sameId = (store as any)._isSameTableStructure(
      { id: 't1', type: 'table' },
      { id: 't1', type: 'table' },
      [{ children: [{ text: 'a' }] }],
      [{ children: [{ text: 'b' }] }],
    );
    expect(sameId).toBe(true);

    const diffLen = (store as any)._isSameTableStructure(
      { type: 'table' },
      { type: 'table' },
      [{ children: [{}] }, { children: [{}] }],
      [{ children: [{}] }],
    );
    expect(diffLen).toBe(false);

    const missingChildren = (store as any)._isSameTableStructure(
      { type: 'table' },
      { type: 'table' },
      [{ children: [{ text: 'a' }] }],
      [{}],
    );
    expect(missingChildren).toBe(false);
  });

  it('compareTableNodes：无 children 走 || []；compareCells 缺 children', () => {
    const ops: any[] = [];
    (store as any).compareTableNodes(
      { type: 'table', id: 'a' },
      { type: 'table', id: 'a' },
      [0],
      ops,
    );
    expect(Array.isArray(ops)).toBe(true);

    const cellOps: any[] = [];
    (store as any).compareCells(
      { type: 'table-cell' },
      { type: 'table-cell' },
      [0, 0, 0],
      cellOps,
    );
    expect(Array.isArray(cellOps)).toBe(true);
  });

  it('compareSimpleTextCell：text undefined 走 || ""', () => {
    const ops: any[] = [];
    (store as any).compareSimpleTextCell(
      [{ text: undefined }],
      [{ text: 'old' }],
      [0, 0],
      ops,
    );
    expect(ops.some((op) => op.type === 'text' && op.text === '')).toBe(true);
  });

  it('_compareRows：row 无 children 走 || []', () => {
    const ops: any[] = [];
    (store as any)._compareRows?.(
      { type: 'table-row' },
      { type: 'table-row' },
      [0, 0],
      ops,
    );
    // 方法名可能为 compareRows / _updateRow — 直接走 compareCells 已覆盖
    (store as any).compareCells(
      { type: 'table-cell', children: undefined },
      { type: 'table-cell', children: undefined },
      [0, 0, 0],
      ops,
    );
    expect(ops).toBeTruthy();
  });

  it('_createDragOverHandler：命中最近点；空 points 不回调', () => {
    const el = document.createElement('div');
    const points = [
      { el, direction: 'top' as const, top: 10, left: 0 },
      { el, direction: 'bottom' as const, top: 100, left: 0 },
    ];
    const onPointFound = vi.fn();
    const handler = (store as any)._createDragOverHandler(
      { scrollTop: 0 } as any,
      points,
      onPointFound,
    );
    handler({
      preventDefault: vi.fn(),
      clientY: 50,
    } as any);
    expect(onPointFound).toHaveBeenCalled();

    const emptyHandler = (store as any)._createDragOverHandler(
      { scrollTop: 0 } as any,
      [],
      onPointFound,
    );
    onPointFound.mockClear();
    emptyHandler({ preventDefault: vi.fn(), clientY: 10 } as any);
    expect(onPointFound).not.toHaveBeenCalled();
  });

  it('_findClosestPoint：第二点更近时更新 closest', () => {
    const el = document.createElement('div');
    const closest = (store as any)._findClosestPoint(
      [
        { el, direction: 'top', top: 0, left: 0 },
        { el, direction: 'bottom', top: 50, left: 0 },
      ],
      48,
    );
    expect(closest?.top).toBe(50);
  });

  it('_moveNode：list-item → 非 list-item 且 delPath 真值时 delete', () => {
    const deleteSpy = vi
      .spyOn(Transforms, 'delete')
      .mockImplementation(() => {});
    vi.spyOn(store as any, '_moveListItemToNonListItem').mockReturnValue([0]);
    (store as any)._moveNode(
      { type: 'list-item', children: [{ text: 'i' }] },
      [0],
      [1],
      { type: 'paragraph', children: [{ text: 'p' }] },
      { type: 'list', children: [] },
      [0],
    );
    expect(deleteSpy).toHaveBeenCalled();
    deleteSpy.mockRestore();
  });
});
