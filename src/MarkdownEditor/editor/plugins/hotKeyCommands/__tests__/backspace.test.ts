import { Editor, Element, Node, Path, Point, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { EditorUtils } from '../../../utils/editorUtils';
import { isListType } from '../../withListsPlugin';
import { BackspaceKey } from '../backspace';

// Mock Slate's Editor, Transforms, and other dependencies
vi.mock('slate', () => {
  const mockFn = () => vi.fn() as Mock;
  return {
    Editor: {
      start: mockFn(),
      end: mockFn(),
      nodes: mockFn(),
      parent: mockFn(),
      previous: mockFn(),
      hasPath: mockFn(),
      node: mockFn(),
      isEditor: mockFn(),
    },
    Element: {
      isElement: mockFn(),
    },
    Node: {
      leaf: mockFn(),
      string: mockFn(),
      get: mockFn(),
    },
    Path: {
      hasPrevious: mockFn(),
      previous: mockFn(),
      parent: mockFn(),
      next: mockFn(),
    },
    Point: {
      equals: mockFn(),
    },
    Range: {
      edges: mockFn(),
      start: mockFn(),
      isCollapsed: mockFn(),
    },
    Transforms: {
      delete: mockFn(),
      insertNodes: mockFn(),
      removeNodes: mockFn(),
      select: mockFn(),
      setNodes: mockFn(),
      moveNodes: mockFn(),
      liftNodes: mockFn(),
    },
  };
});

// Mock EditorUtils
vi.mock('../../../utils/editorUtils', () => ({
  EditorUtils: {
    deleteAll: vi.fn(),
    isDirtLeaf: vi.fn(),
    clearMarks: vi.fn(),
    isTop: vi.fn(),
    p: { type: 'paragraph', children: [{ text: '' }] },
    copy: vi.fn(),
    moveNodes: vi.fn(),
  },
}));

// Mock withListsPlugin
vi.mock('../../withListsPlugin', () => ({
  isListType: vi.fn(),
}));

describe('BackspaceKey', () => {
  let editor: Editor;
  let backspaceKey: BackspaceKey;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a mock editor
    editor = {
      selection: null,
      children: [],
    } as any;

    backspaceKey = new BackspaceKey(editor);
  });

  describe('range()', () => {
    it('should handle full document selection', () => {
      // Mock selection that covers the entire document
      const mockStart = { offset: 0, path: [0] };
      const mockEnd = { offset: 10, path: [1] };
      editor.selection = { anchor: mockStart, focus: mockEnd } as any;

      // Mock Range.edges to return the start and end points
      (Range.edges as Mock).mockReturnValue([mockStart, mockEnd]);

      // Mock Editor.start and Editor.end
      (Editor.start as Mock).mockReturnValue(mockStart);
      (Editor.end as Mock).mockReturnValue(mockEnd);

      (Point.equals as Mock)
        .mockReturnValueOnce(true) // start point equals
        .mockReturnValueOnce(true); // end point equals

      const result = backspaceKey.range();

      expect(result).toBe(true);
      expect(EditorUtils.deleteAll).toHaveBeenCalledWith(editor);
      expect(Transforms.select).toHaveBeenCalled();
    });

    it('should return false when no selection exists', () => {
      editor.selection = null;
      const result = backspaceKey.range();
      expect(result).toBe(undefined);
    });
  });

  describe('run()', () => {
    it('should handle heading conversion to paragraph when empty', () => {
      const mockStart = { offset: 0, path: [0, 0] };
      editor.selection = { anchor: mockStart, focus: mockStart } as any;
      const headNode = { type: 'head', children: [] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[headNode, path]]);
      (Node.string as Mock).mockReturnValue('');
      (Range.start as Mock).mockReturnValue(mockStart);
      (Node.leaf as Mock).mockReturnValue({ text: '' });
      (EditorUtils.isDirtLeaf as Mock).mockReturnValue(false);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.setNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: path },
      );
    });

    it('should handle media node deletion', () => {
      const mockStart = { offset: 0, path: [0, 0] };
      editor.selection = { anchor: mockStart, focus: mockStart } as any;
      const mediaNode = { type: 'media', children: [] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[mediaNode, path]]);
      (Range.start as Mock).mockReturnValue(mockStart);
      (Node.leaf as Mock).mockReturnValue({ text: '' });
      (EditorUtils.isDirtLeaf as Mock).mockReturnValue(false);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: path });
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        EditorUtils.p,
        { at: path, select: true },
      );
    });

    it('should handle table cell at start position', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      } as any;
      const tableCellNode = { type: 'table-cell', children: [] };
      const path = [0, 0, 0];
      const mockStart = { offset: 0, path: [0, 0, 0] };

      (Editor.nodes as Mock).mockReturnValue([[tableCellNode, path]]);
      (Path.hasPrevious as Mock)
        .mockReturnValueOnce(false) // for start.path
        .mockReturnValueOnce(true); // for path
      (Range.start as Mock).mockReturnValue(mockStart);
      (Node.leaf as Mock).mockReturnValue({ text: '' });
      (EditorUtils.isDirtLeaf as Mock).mockReturnValue(false);

      const result = backspaceKey.run();

      expect(result).toBe(true);
    });

    it('should handle empty list item deletion', () => {
      editor.selection = { anchor: {}, focus: {} } as any;
      const paragraphNode = { type: 'paragraph', children: [] };
      const path = [0];
      const parentNode = { type: 'list-item', children: [] };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([parentNode, [0]]);
      (Node.string as Mock).mockReturnValue('');

      // 为新逻辑添加必要的mock
      (Path.parent as Mock).mockReturnValue([1]); // listPath
      const listNode = { type: 'ordered-list', children: [parentNode] };
      (Editor.node as Mock).mockReturnValue([listNode, [1]]);
      (EditorUtils.copy as Mock).mockReturnValue([{ text: '' }]);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.removeNodes).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    // 新的测试用例：测试列表拆分逻辑
    it('should delete last list item and replace with paragraph', () => {
      editor.selection = { anchor: {}, focus: {} } as any;
      const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
      const path = [0, 0];
      const listItemNode = { type: 'list-item', children: [paragraphNode] };
      const listNode = {
        type: 'ordered-list',
        children: [listItemNode], // 只有一个item，所以是最后一个
      };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([listItemNode, [0]]);
      (Node.string as Mock).mockReturnValue(''); // 空的list-item
      (Path.parent as Mock).mockReturnValue([1]); // listPath
      (Editor.node as Mock).mockReturnValue([listNode, [1]]); // listNode
      (isListType as any).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue({ children: [] }); // 删除后列表为空

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [0] });
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });

    it('should split list when deleting non-last list item', () => {
      editor.selection = { anchor: {}, focus: {} } as any;
      const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
      const path = [1, 0]; // 第二个list-item中的paragraph
      const listItemNode1 = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item 1' }] }],
      };
      const listItemNode2 = { type: 'list-item', children: [paragraphNode] }; // 当前要删除的空item
      const listItemNode3 = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item 3' }] }],
      };
      const listNode = {
        type: 'unordered-list',
        children: [listItemNode1, listItemNode2, listItemNode3], // 三个items，删除中间的
      };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([listItemNode2, [1]]);
      (Node.string as Mock).mockReturnValue(''); // 空的list-item
      (Path.parent as Mock).mockReturnValue([0]); // listPath
      (Editor.node as Mock).mockReturnValue([listNode, [0]]); // listNode
      (Path.next as Mock)
        .mockReturnValueOnce([1]) // insertPath
        .mockReturnValueOnce([2]); // newListPath
      (EditorUtils.copy as Mock).mockReturnValue([{ text: '' }]);

      (isListType as any).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue({ children: [listItemNode1] }); // 删除后还有前面的item

      const result = backspaceKey.run();

      expect(result).toBe(true);

      // 验证删除后续items (从后往前删除)
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [0, 2] });

      // 验证删除当前item
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [1] });

      // 验证插入paragraph (在列表后插入)
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });

    it('should handle splitting ordered list and preserve list type', () => {
      editor.selection = { anchor: {}, focus: {} } as any;
      const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
      const path = [0, 0]; // 第一个list-item中的paragraph
      const listItemNode1 = { type: 'list-item', children: [paragraphNode] }; // 当前要删除的空item
      const listItemNode2 = {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'Item 2' }] }],
      };
      const listNode = {
        type: 'ordered-list',
        children: [listItemNode1, listItemNode2], // 删除第一个item
      };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([listItemNode1, [0]]);
      (Node.string as Mock).mockReturnValue(''); // 空的list-item
      (Path.parent as Mock).mockReturnValue([1]); // listPath
      (Editor.node as Mock).mockReturnValue([listNode, [1]]); // listNode
      (isListType as any).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue({ children: [] }); // 删除后列表为空

      const result = backspaceKey.run();

      expect(result).toBe(true);

      // 验证删除当前item
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [0] });
      // 验证删除空列表容器
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [1] });
      // 验证在列表位置插入 paragraph
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });

    it('should handle deleting only list item in list', () => {
      editor.selection = { anchor: {}, focus: {} } as any;
      const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
      const path = [0, 0];
      const listItemNode = { type: 'list-item', children: [paragraphNode] };
      const listNode = {
        type: 'unordered-list',
        children: [listItemNode], // 只有一个item
      };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([listItemNode, [0]]);
      (Node.string as Mock).mockReturnValue(''); // 空的list-item
      (Path.parent as Mock).mockReturnValue([1]); // listPath
      (Editor.node as Mock).mockReturnValue([listNode, [1]]); // listNode
      (isListType as any).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue({ children: [] }); // 删除后列表为空

      const result = backspaceKey.run();

      expect(result).toBe(true);

      // 验证删除当前item并替换成paragraph (因为是最后一个)
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [0] });
      // 验证删除空列表容器
      expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, { at: [1] });
      // 验证在列表位置插入 paragraph
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });

    it('should handle blockquote deletion', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      const paragraphNode = { type: 'paragraph', children: [] };
      const path = [0, 0];
      const parentNode = { type: 'blockquote', children: [] };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock).mockReturnValue([parentNode, [0]]);
      (Editor.previous as Mock).mockReturnValue(null);
      (Editor.hasPath as Mock).mockReturnValue(false);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.delete).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    it('should handle break node deletion', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      } as any;
      const paragraphNode = { type: 'paragraph', children: [] };
      const path = [0];
      const breakNode = { type: 'break' };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.previous as Mock).mockReturnValue([breakNode, [0]]);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.delete).toHaveBeenCalled();
    });

    it('should handle first paragraph in editor deletion', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      } as any;
      const paragraphNode = { type: 'paragraph', children: [] };
      const path = [0];

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.previous as Mock).mockReturnValue(null);
      (Editor.parent as Mock).mockReturnValue([editor, []]);
      (Editor.hasPath as Mock).mockReturnValue(true);
      (Editor.node as Mock).mockReturnValue([{ type: 'paragraph' }, [1]]);
      (Editor.isEditor as any).mockReturnValue(true);

      const result = backspaceKey.run();

      expect(result).toBe(true);
      expect(Transforms.delete).toHaveBeenCalled();
    });

    it('should handle list item merging with previous item', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      } as any;
      const paragraphNode = { type: 'paragraph', children: [] };
      const path = [0, 0];
      const parentNode = { type: 'list-item', children: [] };

      (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
      (Editor.parent as Mock)
        .mockReturnValueOnce([parentNode, [0]]) // first call for list-item check
        .mockReturnValueOnce([parentNode, [0]]); // second call for list-item logic

      // Mock for empty list-item logic
      (Node.string as Mock).mockReturnValue('');

      // 为新的拆分逻辑添加必要的mock
      (Path.parent as Mock).mockReturnValue([1]); // listPath
      const listNode = { type: 'ordered-list', children: [parentNode] };
      (Editor.node as Mock).mockReturnValue([listNode, [1]]);
      (isListType as any).mockReturnValue(true);
      (Node.get as Mock).mockReturnValue({ children: [] }); // 删除后列表为空

      const result = backspaceKey.run();

      expect(result).toBe(true);
      // 验证函数正确处理了列表项的场景
      expect(Transforms.removeNodes).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalled();
    });

    describe('list-item deletion with removeNodes', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it('should delete last list-item and remove empty list container', () => {
        editor.selection = {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        } as any;
        const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
        const path = [0, 0];
        const listItemNode = { type: 'list-item', children: [paragraphNode] };
        const listNode = {
          type: 'bulleted-list',
          children: [listItemNode], // 只有一个item
        };

        (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
        (Editor.parent as Mock)
          .mockReturnValueOnce([listItemNode, [0]]) // first call
          .mockReturnValueOnce([listItemNode, [0]]); // second call
        (Node.string as Mock).mockReturnValue(''); // 空的list-item
        (Path.parent as Mock).mockReturnValue([1]); // listPath
        (Editor.node as Mock).mockReturnValue([listNode, [1]]); // listNode
        (isListType as any).mockReturnValue(true);
        (Node.get as Mock).mockReturnValue({ children: [] }); // 删除后列表为空

        const result = backspaceKey.run();

        expect(result).toBe(true);
        // 验证使用 removeNodes 删除 list-item
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [0],
        });
        // 验证删除空列表容器
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [1],
        });
        // 验证在列表位置插入 paragraph
        expect(Transforms.insertNodes).toHaveBeenCalledWith(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [1], select: true },
        );
      });

      it('should delete last list-item but keep list if it has other items', () => {
        editor.selection = {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        } as any;
        const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
        const path = [1, 0];
        const listItemNode1 = {
          type: 'list-item',
          children: [{ type: 'paragraph', children: [{ text: 'Item 1' }] }],
        };
        const listItemNode2 = { type: 'list-item', children: [paragraphNode] };
        const listNode = {
          type: 'numbered-list',
          children: [listItemNode1, listItemNode2], // 两个items，删除最后一个
        };

        (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
        (Editor.parent as Mock)
          .mockReturnValueOnce([listItemNode2, [1]]) // first call
          .mockReturnValueOnce([listItemNode2, [1]]); // second call
        (Node.string as Mock).mockReturnValue(''); // 空的list-item
        (Path.parent as Mock).mockReturnValue([2]); // listPath
        (Editor.node as Mock).mockReturnValue([listNode, [2]]); // listNode
        (isListType as any).mockReturnValue(true);
        (Node.get as Mock).mockReturnValue({ children: [listItemNode1] }); // 删除后还有前面的item

        const result = backspaceKey.run();

        expect(result).toBe(true);
        // 验证使用 removeNodes 删除 list-item
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [1],
        });
        // 验证不应该删除列表容器（因为还有前面的item）
        expect(Transforms.removeNodes).not.toHaveBeenCalledWith(editor, {
          at: [2],
        });
        // 验证在删除位置插入 paragraph
        expect(Transforms.insertNodes).toHaveBeenCalledWith(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [1], select: true },
        );
      });

      it('should delete non-last list-item and remove empty list container', () => {
        editor.selection = {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        } as any;
        const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
        const path = [0, 0];
        const listItemNode1 = { type: 'list-item', children: [paragraphNode] };
        const listItemNode2 = {
          type: 'list-item',
          children: [{ type: 'paragraph', children: [{ text: 'Item 2' }] }],
        };
        const listNode = {
          type: 'bulleted-list',
          children: [listItemNode1, listItemNode2], // 删除第一个，保留第二个
        };

        (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
        (Editor.parent as Mock)
          .mockReturnValueOnce([listItemNode1, [0]]) // first call
          .mockReturnValueOnce([listItemNode1, [0]]); // second call
        (Node.string as Mock).mockReturnValue(''); // 空的list-item
        (Path.parent as Mock).mockReturnValue([1]); // listPath
        (Editor.node as Mock).mockReturnValue([listNode, [1]]); // listNode
        (isListType as any).mockReturnValue(true);
        (Path.next as Mock).mockReturnValue([2]); // insertPath
        (Node.get as Mock)
          .mockReturnValueOnce({ children: [] }) // 删除后列表为空
          .mockReturnValueOnce({ children: [] }); // 再次检查

        const result = backspaceKey.run();

        expect(result).toBe(true);
        // 验证删除后续items
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [1, 1],
        });
        // 验证删除当前item
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [0],
        });
        // 验证删除空列表容器
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [1],
        });
        // 验证在列表位置插入 paragraph
        expect(Transforms.insertNodes).toHaveBeenCalledWith(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [1], select: true },
        );
      });

      it('should delete non-last list-item and keep list with remaining items', () => {
        editor.selection = {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        } as any;
        const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
        const path = [1, 0];
        const listItemNode1 = {
          type: 'list-item',
          children: [{ type: 'paragraph', children: [{ text: 'Item 1' }] }],
        };
        const listItemNode2 = { type: 'list-item', children: [paragraphNode] };
        const listItemNode3 = {
          type: 'list-item',
          children: [{ type: 'paragraph', children: [{ text: 'Item 3' }] }],
        };
        const listNode = {
          type: 'numbered-list',
          children: [listItemNode1, listItemNode2, listItemNode3], // 删除中间的
        };

        (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
        (Editor.parent as Mock)
          .mockReturnValueOnce([listItemNode2, [1]]) // first call
          .mockReturnValueOnce([listItemNode2, [1]]); // second call
        (Node.string as Mock).mockReturnValue(''); // 空的list-item
        (Path.parent as Mock).mockReturnValue([2]); // listPath
        (Editor.node as Mock).mockReturnValue([listNode, [2]]); // listNode
        (isListType as any).mockImplementation((node: any) => {
          // Return true for list nodes
          return node && (node.type === 'numbered-list' || node.type === 'bulleted-list' || node.type === 'ordered-list' || node.type === 'unordered-list');
        });
        (Path.next as Mock).mockReturnValue([3]); // insertPath
        // Node.get is called after deletion to check if list is empty
        // The list should still have listItemNode1 after deletion, so list container shouldn't be deleted
        (Node.get as Mock).mockReturnValue({
          type: 'numbered-list',
          children: [listItemNode1],
        }); // After deletion, still has items

        const result = backspaceKey.run();

        expect(result).toBe(true);
        // 验证删除后续items (listPath是[2], 所以删除[2, 2])
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [2, 2],
        });
        // 验证删除当前item
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [1],
        });
        // 验证不应该删除列表容器（因为还有前面的item）
        // listPath是[2]，所以不应该删除[2]
        // 检查是否有调用删除列表容器的操作
        expect(Transforms.removeNodes).not.toHaveBeenCalledWith(editor, {
          at: [2],
        });
        // 验证在列表后插入 paragraph
        expect(Transforms.insertNodes).toHaveBeenCalledWith(
          editor,
          { type: 'paragraph', children: [{ text: '' }] },
          { at: [3], select: true },
        );
      });

      it('should handle outdent list-item when at start of paragraph in list-item', () => {
        editor.selection = {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        } as any;
        const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
        const path = [0, 0, 0];
        const listItemNode = { type: 'list-item', children: [paragraphNode] };
        const nestedList = {
          type: 'bulleted-list',
          children: [listItemNode],
        };
        const parentListItem = {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'Parent' }] },
            nestedList,
          ],
        };
        (Editor.nodes as Mock).mockReturnValue([[paragraphNode, path]]);
        // Implementation calls Editor.parent multiple times:
        // 1. First call at line 43: Editor.parent(this.editor, path) for clearStyle check - returns list-item
        // 2. Second call at line 70: Editor.parent(this.editor, path) for paragraph check - returns list-item
        // 3. Third call at line 79: Editor.parent(this.editor, listPath) where listPath is [0, 1] - returns parent list-item
        (Editor.parent as Mock)
          .mockReturnValueOnce([listItemNode, [0, 0]]) // First call: for clearStyle check
          .mockReturnValueOnce([listItemNode, [0, 0]]) // Second call: for paragraph check
          .mockReturnValueOnce([parentListItem, [0]]); // Third call: for listParent check
        (Range.isCollapsed as Mock).mockReturnValue(true);
        (isListType as unknown as Mock).mockReturnValue(true);
        (Element.isElement as unknown as Mock).mockReturnValue(true);
        // Node.get is called twice:
        // 1. First call: get list at listPath [0, 1] to check if it's a list type
        // 2. Second call: after lift, check if list is empty
        (Node.get as Mock)
          .mockReturnValueOnce(nestedList) // First call: get list at listPath [0, 1]
          .mockReturnValueOnce({ type: 'bulleted-list', children: [] }); // Second call: after lift, check if list is empty
        (Path.hasPrevious as Mock).mockReturnValue(false);
        // listPath is Path.parent(listItemPath) where listItemPath is [0, 0]
        // So listPath should be [0, 1]
        (Path.parent as Mock).mockReturnValue([0, 1]); // listPath

        const result = backspaceKey.run();

        expect(result).toBe(true);
        // 验证使用 liftNodes 提升 list-item
        expect(Transforms.liftNodes).toHaveBeenCalledWith(editor, {
          at: [0, 0],
        });
        // 验证删除空列表
        expect(Transforms.removeNodes).toHaveBeenCalledWith(editor, {
          at: [0, 1],
        });
      });
    });
  });
});
