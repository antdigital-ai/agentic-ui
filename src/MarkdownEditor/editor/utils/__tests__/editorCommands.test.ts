import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createList } from '../editorCommands';
import { getListType, isListType } from '../../plugins/withListsPlugin';

// Mock Slate's Editor, Transforms, and other dependencies
vi.mock('slate', () => {
  const mockFn = () => vi.fn() as Mock;
  return {
    Editor: {
      nodes: mockFn(),
      parent: mockFn(),
      hasPath: mockFn(),
      start: mockFn(),
      withoutNormalizing: mockFn(),
    },
    Element: {
      isElement: mockFn(),
    },
    Node: {
      get: mockFn(),
      string: mockFn(),
    },
    Path: {
      parent: mockFn(),
      previous: mockFn(),
      next: mockFn(),
      hasPrevious: mockFn(),
      hasNext: mockFn(),
    },
    Range: {
      isCollapsed: mockFn(),
      edges: mockFn(),
    },
    Transforms: {
      setNodes: mockFn(),
      wrapNodes: mockFn(),
      unwrapNodes: mockFn(),
      moveNodes: mockFn(),
      unsetNodes: mockFn(),
      select: mockFn(),
      removeNodes: mockFn(),
    },
  };
});

// Mock withListsPlugin
vi.mock('../../plugins/withListsPlugin', () => ({
  isListType: vi.fn(),
  getListType: vi.fn(),
}));

// Note: getCurrentNodes is an internal function, we'll mock Editor.nodes instead

describe('createList', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();

    editor = {
      selection: null,
      children: [],
    } as any;

    // 默认 mock 返回值
    (Editor.hasPath as Mock).mockReturnValue(true);
    (Element.isElement as Mock).mockReturnValue(true);
    (Range.isCollapsed as Mock).mockReturnValue(true);
  });

  describe('基本功能', () => {
    it('should return early if no selection', () => {
      editor.selection = null;

      createList(editor, 'unordered');

      expect(Editor.nodes).not.toHaveBeenCalled();
    });

    it('should convert paragraph to unordered list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'unordered');

      expect(Transforms.wrapNodes).toHaveBeenCalled();
    });

    it('should convert paragraph to ordered list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('numbered-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'ordered');

      expect(Transforms.wrapNodes).toHaveBeenCalled();
    });

    it('should convert paragraph to task list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'task');

      expect(Transforms.wrapNodes).toHaveBeenCalled();
    });
  });

  describe('标题转换', () => {
    it('should convert heading to paragraph before creating list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[headNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'unordered');

      expect(Transforms.setNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: path },
      );
      expect(Transforms.unsetNodes).toHaveBeenCalledWith(editor, 'level', {
        at: path,
      });
    });
  });

  describe('反向转换（Unwrap）', () => {
    it('should unwrap list-item when same type and not task', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const listItemNode = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item' }] }],
      };
      const listItemPath = [0];
      const listPath = [1];
      const listNode = { type: 'bulleted-list', children: [listItemNode] };
      const { getCurrentNodes } = require('../editorCommands');

      (getCurrentNodes as Mock).mockReturnValue([[listItemNode, listItemPath]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (isListType as Mock).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue(listNode);
      (Path.parent as Mock).mockReturnValue(listPath);
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'unordered');

      expect(Transforms.unwrapNodes).toHaveBeenCalled();
    });

    it('should update list type when different type', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const listItemNode = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item' }] }],
      };
      const listItemPath = [0];
      const listPath = [1];
      const listNode = { type: 'bulleted-list', children: [listItemNode] };

      (Editor.nodes as Mock).mockReturnValue([[listItemNode, listItemPath]]);
      (getListType as Mock).mockReturnValue('numbered-list');
      (isListType as Mock).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue(listNode);
      (Path.parent as Mock).mockReturnValue(listPath);
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'ordered');

      expect(Transforms.setNodes).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ type: 'numbered-list' }),
        { at: listPath },
      );
    });

    it('should not unwrap when converting to task list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const listItemNode = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item' }] }],
      };
      const listItemPath = [0];
      const listPath = [1];
      const listNode = { type: 'bulleted-list', children: [listItemNode] };
      const { getCurrentNodes } = require('../editorCommands');

      (getCurrentNodes as Mock).mockReturnValue([[listItemNode, listItemPath]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (isListType as Mock).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue(listNode);
      (Path.parent as Mock).mockReturnValue(listPath);
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'task');

      expect(Transforms.unwrapNodes).not.toHaveBeenCalled();
      expect(Transforms.setNodes).toHaveBeenCalled();
    });
  });

  describe('合并相邻列表', () => {
    it('should merge into adjacent list of same type', () => {
      const selection = {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [1];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.hasPrevious as Mock).mockReturnValue(true);
      (Path.previous as Mock).mockReturnValue([0]);
      (Node.get as Mock).mockReturnValue({
        type: 'bulleted-list',
        children: [],
      });
      (isListType as Mock).mockReturnValue(true);

      createList(editor, 'unordered');

      expect(Transforms.moveNodes).toHaveBeenCalled();
    });
  });

  describe('多节点转换', () => {
    it('should convert multiple paragraphs to single list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [2, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode1 = { type: 'paragraph', children: [{ text: 'Item 1' }] };
      const paragraphNode2 = { type: 'paragraph', children: [{ text: 'Item 2' }] };
      const path1 = [0];
      const path2 = [1];

      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode1, path1]]).mockReturnValue([
        [paragraphNode1, path1],
        [paragraphNode2, path2],
      ]);
      (Range.isCollapsed as Mock).mockReturnValue(false);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Path.hasNext as Mock).mockReturnValue(false);

      createList(editor, 'unordered');

      expect(Transforms.wrapNodes).toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('should handle empty paragraph', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Node.string as Mock).mockReturnValue('');
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'unordered');

      expect(Transforms.wrapNodes).toHaveBeenCalled();
    });

    it('should handle paragraph in list-item (unwrap scenario)', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const paragraphPath = [0, 0];
      const listItemNode = {
        type: 'list-item',
        children: [paragraphNode],
      };
      const listItemPath = [0];
      const listPath = [1];
      const listNode = { type: 'bulleted-list', children: [listItemNode] };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, paragraphPath]]);
      (Editor.parent as Mock)
        .mockReturnValueOnce([listItemNode, listItemPath])
        .mockReturnValueOnce([listNode, listPath]);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (isListType as Mock).mockReturnValue(true);
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'unordered');

      expect(Transforms.unwrapNodes).toHaveBeenCalled();
    });

    it('should filter out nodes already in list', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [0];
      const listItemNode = { type: 'list-item', children: [paragraphNode] };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([listItemNode, [0]]);
      (getListType as Mock).mockReturnValue('bulleted-list');

      createList(editor, 'unordered');

      // 应该被过滤掉，不会调用 wrapNodes
      expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    });

    it('should handle root path safely', () => {
      const selection = {
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Path.parent as Mock).mockReturnValue([]); // 根路径
      (Editor.hasPath as Mock).mockReturnValue(false);

      // 不应该抛出错误
      expect(() => createList(editor, 'unordered')).not.toThrow();
    });
  });

  describe('任务列表特殊处理', () => {
    it('should set checked property for task list items', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Task' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());

      createList(editor, 'task');

      expect(Transforms.wrapNodes).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          type: 'list-item',
          checked: false,
        }),
        expect.any(Object),
      );
    });

    it('should set task property on list for task mode', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Task' }] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Path.hasNext as Mock).mockReturnValue(false);

      createList(editor, 'task');

      expect(Transforms.wrapNodes).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          type: 'bulleted-list',
          task: true,
        }),
        expect.any(Object),
      );
    });
  });
});
