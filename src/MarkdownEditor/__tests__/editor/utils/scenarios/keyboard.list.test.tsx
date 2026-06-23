import { createEditor } from 'slate';
import { ReactEditor, withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withAgenticLists } from '../../../../editor/plugins/lists';
import { EditorStore } from '../../../../editor/store';
import { KeyboardTask } from '../../../../editor/utils/keyboard';

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
vi.mock('../../../../editor/utils/editorUtils', () => ({
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

vi.mock('../../../../editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask', () => {
  let editor: ReactEditor;
  let store: EditorStore;
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


    // Reset mocks
    vi.clearAllMocks();
  });

  describe('list', () => {
    const createListsEditor = (children?: any) => {
      const e = withAgenticLists(withReact(createEditor())) as any;
      e.children = children ?? [
        { type: 'paragraph', children: [{ text: 'Test' }] },
      ];
      e.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      return e;
    };

    it('应该插入有序列表', () => {
      const e = createListsEditor();
      new KeyboardTask({ ...store, editor: e } as any, mockProps).list(
        'ordered',
      );
      expect((e.children[0] as any).type).toBe('numbered-list');
    });

    it('应该插入无序列表', () => {
      const e = createListsEditor();
      new KeyboardTask({ ...store, editor: e } as any, mockProps).list(
        'unordered',
      );
      expect((e.children[0] as any).type).toBe('bulleted-list');
    });

    it('应该插入任务列表', () => {
      const e = createListsEditor();
      new KeyboardTask({ ...store, editor: e } as any, mockProps).list('task');
      const list = e.children[0] as any;
      expect(list.type).toBe('bulleted-list');
      expect(list.children[0].type).toBe('list-item');
    });

    it('应该将已有列表切换为另一类型', () => {
      const e = createListsEditor([
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'Test' }] }],
            },
          ],
        },
      ]);
      e.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      new KeyboardTask({ ...store, editor: e } as any, mockProps).list(
        'ordered',
      );
      expect((e.children[0] as any).type).toBe('numbered-list');
    });
  });
});
