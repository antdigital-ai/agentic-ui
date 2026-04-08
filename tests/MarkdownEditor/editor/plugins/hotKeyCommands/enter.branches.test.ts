import { Editor, Node, Path, Point, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../../../../../src/MarkdownEditor/editor/plugins/hotKeyCommands/enter';

vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    moveNodes: vi.fn(),
    cutText: vi.fn(() => [{ text: 'cut' }]),
    clearMarks: vi.fn(),
    isTop: vi.fn().mockReturnValue(false),
  },
}));

// Mock BlockMathNodes 使其包含一个可匹配的正则
vi.mock('../../../../../src/MarkdownEditor/editor/plugins/elements', () => ({
  BlockMathNodes: [
    {
      type: 'code',
      reg: /^```(\w*)$/,
      run: vi.fn(),
    },
  ],
}));

describe('enter.ts 分支覆盖', () => {
  let mockStore: any;
  let mockEditor: any;
  let mockBackspace: any;
  let enterKey: EnterKey;

  const makeEvent = (overrides: Record<string, any> = {}) => ({
    key: 'Enter',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor = {
      selection: null,
      children: [],
      insertBreak: vi.fn(),
    };
    mockStore = { editor: mockEditor, inputComposition: false };
    mockBackspace = { range: vi.fn() };
    enterKey = new EnterKey(mockStore, mockBackspace);
  });

  /* ====== empty() — list-item 分支 ====== */

  describe('empty — list-item realEmpty 且为列表第一个子项', () => {
    it('删除空项并在列表前插入段落', () => {
      const e = makeEvent();
      const path = [0, 0, 0]; // child of list-item

      // parent(path) → list-item (只有 1 个 children → realEmpty)
      // parent(parentPath) → ul (有 2 个 children → 不是唯一子项)
      vi.spyOn(Editor, 'parent')
        .mockReturnValueOnce([
          { type: 'list-item', children: [{ text: '' }] },
          [0, 0],
        ] as any)
        .mockReturnValueOnce([
          {
            type: 'list',
            children: [{ type: 'list-item' }, { type: 'list-item' }],
          },
          [0],
        ] as any);

      // parentPath=[0,0], hasPrevious → false (第一个子项)
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      // next(parentPath)=[0,1] 存在 → 不是唯一子项的"最后"检查
      vi.spyOn(Editor, 'hasPath').mockReturnValue(true);

      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});
      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).empty(e, path);

      expect(deleteSpy).toHaveBeenCalledWith(mockEditor, { at: [0, 0] });
      expect(insertSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });
  });

  describe('empty — list-item realEmpty 且为列表最后一个子项', () => {
    it('删除空项并在列表后插入段落', () => {
      const e = makeEvent();
      const path = [0, 1, 0];

      vi.spyOn(Editor, 'parent')
        .mockReturnValueOnce([
          { type: 'list-item', children: [{ text: '' }] },
          [0, 1],
        ] as any)
        .mockReturnValueOnce([
          {
            type: 'list',
            children: [{ type: 'list-item' }, { type: 'list-item' }],
          },
          [0],
        ] as any);

      // parentPath=[0,1], hasPrevious → true (不是第一个)
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(true);
      // next(parentPath)=[0,2] 不存在 → 是最后一个
      vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});
      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).empty(e, path);

      expect(deleteSpy).toHaveBeenCalledWith(mockEditor, { at: [0, 1] });
      expect(insertSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });
  });

  describe('empty — list-item 非空，path 为首子且有后续', () => {
    it('在列表项开头按回车插入新空列表项', () => {
      const e = makeEvent();
      const path = [0, 0, 0];

      // parent → list-item with 2 children → NOT realEmpty
      vi.spyOn(Editor, 'parent')
        .mockReturnValueOnce([
          {
            type: 'list-item',
            children: [{ text: 'a' }, { text: 'b' }],
          },
          [0, 0],
        ] as any)
        .mockReturnValueOnce([
          { type: 'list', children: [{ type: 'list-item' }] },
          [0],
        ] as any);

      // path 有 next → hasPath true
      vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
      // path 没有 previous → hasPrevious false
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      vi.spyOn(Path, 'next').mockReturnValue([0, 1]);

      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).empty(e, path);

      expect(e.preventDefault).toHaveBeenCalled();
      expect(insertSpy).toHaveBeenCalled();
    });
  });

  describe('table — Ctrl+Enter 插入新行', () => {
    it('Ctrl 无 Shift 时插入新表格行并选中', () => {
      const e = makeEvent({ ctrlKey: true, shiftKey: false });
      const node = [
        {
          type: 'table-cell',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
        [0, 0, 0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };

      // Editor.parent(editor, node[1]) → table-row
      vi.spyOn(Editor, 'parent').mockReturnValue([
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [] },
            { type: 'table-cell', children: [] },
          ],
        },
        [0, 0],
      ] as any);

      vi.spyOn(Path, 'next').mockReturnValue([0, 1]);
      vi.spyOn(Editor, 'start').mockReturnValue({
        path: [0, 1, 0, 0],
        offset: 0,
      });

      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      (enterKey as any).table(node, sel, e);

      expect(insertSpy).toHaveBeenCalled();
      // 检查插入的行有 2 个 table-cell
      const insertedRow = insertSpy.mock.calls[0][1] as any;
      expect(insertedRow.type).toBe('table-row');
      expect(insertedRow.children).toHaveLength(2);
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('paragraph — 空文本时 early return', () => {
    it('段落文本为空时直接返回 undefined', () => {
      const e = makeEvent();
      const node = [
        { type: 'paragraph', children: [{ text: '' }] },
        [0, 0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };

      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'div', children: [] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0, 0], offset: 0 });
      vi.spyOn(Point, 'equals').mockReturnValue(true);
      vi.spyOn(Node, 'string').mockReturnValue('');

      const result = (enterKey as any).paragraph(e, node, sel);
      expect(result).toBeUndefined();
    });
  });

  describe('paragraph — 匹配 BlockMathNodes 正则', () => {
    it('文本匹配 ``` 正则时调用 n.run 并返回 true', async () => {
      const { BlockMathNodes } =
        await import('../../../../../src/MarkdownEditor/editor/plugins/elements');
      const e = makeEvent();
      const node = [
        { type: 'paragraph', children: [{ text: '```js' }] },
        [0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      };

      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'div', children: [] },
        [],
      ] as any);
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 5 });
      vi.spyOn(Point, 'equals').mockReturnValue(true);
      vi.spyOn(Node, 'string').mockReturnValue('```js');
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(true);

      const result = (enterKey as any).paragraph(e, node, sel);

      expect(BlockMathNodes[0].run).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('paragraph — list-item isMod 路径，hasPath false', () => {
    it('next path 不存在时仍然调用 select', () => {
      const e = makeEvent({ ctrlKey: true });
      const node = [
        { type: 'paragraph', children: [{ text: 'item' }] },
        [0, 0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 2 },
      };

      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'list-item', children: [node[0]] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0, 0], offset: 4 });
      // Point.equals 全部返回 false：
      vi.spyOn(Point, 'equals').mockReturnValue(false);
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(true);
      vi.spyOn(Path, 'next').mockReturnValue([0, 1]);
      vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
      vi.spyOn(Editor, 'start').mockReturnValue({
        path: [0, 1, 0],
        offset: 0,
      });

      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});
      vi.spyOn(Transforms, 'delete').mockImplementation(() => {});

      const result = (enterKey as any).paragraph(e, node, sel);

      expect(insertSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('paragraph — list-item else 分支，非起始位置 checked', () => {
    it('checked 列表项中光标不在起始，触发 delete', () => {
      const e = makeEvent();
      const node = [
        { type: 'paragraph', children: [{ text: 'item' }] },
        [0, 0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 2 },
      };

      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'list-item', checked: false, children: [node[0]] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0, 0], offset: 4 });
      vi.spyOn(Point, 'equals').mockReturnValue(false);
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      vi.spyOn(Path, 'next').mockReturnValue([1]);
      vi.spyOn(Editor, 'start').mockReturnValue({
        path: [1, 0, 0],
        offset: 0,
      });
      vi.spyOn(Node, 'string').mockReturnValue('item');
      vi.spyOn(Node, 'get').mockReturnValue(node[0]);

      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      (enterKey as any).paragraph(e, node, sel);

      expect(e.preventDefault).toHaveBeenCalled();
      expect(insertSpy).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('paragraph — list-item 有 checked 且光标在起始位置', () => {
    it('在 checkbox list-item 开头按回车，插入新空列表项并返回', () => {
      const e = makeEvent();
      const node = [
        { type: 'paragraph', children: [{ text: 'item' }] },
        [0, 0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };

      vi.spyOn(Editor, 'parent').mockReturnValue([
        {
          type: 'list-item',
          checked: true,
          children: [node[0]],
        },
        [0],
      ] as any);
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0, 0], offset: 4 });
      // focus != end → 不是末尾
      vi.spyOn(Point, 'equals').mockReturnValue(false);
      // node[1]=[0,0], hasPrevious → false
      vi.spyOn(Path, 'hasPrevious')
        .mockReturnValueOnce(false) // node[1]
        .mockReturnValueOnce(false) // sel.anchor.path
        .mockReturnValueOnce(false); // node[1] again
      vi.spyOn(Path, 'next').mockReturnValue([1]);
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [1, 0, 0], offset: 0 });

      const insertSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      const result = (enterKey as any).paragraph(e, node, sel);

      expect(e.preventDefault).toHaveBeenCalled();
      expect(insertSpy).toHaveBeenCalled();
      // 插入的节点应有 checked: false
      const inserted = insertSpy.mock.calls[0][1] as any;
      expect(inserted.type).toBe('list-item');
      expect(inserted.checked).toBe(false);
      expect(selectSpy).toHaveBeenCalled();
      expect(result).toBeUndefined(); // 走了 return（无值）
    });
  });
});
