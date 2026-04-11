import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { getListType, isListType } from '../../plugins/withListsPlugin';
import { EditorUtils } from '../editorUtils';
import {
  createList,
  insertTable,
  insertCodeBlock,
  toggleQuote,
  insertHorizontalLine,
  setHeading,
  increaseHeadingLevel,
  decreaseHeadingLevel,
  convertToParagraph,
  getCurrentNodes,
} from '../editorCommands';

// Mock Slate's Editor, Transforms, and other dependencies
vi.mock('slate', () => {
  const mockFn = () => vi.fn() as Mock;
  return {
    Editor: {
      nodes: mockFn(),
      parent: mockFn(),
      hasPath: mockFn(),
      start: mockFn(),
      end: mockFn(),
      withoutNormalizing: mockFn(),
      isInline: mockFn(),
      isEditor: mockFn(),
      node: mockFn(),
      string: mockFn(),
      leaf: mockFn(),
      next: mockFn(),
    },
    Element: {
      isElement: mockFn(),
    },
    Node: {
      get: mockFn(),
      string: mockFn(),
      parent: mockFn(),
      first: mockFn(),
      fragment: mockFn(),
    },
    Path: {
      parent: mockFn(),
      previous: mockFn(),
      next: mockFn(),
      hasPrevious: mockFn(),
      hasNext: mockFn(),
      compare: mockFn(),
      equals: mockFn(),
    },
    Point: {
      isBefore: mockFn(),
      isAfter: mockFn(),
      equals: mockFn(),
      compare: mockFn(),
    },
    Range: {
      isCollapsed: mockFn(),
      edges: mockFn(),
      start: mockFn(),
    },
    Text: {
      isText: mockFn(),
    },
    Transforms: {
      setNodes: mockFn(),
      wrapNodes: mockFn(),
      unwrapNodes: mockFn(),
      moveNodes: mockFn(),
      unsetNodes: mockFn(),
      select: mockFn(),
      removeNodes: mockFn(),
      insertNodes: mockFn(),
      delete: mockFn(),
      splitNodes: mockFn(),
      insertText: mockFn(),
    },
  };
});

// Mock NativeTableEditor
vi.mock('../../utils/native-table', () => ({
  NativeTableEditor: {
    insertTable: vi.fn(),
  },
}));

// Mock EditorUtils
vi.mock('../editorUtils', () => ({
  EditorUtils: {
    isTop: vi.fn(),
  },
}));

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
    (Element.isElement as unknown as Mock).mockReturnValue(true);
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

      // Mock Editor.nodes for getCurrentNodes (called first)
      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.parent as Mock).mockReturnValue([
        { type: 'paragraph', children: [] },
        [0],
      ]);
      (Node.get as Mock).mockReturnValue(paragraphNode);
      (Node.string as Mock).mockReturnValue('Test');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.hasPath as Mock).mockReturnValue(true);

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

      // Mock Editor.nodes for getCurrentNodes (called first)
      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('numbered-list');
      (Editor.parent as Mock).mockReturnValue([
        { type: 'paragraph', children: [] },
        [0],
      ]);
      (Node.get as Mock).mockReturnValue(paragraphNode);
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

      // Mock Editor.nodes for getCurrentNodes (called first)
      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.parent as Mock).mockReturnValue([
        { type: 'paragraph', children: [] },
        [0],
      ]);
      (Node.get as Mock).mockReturnValue(paragraphNode);
      (Node.string as Mock).mockReturnValue('Test');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.hasPath as Mock).mockReturnValue(true);

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

      const headNode = {
        type: 'head',
        level: 1,
        children: [{ text: 'Title' }],
      };
      const paragraphNode = {
        type: 'paragraph',
        children: [{ text: 'Title' }],
      };
      const path = [0];

      // Mock Editor.nodes for getCurrentNodes (called first)
      (Editor.nodes as Mock).mockReturnValueOnce([[headNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.parent as Mock).mockReturnValue([
        { type: 'head', children: [] },
        [0],
      ]);
      // After convertHeadingToParagraph, Node.get should return paragraph
      (Node.get as Mock).mockReturnValue(paragraphNode);
      (Node.string as Mock).mockReturnValue('Title');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.hasPath as Mock).mockReturnValue(true);

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

      // Mock Editor.nodes for getCurrentNodes
      (Editor.nodes as Mock).mockReturnValueOnce([
        [listItemNode, listItemPath],
      ]);
      // Mock Editor.parent to return list node
      (Editor.parent as Mock).mockReturnValue([listNode, listPath]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (isListType as unknown as Mock).mockReturnValue(true);
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
      (isListType as unknown as Mock).mockReturnValue(true);
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

      // Mock Editor.nodes for getCurrentNodes
      (Editor.nodes as Mock).mockReturnValueOnce([
        [listItemNode, listItemPath],
      ]);
      // Mock Editor.parent to return list node
      (Editor.parent as Mock).mockReturnValue([listNode, listPath]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (isListType as unknown as Mock).mockReturnValue(true);
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
      const parentPath = [0];
      const adjacentListPath = [0];
      const adjacentListNode = {
        type: 'bulleted-list',
        children: [{ type: 'list-item', children: [] }],
      };

      const listItemNode = {
        type: 'list-item',
        children: [paragraphNode],
      };

      // Mock Editor.nodes for getCurrentNodes
      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      // Mock Editor.parent - first for checking if in list-item, then for getting parent of list-item
      (Editor.parent as Mock)
        .mockReturnValueOnce([{ type: 'root' }, []]) // First call - not in list-item
        .mockReturnValueOnce([{ type: 'root' }, []]) // After wrapping, get parent of list-item
        .mockReturnValueOnce([adjacentListNode, adjacentListPath]); // For adjacent list check
      (Path.parent as Mock).mockReturnValue(parentPath);
      (Path.hasPrevious as Mock).mockReturnValue(true);
      (Path.previous as Mock).mockReturnValue(adjacentListPath);
      // Mock Node.get - first for currentNode, then for adjacent list, then for list-item after wrapping
      (Node.get as Mock)
        .mockReturnValueOnce(paragraphNode) // First call in loop
        .mockReturnValueOnce(adjacentListNode) // For adjacent list check
        .mockReturnValueOnce(listItemNode); // After wrapping
      (Node.string as Mock).mockReturnValue('Test');
      (isListType as unknown as Mock).mockReturnValue(true);
      // Mock Editor.hasPath for various checks
      (Editor.hasPath as Mock).mockReturnValue(true);

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

      const paragraphNode1 = {
        type: 'paragraph',
        children: [{ text: 'Item 1' }],
      };
      const paragraphNode2 = {
        type: 'paragraph',
        children: [{ text: 'Item 2' }],
      };
      const path1 = [0];
      const path2 = [1];

      (Editor.nodes as Mock)
        .mockReturnValueOnce([[paragraphNode1, path1]])
        .mockReturnValue([
          [paragraphNode1, path1],
          [paragraphNode2, path2],
        ]);
      (Range.isCollapsed as Mock).mockReturnValue(false);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.hasPrevious as Mock).mockReturnValue(false);

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
      (isListType as unknown as Mock).mockReturnValue(true);
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
    it('should set task property on list for task mode', () => {
      const selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      editor.selection = selection;

      const paragraphNode = { type: 'paragraph', children: [{ text: 'Task' }] };
      const path = [0];
      const listItemNode = {
        type: 'list-item',
        checked: false,
        children: [paragraphNode],
      };

      // Mock Editor.nodes for getCurrentNodes
      (Editor.nodes as Mock).mockReturnValueOnce([[paragraphNode, path]]);
      // Mock Editor.nodes for findBlockNodesInSelection (returns empty, so uses curNode)
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Editor.hasPath as Mock).mockReturnValue(true);
      // After wrapNodes for list-item, Node.get should return list-item
      (Node.get as Mock)
        .mockReturnValueOnce(paragraphNode) // First call in the loop
        .mockReturnValueOnce(listItemNode); // After wrapping
      (Node.string as Mock).mockReturnValue('Task');

      createList(editor, 'task');

      // Check that wrapNodes was called with list containing task: true
      const wrapNodesCalls = (Transforms.wrapNodes as Mock).mock.calls;
      const listWrapCall = wrapNodesCalls.find(
        (call) => call[1]?.type === 'bulleted-list',
      );
      expect(listWrapCall).toBeDefined();
      if (listWrapCall) {
        expect(listWrapCall[1]).toMatchObject({
          type: 'bulleted-list',
          task: true,
        });
      }
    });
  });

  describe('createList 防御分支覆盖补充', () => {
    it('有 selection 但 getCurrentNodes 为空时直接返回', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      (Editor.nodes as Mock).mockReturnValueOnce([]);
      createList(editor, 'unordered');
      expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    });

    it('blockNodes 过滤后为空时提前返回', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      const p = { type: 'paragraph', children: [{ text: 'x' }] };
      (Editor.nodes as Mock)
        .mockReturnValueOnce([[p, [0]]]) // getCurrentNodes
        .mockReturnValueOnce([[p, [0]]]); // findBlockNodesInSelection
      (Editor.parent as Mock).mockReturnValue([{ type: 'list-item' }, [0]]);
      (getListType as Mock).mockReturnValue('bulleted-list');

      createList(editor, 'unordered');
      expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    });

    it('wrap list-item 时路径无效会 continue（850）', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      const p = { type: 'paragraph', children: [{ text: 'x' }] };
      (Editor.nodes as Mock)
        .mockReturnValueOnce([[p, [0]]])
        .mockReturnValueOnce([[p, [0]]]);
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Node.get as Mock).mockReturnValue(p);
      (Node.string as Mock).mockReturnValue('x');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.hasPath as Mock).mockReturnValue(false);

      createList(editor, 'unordered');
      expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    });

    it('首个 listItem path 无效时在 888 返回', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      const p = { type: 'paragraph', children: [{ text: 'x' }] };
      const listItem = { type: 'list-item', children: [p] };
      (Editor.nodes as Mock)
        .mockReturnValueOnce([[p, [0]]])
        .mockReturnValueOnce([[p, [0]]]);
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Node.get as Mock).mockReturnValue(listItem);
      (Node.string as Mock).mockReturnValue('x');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.hasPath as Mock).mockImplementation(
        (_, path) => JSON.stringify(path) !== '[0]',
      );

      createList(editor, 'unordered');
      expect(Transforms.select).not.toHaveBeenCalled();
    });

    it('firstPath 为根路径时在 897 返回', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      } as any;
      const p = { type: 'paragraph', children: [{ text: 'x' }] };
      const listItem = { type: 'list-item', children: [p] };
      (Editor.nodes as Mock)
        .mockReturnValueOnce([[p, []]])
        .mockReturnValueOnce([[p, []]]);
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (Node.get as Mock).mockReturnValue(listItem);
      (Node.string as Mock).mockReturnValue('x');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.hasPath as Mock).mockReturnValue(true);

      createList(editor, 'unordered');
      expect(Transforms.wrapNodes).not.toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ type: 'bulleted-list' }),
        expect.anything(),
      );
    });

    it('mergeIntoAdjacentList 目标不是列表时直接返回（572）', () => {
      editor.selection = {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      } as any;
      const p = { type: 'paragraph', children: [{ text: 'x' }] };
      const listItem = { type: 'list-item', children: [p] };
      const rootNode = { type: 'root', children: [{}, {}, {}] };
      const listNode = { type: 'bulleted-list', children: [listItem] };

      (Editor.nodes as Mock)
        .mockReturnValueOnce([[p, [1]]])
        .mockReturnValueOnce([[p, [1]]]);
      (Editor.parent as Mock).mockReturnValue([{ type: 'root' }, []]);
      (getListType as Mock).mockReturnValue('bulleted-list');
      (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Path.parent as Mock).mockReturnValue([]);
      (Path.next as Mock).mockReturnValue([2]);
      (Node.string as Mock).mockReturnValue('x');
      (Node.get as Mock)
        .mockReturnValueOnce(p)
        .mockReturnValueOnce(listItem)
        .mockReturnValueOnce(rootNode)
        .mockReturnValueOnce(listNode)
        .mockReturnValueOnce({ type: 'paragraph', children: [] });
      (Editor.hasPath as Mock).mockReturnValue(true);
      (isListType as unknown as Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      createList(editor, 'unordered');
      expect(Transforms.moveNodes).not.toHaveBeenCalled();
    });
  });
});

describe('getCurrentNodes', () => {
  it('should call Editor.nodes with correct params', () => {
    const editor = { selection: null, children: [] } as any;
    (Editor.nodes as Mock).mockReturnValue([]);
    (Element.isElement as unknown as Mock).mockReturnValue(true);
    Array.from(getCurrentNodes(editor));
    expect(Editor.nodes).toHaveBeenCalledWith(editor, {
      mode: 'lowest',
      match: expect.any(Function),
    });
  });
});

describe('insertTable', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
    (Editor.hasPath as Mock).mockReturnValue(true);
    (Editor.start as Mock).mockReturnValue({ path: [0, 0], offset: 0 });
  });

  it('should insert table at paragraph with empty text (calls Transforms.delete + select)', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    (Node.string as Mock).mockReturnValue('');
    (Path.next as Mock).mockReturnValue([1]);

    insertTable(editor, [paragraphNode, path]);

    expect(Transforms.delete).toHaveBeenCalled();
    expect(Transforms.select).toHaveBeenCalled();
  });

  it('should insert table at next path when paragraph has text (calls select)', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'hello' }] };
    const path = [0];
    const nextPath = [1];
    (Node.string as Mock).mockReturnValue('hello');
    (Path.next as Mock).mockReturnValue(nextPath);

    insertTable(editor, [paragraphNode, path]);

    expect(Transforms.select).toHaveBeenCalled();
  });

  it('should handle head node for table insertion', () => {
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    const path = [0];
    (Path.next as Mock).mockReturnValue([1]);

    expect(() => insertTable(editor, [headNode, path])).not.toThrow();
    expect(Transforms.select).toHaveBeenCalled();
  });

  it('should handle column-cell node for table insertion', () => {
    const columnCellNode = { type: 'column-cell', children: [] };
    const path = [0, 1];

    expect(() => insertTable(editor, [columnCellNode, path])).not.toThrow();
  });

  it('should not call Transforms for unsupported node type', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    insertTable(editor, [codeNode, [0]]);
    expect(Transforms.select).not.toHaveBeenCalled();
    expect(Transforms.delete).not.toHaveBeenCalled();
  });

  it('should get node from editor when no node provided', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (Node.string as Mock).mockReturnValue('');
    (Path.next as Mock).mockReturnValue([1]);

    expect(() => insertTable(editor)).not.toThrow();
  });
});

describe('insertCodeBlock', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
    (Editor.end as Mock).mockReturnValue({ path: [0, 0], offset: 0 });
  });

  it('should insert code block at empty paragraph', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    (Node.string as Mock).mockReturnValue('');

    insertCodeBlock(editor, undefined, [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        type: 'code',
        language: undefined,
        render: undefined,
      }),
      { at: path },
    );
    expect(Transforms.select).toHaveBeenCalled();
  });

  it('should insert mermaid code block', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    (Node.string as Mock).mockReturnValue('');

    insertCodeBlock(editor, 'mermaid', [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        type: 'code',
        language: 'mermaid',
      }),
      { at: path },
    );
  });

  it('should insert html code block with render flag', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    (Node.string as Mock).mockReturnValue('');

    insertCodeBlock(editor, 'html', [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        type: 'code',
        render: true,
      }),
      { at: path },
    );
  });

  it('should insert at next path when paragraph has text', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'hello' }] };
    const path = [0];
    const nextPath = [1];
    (Node.string as Mock).mockReturnValue('hello');
    (Path.next as Mock).mockReturnValue(nextPath);

    insertCodeBlock(editor, undefined, [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'code' }),
      { at: nextPath },
    );
  });

  it('should insert at next path for head node', () => {
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    const path = [0];
    const nextPath = [1];
    (Path.next as Mock).mockReturnValue(nextPath);

    insertCodeBlock(editor, undefined, [headNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'code' }),
      { at: nextPath },
    );
  });

  it('should do nothing for unsupported node type', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    insertCodeBlock(editor, undefined, [codeNode, [0]]);
    expect(Transforms.insertNodes).not.toHaveBeenCalled();
  });

  it('should get node from editor when no node provided', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (Node.string as Mock).mockReturnValue('');

    insertCodeBlock(editor);

    expect(Transforms.insertNodes).toHaveBeenCalled();
  });
});

describe('toggleQuote', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
  });

  it('should return early for non-paragraph/head nodes', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    toggleQuote(editor, [codeNode, [0]]);
    expect(Transforms.wrapNodes).not.toHaveBeenCalled();
    expect(Transforms.unwrapNodes).not.toHaveBeenCalled();
  });

  it('should return early when no node provided and getCurrentNodes returns empty', () => {
    (Editor.nodes as Mock).mockReturnValue([]);
    toggleQuote(editor);
    expect(Transforms.wrapNodes).not.toHaveBeenCalled();
  });

  it('should unwrap when already in blockquote', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'quoted' }] };
    const path = [0, 0];
    const parentPath = [0];
    (Node.parent as Mock).mockReturnValue({ type: 'blockquote' });
    (Path.parent as Mock).mockReturnValue(parentPath);

    toggleQuote(editor, [paragraphNode, path]);

    expect(Transforms.unwrapNodes).toHaveBeenCalledWith(editor, { at: parentPath });
  });

  it('should convert head to paragraph before wrapping in quote', () => {
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    const path = [0];
    (Node.parent as Mock).mockReturnValue({ type: 'root' });

    toggleQuote(editor, [headNode, path]);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph' },
      { at: path },
    );
    expect(Transforms.wrapNodes).toHaveBeenCalledWith(editor, {
      type: 'blockquote',
      children: [],
    });
  });

  it('should wrap paragraph in blockquote', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    const path = [0];
    (Node.parent as Mock).mockReturnValue({ type: 'root' });

    toggleQuote(editor, [paragraphNode, path]);

    expect(Transforms.wrapNodes).toHaveBeenCalledWith(editor, {
      type: 'blockquote',
      children: [],
    });
  });

  it('should get node from editor when no node provided', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (Node.parent as Mock).mockReturnValue({ type: 'root' });

    toggleQuote(editor);

    expect(Transforms.wrapNodes).toHaveBeenCalled();
  });
});

describe('insertHorizontalLine', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
    (Editor.start as Mock).mockReturnValue({ path: [0, 0], offset: 0 });
  });

  it('should insert hr at empty paragraph', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    const nextPath = [1];
    (Node.string as Mock).mockReturnValue('');
    (Editor.hasPath as Mock).mockReturnValue(true);
    (Path.next as Mock).mockReturnValue(nextPath);

    insertHorizontalLine(editor, [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'hr' }),
      { at: path },
    );
    expect(Transforms.select).toHaveBeenCalled();
  });

  it('should insert hr at next path for non-empty paragraph', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'hello' }] };
    const path = [0];
    const nextPath = [1];
    const nextNextPath = [2];
    (Node.string as Mock).mockReturnValue('hello');
    (Path.next as Mock)
      .mockReturnValueOnce(nextPath)
      .mockReturnValueOnce(nextNextPath);
    (Editor.hasPath as Mock).mockReturnValue(true);

    insertHorizontalLine(editor, [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'hr' }),
      { at: nextPath },
    );
  });

  it('should insert empty paragraph when no next path after hr', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    const path = [0];
    const nextPath = [1];
    (Node.string as Mock).mockReturnValue('');
    (Editor.hasPath as Mock).mockReturnValue(false);
    (Path.next as Mock).mockReturnValue(nextPath);

    insertHorizontalLine(editor, [paragraphNode, path]);

    expect(Transforms.insertNodes).toHaveBeenCalledTimes(2);
  });

  it('should do nothing for unsupported node type', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    insertHorizontalLine(editor, [codeNode, [0]]);
    expect(Transforms.insertNodes).not.toHaveBeenCalled();
  });

  it('should get node from editor when no node provided', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (Node.string as Mock).mockReturnValue('');
    (Editor.hasPath as Mock).mockReturnValue(true);
    (Path.next as Mock).mockReturnValue([1]);

    insertHorizontalLine(editor);

    expect(Transforms.insertNodes).toHaveBeenCalled();
  });
});

describe('setHeading', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
  });

  it('should convert to paragraph when level is 4', () => {
    const headNode = { type: 'head', level: 3, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    setHeading(editor, 4);

    expect(Editor.nodes).toHaveBeenCalled();
  });

  it('should set heading level on top-level node with collapsed selection', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as any;
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(true);
    (Range.isCollapsed as Mock).mockReturnValue(true);

    setHeading(editor, 2);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'head', level: 2 },
      { at: [0] },
    );
  });

  it('should not set heading when node is not at top level', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    } as any;
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0, 0]]]);
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(false);
    (Range.isCollapsed as Mock).mockReturnValue(true);

    setHeading(editor, 2);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('should handle non-collapsed selection for heading', () => {
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    editor.selection = selection as any;
    (Range.isCollapsed as Mock).mockReturnValue(false);
    (Range.edges as Mock).mockReturnValue([selection.anchor, selection.focus]);
    (Editor.nodes as Mock).mockReturnValue([]);

    setHeading(editor, 2);

    expect(Range.edges).toHaveBeenCalled();
  });

  it('should not set heading when no selection', () => {
    editor.selection = null;
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (Range.isCollapsed as Mock).mockReturnValue(true);

    setHeading(editor, 2);
  });
});

describe('convertToParagraph', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
  });

  it('should convert head node to paragraph', () => {
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    convertToParagraph(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph' },
      { at: [0] },
    );
  });

  it('should not convert non-head node', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);

    convertToParagraph(editor);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });
});

describe('increaseHeadingLevel', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(true);
  });

  it('should convert paragraph to level 4 heading', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);

    increaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'head', level: 4 },
      { at: [0] },
    );
  });

  it('should convert level 1 heading to paragraph', () => {
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    increaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph' },
      { at: [0] },
    );
  });

  it('should decrease heading level number (e.g., level 3 -> 2)', () => {
    const headNode = { type: 'head', level: 3, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    increaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { level: 2 },
      { at: [0] },
    );
  });

  it('should not change non-top-level node', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(false);

    increaseHeadingLevel(editor);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('should not change unsupported node type', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    (Editor.nodes as Mock).mockReturnValue([[codeNode, [0]]]);

    increaseHeadingLevel(editor);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });
});

describe('decreaseHeadingLevel', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = { selection: null, children: [] } as any;
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(true);
  });

  it('should convert paragraph to level 1 heading', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);

    decreaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'head', level: 1 },
      { at: [0] },
    );
  });

  it('should convert level 4 heading to paragraph', () => {
    const headNode = { type: 'head', level: 4, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    decreaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph' },
      { at: [0] },
    );
  });

  it('should increase heading level number (e.g., level 2 -> 3)', () => {
    const headNode = { type: 'head', level: 2, children: [{ text: 'Title' }] };
    (Editor.nodes as Mock).mockReturnValue([[headNode, [0]]]);

    decreaseHeadingLevel(editor);

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { level: 3 },
      { at: [0] },
    );
  });

  it('should not change non-top-level node', () => {
    const paragraphNode = { type: 'paragraph', children: [{ text: 'text' }] };
    (Editor.nodes as Mock).mockReturnValue([[paragraphNode, [0]]]);
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(false);

    decreaseHeadingLevel(editor);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });

  it('should not change unsupported node type', () => {
    const codeNode = { type: 'code', children: [{ text: '' }] };
    (Editor.nodes as Mock).mockReturnValue([[codeNode, [0]]]);

    decreaseHeadingLevel(editor);

    expect(Transforms.setNodes).not.toHaveBeenCalled();
  });
});
