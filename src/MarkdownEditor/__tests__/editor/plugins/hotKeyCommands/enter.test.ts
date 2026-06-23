/**
 * enter.ts 测试用例
 *
 * 测试回车键相关操作的处理逻辑
 */

import { Editor, Node, Path, Point, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnterKey } from '../../../../editor/plugins/hotKeyCommands/enter';

// Mock EditorUtils
vi.mock('../../../../editor/utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    moveNodes: vi.fn(),
    cutText: vi.fn(),
    clearMarks: vi.fn(),
    isTop: vi.fn().mockReturnValue(false),
  },
}));

describe('enter.ts', () => {
  let mockStore: any;
  let mockEditor: any;
  let mockEvent: any;
  let mockBackspace: any;
  let enterKey: EnterKey;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock editor
    mockEditor = {
      selection: null,
      children: [],
      insertBreak: vi.fn(),
      hasPath: vi.fn().mockReturnValue(true),
      withoutNormalizing: vi.fn((fn: () => void) => fn()),
    };

    // Create mock store
    mockStore = {
      editor: mockEditor,
      inputComposition: false,
    };

    // Create mock backspace
    mockBackspace = {
      range: vi.fn(),
    };

    // Create mock event
    mockEvent = {
      key: 'Enter',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: vi.fn(),
    };

    // Create EnterKey instance
    enterKey = new EnterKey(mockStore, mockBackspace);
  });

  describe('run 方法', () => {
    it('应该在没有选区时直接返回', () => {
      mockEditor.selection = null;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockBackspace.range).not.toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该在输入组合时直接返回', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      mockStore.inputComposition = true;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockBackspace.range).not.toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理未折叠的选区', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(false);

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockBackspace.range).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 card-before 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'card-before', children: [{ text: '' }] },
            [0, 0],
          ] as any;
        })(),
      );

      // Mock Path.parent
      vi.spyOn(Path, 'parent').mockReturnValue([0]);

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      enterKey.run(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 card-after 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'card-after', children: [{ text: '' }] },
            [0, 0],
          ] as any;
        })(),
      );

      // Mock Path.parent and Path.next
      vi.spyOn(Path, 'parent').mockReturnValue([0]);
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      enterKey.run(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 head 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'head', children: [{ text: 'Title' }] },
            [0, 0],
          ] as any;
        })(),
      );

      // Mock enterKey.head method
      const headSpy = vi.spyOn(enterKey as any, 'head').mockReturnValue(true);

      enterKey.run(mockEvent);

      expect(headSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 paragraph 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'paragraph', children: [{ text: 'Text' }] },
            [0, 0],
          ] as any;
        })(),
      );

      // Mock enterKey.paragraph method
      const paragraphSpy = vi
        .spyOn(enterKey as any, 'paragraph')
        .mockReturnValue(true);

      enterKey.run(mockEvent);

      expect(paragraphSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 table-cell 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'table-cell', children: [{ text: 'Cell' }] },
            [0, 0, 0],
          ] as any;
        })(),
      );

      // Mock Editor.parent
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'table-row', children: [] },
        [0, 0],
      ] as any);

      // Mock enterKey.table method
      const tableSpy = vi
        .spyOn(enterKey as any, 'table')
        .mockImplementation(() => {});

      enterKey.run(mockEvent);

      expect(tableSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 blockquote 或 list-item 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [
            { type: 'blockquote', children: [{ text: 'Quote' }] },
            [0, 0],
          ] as any;
        })(),
      );

      // Mock enterKey.empty method
      const emptySpy = vi
        .spyOn(enterKey as any, 'empty')
        .mockImplementation(() => {});

      enterKey.run(mockEvent);

      expect(emptySpy).toHaveBeenCalled();
      expect(mockEditor.insertBreak).not.toHaveBeenCalled();
    });

    it('应该处理 break 类型元素', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [{ type: 'break', children: [{ text: '' }] }, [0, 0]] as any;
        })(),
      );

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      enterKey.run(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该在没有匹配元素时调用 insertBreak', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);

      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue(
        (function* () {
          yield [{ type: 'unknown', children: [{ text: '' }] }, [0, 0]] as any;
        })(),
      );

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEditor.insertBreak).toHaveBeenCalled();
    });
  });

  describe('head 方法', () => {
    it('应该在光标位于标题开始位置时插入段落', () => {
      const el = { type: 'head', children: [{ text: 'Title' }] };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Range.start
      vi.spyOn(Range, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Point.equals
      vi.spyOn(Point, 'equals').mockReturnValue(true);

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      const result = (enterKey as any).head(el, path, sel);

      expect(result).toBe(true);
      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该在光标位于标题结束位置时插入段落', () => {
      const el = { type: 'head', children: [{ text: 'Title' }] };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      };

      // Mock Range.start
      vi.spyOn(Range, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Point.equals (start)
      vi.spyOn(Point, 'equals')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      // Mock Range.end
      vi.spyOn(Range, 'end').mockReturnValue({ path: [0, 0], offset: 5 });

      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 5 });

      // Mock Path.next
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      const result = (enterKey as any).head(el, path, sel);

      expect(result).toBe(true);
      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该在光标位于标题中间位置时分割标题', () => {
      const el = { type: 'head', children: [{ text: 'Title' }] };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      };

      // Mock Range.start
      vi.spyOn(Range, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [0, 0], offset: 0 });

      // Mock Point.equals (start)
      vi.spyOn(Point, 'equals')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      // Mock Range.end
      vi.spyOn(Range, 'end').mockReturnValue({ path: [0, 0], offset: 5 });

      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 5 });

      // Mock Node.fragment
      vi.spyOn(Node, 'fragment').mockReturnValue([
        { children: [{ text: 'le' }] },
      ]);

      // Mock Transforms.delete
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      // Mock Transforms.select
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [1, 0], offset: 0 });

      // Mock Path.next
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      const result = (enterKey as any).head(el, path, sel);

      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalled();
      expect(insertNodesSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('paragraph 方法', () => {
    it('应该处理段落结尾的数学表达式', () => {
      const e = { preventDefault: vi.fn() };
      const node = [
        { type: 'paragraph', children: [{ text: '$$math$$' }] },
        [0],
      ] as any;
      const sel = {
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      };

      // Mock Editor.parent
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'div', children: [] },
        [],
      ] as any);

      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 8 });

      // Mock Point.equals
      vi.spyOn(Point, 'equals').mockReturnValue(true);

      // Mock Node.string
      vi.spyOn(Node, 'string').mockReturnValue('$$math$$');

      (enterKey as any).paragraph(e, node, sel);

      // 由于我们没有完全模拟 BlockMathNodes，这里只是确保方法被调用
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

  });

  describe('empty 方法', () => {
    it('应该处理空的 blockquote', () => {
      const e = { preventDefault: vi.fn() };
      const path = [0, 0];

      // Mock Editor.parent
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'blockquote', children: [] },
        [0],
      ] as any);

      // Mock Path.hasPrevious
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);

      // Mock Editor.hasPath
      mockEditor.hasPath = vi.fn().mockReturnValue(false);

      // Mock Transforms.delete
      const deleteSpy = vi
        .spyOn(Transforms, 'delete')
        .mockImplementation(() => {});

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).empty(e, path);

      expect(deleteSpy).toHaveBeenCalled();
      expect(insertNodesSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });

    // 添加更多测试用例以覆盖未覆盖的行
  });

  describe('table 方法', () => {
    it('应该处理 Mod+Shift+Enter 组合键', () => {
      const e = {
        ctrlKey: true,
        shiftKey: true,
        preventDefault: vi.fn(),
      };
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).table(
        [{ type: 'table', children: [] }, [0, 0, 0]] as any,
        sel,
        e,
      );

      expect(insertNodesSpy).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('应该处理普通的 Enter 键', () => {
      const e = {
        ctrlKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      };
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Editor.hasPath
      vi.spyOn(Editor, 'hasPath').mockReturnValue(true);

      // Mock Path.next
      vi.spyOn(Path, 'next').mockReturnValue([0, 0, 1]);

      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({
        path: [0, 0, 1, 0],
        offset: 0,
      });

      // Mock Transforms.select
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      (enterKey as any).table(
        [{ type: 'table', children: [] }, [0, 0, 0]] as any,
        sel,
        e,
      );

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理表格的下一个行不存在的情况', () => {
      const e = {
        ctrlKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      };
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Editor.hasPath - 下一行不存在
      vi.spyOn(Editor, 'hasPath')
        .mockReturnValueOnce(false) // nextRow 不存在
        .mockReturnValueOnce(true); // tableNext 存在

      // Mock Path.next
      vi.spyOn(Path, 'next')
        .mockReturnValueOnce([0, 0, 1]) // nextRow
        .mockReturnValueOnce([0, 1]); // tableNext

      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [0, 1, 0], offset: 0 });

      // Mock Transforms.select
      const selectSpy = vi
        .spyOn(Transforms, 'select')
        .mockImplementation(() => {});

      (enterKey as any).table(
        [{ type: 'table', children: [] }, [0, 0, 0]] as any,
        sel,
        e,
      );

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理表格和下一个元素都不存在的情况', () => {
      const e = {
        ctrlKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
      };
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Editor.hasPath - 下一行和tableNext都不存在
      vi.spyOn(Editor, 'hasPath')
        .mockReturnValueOnce(false) // nextRow 不存在
        .mockReturnValueOnce(false); // tableNext 不存在

      // Mock Path.next
      vi.spyOn(Path, 'next')
        .mockReturnValueOnce([0, 0, 1]) // nextRow
        .mockReturnValueOnce([0, 1]); // tableNext

      // Mock Transforms.insertNodes
      const insertNodesSpy = vi
        .spyOn(Transforms, 'insertNodes')
        .mockImplementation(() => {});

      (enterKey as any).table(
        [{ type: 'table', children: [] }, [0, 0, 0]] as any,
        sel,
        e,
      );

      expect(insertNodesSpy).toHaveBeenCalled();
      // 在这种情况下，preventDefault 不会被调用，因为在表格处理的else分支中没有调用它
    });
  });
});
