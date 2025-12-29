import { createEditor, Editor, Path, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../store';
import { KeyboardTask } from '../keyboard';

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
vi.mock('../editorUtils', () => ({
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

vi.mock('../../store', () => ({
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

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.list('ordered');

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该插入无序列表', () => {
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

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.list('unordered');

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该插入任务列表', () => {
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

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.list('task');

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该处理列表项节点', () => {
      const mockNode = [
        { type: 'list-item', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'parent').mockReturnValue([
        { type: 'list-item', children: [{ text: 'Test' }] },
        [0],
      ] as any);
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.list('ordered');

      expect(insertNodesSpy).toHaveBeenCalled();
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
