import { createEditor, Editor, Node, Path, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../store';
import { KeyboardTask } from '../../../../utils/keyboard';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => vi.fn()),
  },
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn(),
  },
  writable: true,
});

// Mock Transforms
vi.mock('slate', async () => {
  const actual = await vi.importActual('slate');
  return {
    ...actual,
    Transforms: {
      wrapNodes: vi.fn(),
      unwrapNodes: vi.fn(),
      insertNodes: vi.fn(),
      setNodes: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
      removeNodes: vi.fn(),
    },
    Editor: {
      ...(actual.Editor as any),
      start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
      end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
      hasPath: vi.fn(() => false),
    },
  };
});

// Mock EditorUtils
vi.mock('../../../../utils/editorUtils', () => ({
  EditorUtils: {
    toggleFormat: vi.fn(),
    clearMarks: vi.fn(),
    wrapperCardNode: vi.fn((node) => node),
    isTop: vi.fn(() => true),
    createMediaNode: vi.fn(() => ({ type: 'media', url: 'test.jpg' })),
    p: { type: 'paragraph', children: [{ text: '' }] },
    findPrev: vi.fn(() => [0]),
    findNext: vi.fn(() => [1]),
  },
}));

vi.mock('../../../../store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask - Insert Methods', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let keyboardTask: KeyboardTask;
  let mockProps: any;

  beforeEach(() => {
    editor = withReact(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ];

    store = {
      editor,
      markdownEditorRef: { current: null },
      setShowComment: vi.fn(),
    } as any;

    mockProps = {
      value: [{ type: 'paragraph', children: [{ text: 'Test content' }] }],
      onChange: vi.fn(),
      image: {
        upload: vi.fn(),
      },
    };

    keyboardTask = new KeyboardTask(store, mockProps);

    vi.clearAllMocks();
  });

  describe('insertQuote', () => {
    it('应该插入引用块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Node.parent to return a non-blockquote parent
      vi.spyOn(Node, 'parent').mockReturnValue({
        type: 'document',
        children: [],
      } as any);

      keyboardTask.insertQuote();

      expect(Transforms.wrapNodes).toHaveBeenCalledWith(editor, {
        type: 'blockquote',
        children: [],
      });
    });

    it('应该移除现有的引用块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0, 0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      vi.spyOn(Node, 'parent').mockReturnValue({
        type: 'blockquote',
        children: [],
      } as any);

      vi.spyOn(Path, 'parent').mockReturnValue([0]);

      keyboardTask.insertQuote();

      expect(Transforms.unwrapNodes).toHaveBeenCalledWith(editor, { at: [0] });
    });

    it('当节点类型不支持时不应该执行任何操作', () => {
      const mockNode = [{ type: 'code', children: [{ text: 'Test' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      keyboardTask.insertQuote();

      expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    });
  });

  describe('insertTable', () => {
    it('应该插入表格', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      keyboardTask.insertTable();

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    it('应该在列单元格中插入表格', () => {
      const mockNode = [
        { type: 'column-cell', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      keyboardTask.insertTable();

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });
  });

  describe('insertCode', () => {
    it('应该插入代码块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      keyboardTask.insertCode();

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    it('应该插入指定类型的代码块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      keyboardTask.insertCode('mermaid');

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    it('应该插入HTML代码块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      keyboardTask.insertCode('html');

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });
  });

  describe('horizontalLine', () => {
    it('应该插入水平线', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      keyboardTask.horizontalLine();

      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    it('应该在水平线后插入段落', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      // Mock Path.next to return a valid path
      vi.spyOn(Path, 'next').mockReturnValue([1]);

      vi.spyOn(Editor, 'hasPath').mockReturnValue(false);

      keyboardTask.horizontalLine();

      expect(Transforms.insertNodes).toHaveBeenCalledTimes(2); // 一次插入水平线，一次插入段落
    });
  });
});
