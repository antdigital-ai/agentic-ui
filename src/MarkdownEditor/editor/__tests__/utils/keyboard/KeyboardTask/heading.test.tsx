import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../@ant-design/agentic-ui/MarkdownEditor/editor/store';
import { EditorUtils } from '../../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/editorUtils';
import { KeyboardTask } from '../../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/keyboard';

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

// Mock EditorUtils
vi.mock('../../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/editorUtils', () => ({
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

vi.mock('../../../../@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask - Heading Methods', () => {
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

  describe('head', () => {
    it('应该设置标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.head(3);

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 3 },
        { at: [0] },
      );
    });

    it('当级别为4时应该转换为普通段落', () => {
      const paragraphSpy = vi.spyOn(keyboardTask, 'paragraph');

      keyboardTask.head(4);

      expect(paragraphSpy).toHaveBeenCalled();
    });

    it('当节点类型不支持时不应该执行任何操作', () => {
      const mockNode = [{ type: 'code', children: [{ text: 'Test' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.head(1);

      expect(setNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('paragraph', () => {
    it('应该转换为普通段落', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.paragraph();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('当节点类型不是标题时不应该执行任何操作', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.paragraph();

      expect(setNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('increaseHead', () => {
    it('应该增加标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 4 },
        { at: [0] },
      );
    });

    it('应该将1级标题转换为普通段落', () => {
      const mockNode = [
        { type: 'head', level: 1, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('应该将其他级别标题升级一级', () => {
      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { level: 1 },
        { at: [0] },
      );
    });
  });

  describe('decreaseHead', () => {
    it('应该减少标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 1 },
        { at: [0] },
      );
    });

    it('应该将4级标题转换为普通段落', () => {
      const mockNode = [
        { type: 'head', level: 4, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('应该将其他级别标题降级一级', () => {
      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { level: 3 },
        { at: [0] },
      );
    });
  });
});
