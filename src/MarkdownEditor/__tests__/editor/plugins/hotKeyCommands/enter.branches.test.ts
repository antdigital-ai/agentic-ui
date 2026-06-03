import { Editor, Node, Path, Point, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../../../../editor/plugins/hotKeyCommands/enter';

vi.mock('../../../../editor/utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    moveNodes: vi.fn(),
    cutText: vi.fn(() => [{ text: 'cut' }]),
    clearMarks: vi.fn(),
    isTop: vi.fn().mockReturnValue(false),
  },
}));

// Mock BlockMathNodes 使其包含一个可匹配的正则
vi.mock('../../../../editor/plugins/elements', () => ({
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
      withoutNormalizing: vi.fn((fn: () => void) => fn()),
    };
    mockStore = { editor: mockEditor, inputComposition: false };
    mockBackspace = { range: vi.fn() };
    enterKey = new EnterKey(mockStore, mockBackspace);
  });

  /* ====== empty() — list-item 分支 ====== */

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
        await import('../../../../editor/plugins/elements');
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

});
