import { createEditor, Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../src/MarkdownEditor/editor/store';
import { KeyboardTask } from '../../../src/MarkdownEditor/editor/utils/keyboard';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => vi.fn()), // 返回一个函数来模拟 hideLoading
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
vi.mock('../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
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

vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let keyboardTask: KeyboardTask;
  let mockProps: any;

  beforeEach(() => {
    // Create editor with initial content
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

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('应该插入有序列表', () => {
      // Set up editor selection
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Editor, 'parent').mockReturnValue([
        {
          type: 'paragraph',
          children: [{ text: 'Test' }],
        },
        [0],
      ] as any);

      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      vi.spyOn(Path, 'equals').mockReturnValue(true);
      vi.spyOn(Path, 'parent').mockReturnValue([0]);
      // Node.get should return a node with valid children (text node)
      vi.spyOn(Node, 'get').mockReturnValue({ type: 'paragraph', children: [{ text: 'Test' }] });
      vi.spyOn(Node, 'string').mockReturnValue('Test');
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      vi.spyOn(Element, 'isElement').mockReturnValue(true);

      // Mock wrapNodes to prevent actual execution which requires valid editor structure
      const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes').mockImplementation(() => {});

      keyboardTask.list('ordered');

      expect(wrapNodesSpy).toHaveBeenCalled();
    });

    it('应该插入无序列表', () => {
      // Set up editor selection
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ] as any);
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      vi.spyOn(Path, 'equals').mockReturnValue(true);
      vi.spyOn(Path, 'parent').mockReturnValue([0]);
      // Node.get should return a node with valid children (text node)
      vi.spyOn(Node, 'get').mockReturnValue({ type: 'paragraph', children: [{ text: 'Test' }] });
      vi.spyOn(Node, 'string').mockReturnValue('Test');
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      vi.spyOn(Element, 'isElement').mockReturnValue(true);

      // Mock wrapNodes to prevent actual execution which requires valid editor structure
      const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes').mockImplementation(() => {});

      keyboardTask.list('unordered');

      expect(wrapNodesSpy).toHaveBeenCalled();
    });

    it('应该插入任务列表', () => {
      // Set up editor selection
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ] as any);
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      vi.spyOn(Path, 'equals').mockReturnValue(true);
      vi.spyOn(Path, 'parent').mockReturnValue([0]);
      // Node.get should return a node with valid children (text node)
      vi.spyOn(Node, 'get').mockReturnValue({ type: 'paragraph', children: [{ text: 'Test' }] });
      vi.spyOn(Node, 'string').mockReturnValue('Test');
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      vi.spyOn(Element, 'isElement').mockReturnValue(true);

      // Mock wrapNodes to prevent actual execution which requires valid editor structure
      const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes').mockImplementation(() => {});

      keyboardTask.list('task');

      expect(wrapNodesSpy).toHaveBeenCalled();
    });

    it('应该处理列表项节点', () => {
      // Set up editor selection
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      const mockNode = [
        { type: 'list-item', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'list-item', children: [{ text: 'Test' }] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Path, 'parent').mockReturnValue([1]);
      // Node.get should return a node with valid children
      vi.spyOn(Node, 'get').mockReturnValue({
        type: 'bulleted-list',
        children: [{ type: 'list-item', children: [{ text: 'Test' }] }],
      } as any);
      vi.spyOn(Element, 'isElement').mockReturnValue(true);

      // Mock setNodes to prevent actual execution
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {});

      keyboardTask.list('ordered');

      expect(setNodesSpy).toHaveBeenCalled();
    });

    it('应该处理任务列表项节点', () => {
      const mockNode = [
        { type: 'task-list-item', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'list-item', children: [{ text: 'Test' }] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.list('task');

      expect(insertNodesSpy).not.toHaveBeenCalled();
    });
  });
});
