import { createEditor, Editor, Path, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../../src/MarkdownEditor/editor/store';
import { EditorUtils } from '../../../../../src/MarkdownEditor/editor/utils/editorUtils';
import { KeyboardTask } from '../../../../../src/MarkdownEditor/editor/utils/keyboard';

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
vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
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

vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask - Selection Methods', () => {
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

  describe('selectAll', () => {
    it('应该选择编辑器中的所有内容', () => {
      const selectSpy = vi.spyOn(Transforms, 'select');
      const startSpy = vi.spyOn(Editor, 'start');
      const endSpy = vi.spyOn(Editor, 'end');

      keyboardTask.selectAll();

      expect(startSpy).toHaveBeenCalledWith(editor, []);
      expect(endSpy).toHaveBeenCalledWith(editor, []);
      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: expect.any(Object),
        focus: expect.any(Object),
      });
    });
  });

  describe('selectLine', () => {
    it('应该选择当前行的文本', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const selectSpy = vi.spyOn(Transforms, 'select');
      const parentSpy = vi.spyOn(Path, 'parent');

      keyboardTask.selectLine();

      expect(parentSpy).toHaveBeenCalledWith(mockSelection.anchor.path);
      expect(selectSpy).toHaveBeenCalledWith(editor, expect.any(Array));
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectLine();

      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectFormatToCode', () => {
    it('应该将选中文本转换为行内代码', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.selectFormatToCode();

      expect(toggleFormatSpy).toHaveBeenCalledWith(editor, 'code');
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.selectFormatToCode();

      expect(toggleFormatSpy).not.toHaveBeenCalled();
    });
  });

  describe('curNodes getter', () => {
    it('应返回元素节点迭代器并执行 match 回调', () => {
      const nodes = [...keyboardTask.curNodes];
      expect(nodes).toBeDefined();
      expect(Array.isArray(nodes)).toBe(true);
    });
  });

  describe('selectWord', () => {
    it('应该选择英文单词', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    });

    it('应该选择中文字符', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '你好世界' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    it('应覆盖 selectWord 中文 pre 结尾分支（中中 offset 1）', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '中中' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');
      keyboardTask.selectWord();
      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      });
    });

    it('应覆盖 selectWord 仅 pre 有匹配时的分支（a 后空格 offset 1）', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'a ' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');
      keyboardTask.selectWord();
      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    it('应该处理混合文本', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello你好' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('当选区不是折叠状态时不应该执行任何操作', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('应该处理单个字符的情况', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'a' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    it('应该处理边界情况 - 光标在文本开头', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理边界情况 - 光标在文本结尾', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理空格分隔的单词', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world test' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });
  });
});
