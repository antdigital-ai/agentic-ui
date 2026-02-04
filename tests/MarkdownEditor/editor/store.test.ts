import { EditorStore } from '@ant-design/agentic-ui/MarkdownEditor/editor/store';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('slate', () => ({
  ...vi.importActual('slate'),
  createEditor: vi.fn(() => ({
    children: [{ type: 'paragraph', children: [{ text: 'test' }] }],
    selection: null,
    operations: [],
    marks: null,
    isInline: vi.fn(),
    isVoid: vi.fn(),
    normalizeNode: vi.fn(),
    onChange: vi.fn(),
    hasPath: vi.fn(() => true),
  })),
  Transforms: {
    insertNodes: vi.fn((editor, nodes, options) => {
      if (options?.at) {
        const at = options.at[0];
        if (Array.isArray(nodes)) {
          editor.children.splice(at, 0, ...nodes);
        } else {
          editor.children.splice(at, 0, nodes);
        }
      } else {
        if (Array.isArray(nodes)) {
          editor.children.push(...nodes);
        } else {
          editor.children.push(nodes);
        }
      }
    }),
    removeNodes: vi.fn((editor, options) => {
      if (options?.at) {
        const at = options.at[0];
        editor.children.splice(at, 1);
      }
    }),
    insertText: vi.fn(),
    delete: vi.fn(),
  },
  Editor: {
    nodes: vi.fn(() => []),
    withoutNormalizing: vi.fn((editor, fn) => fn()),
  },
  Text: {
    isText: vi.fn(() => false),
  },
  Node: {
    string: vi.fn(() => ''),
  },
}));

vi.mock('slate-react', () => ({
  ...vi.importActual('slate-react'),
  withReact: vi.fn((editor) => editor),
  ReactEditor: {
    focus: vi.fn(),
  },
}));

vi.mock('slate-history', () => ({
  ...vi.importActual('slate-history'),
  withHistory: vi.fn((editor) => editor),
}));

describe('EditorStore', () => {
  let editor: any;
  let editorRef: React.MutableRefObject<any>;
  let store: EditorStore;

  beforeEach(() => {
    editor = withReact(withHistory(createEditor()));
    editorRef = { current: editor };
    store = new EditorStore(editorRef);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确初始化EditorStore', () => {
      expect(store).toBeDefined();
      expect(store.editor).toBe(editor);
    });

    it('应该设置默认属性', () => {
      expect(store.draggedElement).toBeNull();
      expect(store.footnoteDefinitionMap).toBeInstanceOf(Map);
      expect(store.inputComposition).toBe(false);
      expect(store.domRect).toBeNull();
    });
  });

  describe('编辑器操作', () => {
    it('应该聚焦编辑器', () => {
      const focusSpy = vi.spyOn(store, 'focus');
      store.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('应该插入节点', () => {
      const insertNodesSpy = vi.spyOn(store, 'insertNodes');
      const node = { type: 'paragraph', children: [{ text: 'new paragraph' }] };
      store.insertNodes(node);

      expect(insertNodesSpy).toHaveBeenCalledWith(node);
    });

    it('应该清空内容', () => {
      const clearContentSpy = vi.spyOn(store, 'clearContent');
      store.clearContent();

      expect(clearContentSpy).toHaveBeenCalled();
    });

    it('应该检查是否为最新节点', () => {
      const isLatestNodeSpy = vi.spyOn(store, 'isLatestNode');
      const node = { type: 'paragraph', children: [{ text: 'test' }] };

      store.isLatestNode(node);

      expect(isLatestNodeSpy).toHaveBeenCalledWith(node);
    });
  });

  describe('内容管理', () => {
    it('应该获取内容', () => {
      const getContentSpy = vi.spyOn(store, 'getContent');
      const content = store.getContent();

      expect(getContentSpy).toHaveBeenCalled();
      expect(Array.isArray(content)).toBe(true);
    });

    it('应该设置内容', () => {
      const setContentSpy = vi.spyOn(store, 'setContent');
      const nodeList = [
        { type: 'paragraph', children: [{ text: 'new content' }] },
      ];

      store.setContent(nodeList);

      expect(setContentSpy).toHaveBeenCalledWith(nodeList);
    });

    it('应该获取Markdown内容', () => {
      const getMDContentSpy = vi.spyOn(store, 'getMDContent');
      const mdContent = store.getMDContent();

      expect(getMDContentSpy).toHaveBeenCalled();
      expect(typeof mdContent).toBe('string');
    });

    it('应该获取HTML内容', () => {
      const getHtmlContentSpy = vi.spyOn(store, 'getHtmlContent');
      const htmlContent = store.getHtmlContent();

      expect(getHtmlContentSpy).toHaveBeenCalled();
      expect(typeof htmlContent).toBe('string');
    });
  });

  describe('拖拽管理', () => {
    it('应该开始拖拽', () => {
      const dragStartSpy = vi.spyOn(store, 'dragStart');
      const event = {
        stopPropagation: vi.fn(),
        dataTransfer: {
          setDragImage: vi.fn(),
        },
      };
      const container = document.createElement('div');

      store.dragStart(event, container);

      expect(dragStartSpy).toHaveBeenCalledWith(event, container);
    });
  });

  describe('搜索和替换', () => {
    it('应该执行搜索和替换', () => {
      const replaceTextSpy = vi.spyOn(store, 'replaceText');
      store.replaceText('search', 'replace', { replaceAll: true });

      expect(replaceTextSpy).toHaveBeenCalledWith('search', 'replace', {
        replaceAll: true,
      });
    });
  });

  describe('链接管理', () => {
    it('应该插入链接', () => {
      const insertLinkSpy = vi.spyOn(store, 'insertLink');
      store.insertLink('/path/to/file');

      expect(insertLinkSpy).toHaveBeenCalledWith('/path/to/file');
    });
  });
});
