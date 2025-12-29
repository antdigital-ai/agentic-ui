import { createEditor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../store';
import { EditorUtils } from '../../../../utils/editorUtils';
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

describe('KeyboardTask - Format and History Methods', () => {
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

  describe('format', () => {
    it('应该应用指定格式', () => {
      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.format('bold');

      expect(toggleFormatSpy).toHaveBeenCalledWith(editor, 'bold');
    });
  });

  describe('clear', () => {
    it('应该清除格式', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const clearMarksSpy = vi.spyOn(EditorUtils, 'clearMarks');

      keyboardTask.clear();

      expect(clearMarksSpy).toHaveBeenCalledWith(editor, true);
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const clearMarksSpy = vi.spyOn(EditorUtils, 'clearMarks');

      keyboardTask.clear();

      expect(clearMarksSpy).not.toHaveBeenCalled();
    });
  });

  describe('undo', () => {
    it('应该执行撤销操作', () => {
      //@ts-ignore
      editor.undo = vi.fn() as any;

      const undoSpy = vi.spyOn(editor, 'undo' as any);

      keyboardTask.undo();

      expect(undoSpy).toHaveBeenCalled();
    });

    it('应该处理撤销操作异常', () => {
      //@ts-ignore
      editor.undo = vi.fn(() => {
        throw new Error('Undo failed');
      });

      expect(() => keyboardTask.undo()).not.toThrow();
    });
  });

  describe('redo', () => {
    it('应该执行重做操作', () => {
      //@ts-ignore
      editor.redo = vi.fn();

      const redoSpy = vi.spyOn(editor, 'redo' as any);

      keyboardTask.redo();

      expect(redoSpy).toHaveBeenCalled();
    });

    it('应该处理重做操作异常', () => {
      //@ts-ignore
      editor.redo = vi.fn(() => {
        throw new Error('Redo failed');
      });

      expect(() => keyboardTask.redo()).not.toThrow();
    });
  });
});
