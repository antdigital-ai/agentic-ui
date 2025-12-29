import { Editor, Node, NodeEntry, Path, Point, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { HeadNode, ParagraphNode } from '../../../../el';
import { EditorUtils } from '../../../utils/editorUtils';
import { EnterKey } from '../enter';

// Mock Slate's Editor, Transforms, and other dependencies
vi.mock('slate', () => {
  const mockFn = () => vi.fn() as Mock;
  return {
    Editor: {
      start: mockFn(),
      end: mockFn(),
      nodes: mockFn(),
      parent: mockFn(),
      hasPath: mockFn(),
      node: mockFn(),
      isEditor: mockFn(),
      string: mockFn(),
    },
    Element: {
      isElement: mockFn(),
    },
    Node: {
      leaf: mockFn(),
      string: mockFn(),
      get: mockFn(),
      fragment: mockFn(),
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
      end: mockFn(),
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
    p: { type: 'paragraph', children: [{ text: '' }] },
    cutText: vi.fn(),
    clearMarks: vi.fn(),
    moveNodes: vi.fn(),
    isTop: vi.fn(),
  },
}));

// Mock BackspaceKey
vi.mock('../backspace', () => ({
  BackspaceKey: vi.fn().mockImplementation(() => ({
    range: vi.fn(),
  })),
}));

describe('EnterKey', () => {
  let editor: any;
  let enterKey: EnterKey;
  let mockBackspace: any;
  let mockStore: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a mock editor
    editor = {
      selection: null,
      children: [],
      insertBreak: vi.fn(),
    };

    // Create mock store
    mockStore = {
      get editor() {
        return editor;
      },
      inputComposition: false,
    };

    mockBackspace = { range: vi.fn() };

    enterKey = new EnterKey(mockStore, mockBackspace);
  });

  describe('run()', () => {
    it('should return early if no selection', () => {
      editor.selection = null;
      const mockEvent = { preventDefault: vi.fn() } as any;

      const result = enterKey.run(mockEvent);

      expect(result).toBeUndefined();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should return early if input composition is active', () => {
      mockStore.inputComposition = true;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const mockEvent = { preventDefault: vi.fn() } as any;

      const result = enterKey.run(mockEvent);

      expect(result).toBeUndefined();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should handle non-collapsed selection by calling backspace range', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;
      (Range.isCollapsed as Mock).mockReturnValue(false);

      const mockEvent = { preventDefault: vi.fn() } as any;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockBackspace.range).toHaveBeenCalled();
    });

    it('should handle card-before element', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      (Range.isCollapsed as Mock).mockReturnValue(true);

      const cardBeforeElement = {
        type: 'card-before',
        children: [{ text: '' }],
      };
      const path = [0];
      (Editor.nodes as Mock).mockReturnValue([[cardBeforeElement, path]]);
      (Path.parent as Mock).mockReturnValue([]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        EditorUtils.p,
        { at: [], select: true },
      );
    });

    it('should handle card-after element', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      (Range.isCollapsed as Mock).mockReturnValue(true);

      const cardAfterElement = { type: 'card-after', children: [{ text: '' }] };
      const path = [0];
      (Editor.nodes as Mock).mockReturnValue([[cardAfterElement, path]]);
      (Path.parent as Mock).mockReturnValue([]);
      (Path.next as Mock).mockReturnValue([1]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        EditorUtils.p,
        { at: [1], select: true },
      );
    });

    it('should handle break element', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      (Range.isCollapsed as Mock).mockReturnValue(true);

      const breakElement = { type: 'break', children: [{ text: '' }] };
      const path = [0];
      (Editor.nodes as Mock).mockReturnValue([[breakElement, path]]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      enterKey.run(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should call insertBreak when no special handling is needed', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      (Range.isCollapsed as Mock).mockReturnValue(true);
      (Editor.nodes as Mock).mockReturnValue([]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      enterKey.run(mockEvent);

      expect(editor.insertBreak).toHaveBeenCalled();
    });
  });

  describe('head() method', () => {
    it('should insert paragraph at start of heading', () => {
      const headElement: HeadNode = {
        type: 'head',
        level: 1,
        children: [{ text: 'Heading' }],
      };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      const start = { path: [0, 0], offset: 0 };
      const elStart = { path: [0, 0], offset: 0 };

      (Range.start as Mock).mockReturnValue(start);
      (Range.end as Mock).mockReturnValue({ path: [0, 0], offset: 7 });
      (Editor.start as Mock).mockReturnValue(elStart);
      (Editor.end as Mock).mockReturnValue({ path: [0, 0], offset: 7 });
      (Point.equals as Mock).mockReturnValue(true);

      const result = (enterKey as any).head(headElement, path, sel);

      expect(result).toBe(true);
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: path },
      );
    });

    it('should insert paragraph at end of heading', () => {
      const headElement: HeadNode = {
        type: 'head',
        level: 1,
        children: [{ text: 'Heading' }],
      };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      };

      const start = { path: [0, 0], offset: 7 };
      const end = { path: [0, 0], offset: 7 };
      const elStart = { path: [0, 0], offset: 0 };
      const elEnd = { path: [0, 0], offset: 7 };

      (Range.start as Mock).mockReturnValue(start);
      (Range.end as Mock).mockReturnValue(end);
      (Editor.start as Mock).mockReturnValue(elStart);
      (Editor.end as Mock).mockReturnValue(elEnd);
      (Point.equals as Mock)
        .mockReturnValueOnce(false) // start !== elStart
        .mockReturnValueOnce(true); // end === elEnd
      (Path.next as Mock).mockReturnValue([1]);

      const result = (enterKey as any).head(headElement, path, sel);

      expect(result).toBe(true);
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });
  });

  describe('empty() method', () => {
    it('should handle empty blockquote removal', () => {
      const path = [0, 0];
      const blockquoteParent = [{ type: 'blockquote', children: [] }, [0]];

      (Editor.parent as Mock).mockReturnValue(blockquoteParent);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Editor.hasPath as Mock).mockReturnValue(false);

      const mockEvent = { preventDefault: vi.fn() } as any;

      (enterKey as any).empty(mockEvent, path);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.delete).toHaveBeenCalledWith(editor, {
        at: blockquoteParent[1],
      });
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: blockquoteParent[1], select: true },
      );
    });

    it('should handle empty list-item when it is the only item', () => {
      const path = [0, 0];
      const listItemParent = [
        { type: 'list-item', children: [{ text: '' }] },
        [0],
      ];
      const listParent = [{ type: 'list', children: [listItemParent[0]] }, []];

      (Editor.parent as Mock)
        .mockReturnValueOnce(listItemParent)
        .mockReturnValueOnce(listParent);

      const mockEvent = { preventDefault: vi.fn() } as any;

      (enterKey as any).empty(mockEvent, path);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.delete).toHaveBeenCalledWith(editor, {
        at: listParent[1],
      });
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        EditorUtils.p,
        { at: listParent[1], select: true },
      );
    });
  });

  describe('table() method', () => {
    it('should insert break with Ctrl+Shift+Enter', () => {
      const tableNode = [{ type: 'table', children: [] }, [0, 0]] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };
      const mockEvent = {
        preventDefault: vi.fn(),
        metaKey: true,
        shiftKey: true,
      } as any;

      (enterKey as any).table(tableNode, sel, mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        [{ type: 'break', children: [{ text: '' }] }, { text: '' }],
        { select: true },
      );
    });

    it('should insert new table row with Ctrl+Enter', () => {
      const tableNode = [{ type: 'table', children: [] }, [0, 0]] as any;
      const sel = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      };
      const mockEvent = {
        preventDefault: vi.fn(),
        metaKey: true,
        shiftKey: false,
      } as any;

      const rowParent = [{ type: 'table-row', children: [{}, {}] }, [0]] as any;
      (Editor.parent as Mock).mockReturnValue(rowParent);
      (Editor.start as Mock).mockReturnValue({ path: [1, 0], offset: 0 });
      (Path.next as Mock).mockReturnValue([1]);

      (enterKey as any).table(tableNode, sel, mockEvent);

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          type: 'table-row',
          children: expect.arrayContaining([
            expect.objectContaining({ type: 'table-cell' }),
            expect.objectContaining({ type: 'table-cell' }),
          ]),
        }),
        { at: [1] },
      );
    });

    it('should navigate to next row on Enter', () => {
      const tableNode = [{ type: 'table', children: [] }, [0, 1]] as any;
      const sel = {
        anchor: { path: [0, 0, 1], offset: 0 },
        focus: { path: [0, 0, 1], offset: 0 },
      };
      const mockEvent = { preventDefault: vi.fn(), metaKey: false } as any;

      // Mock Path operations
      (Path.parent as Mock).mockReturnValue([0]);
      (Path.next as Mock).mockReturnValue([1]);
      (Editor.hasPath as Mock).mockReturnValue(true);
      (Editor.end as Mock).mockReturnValue({ path: [1, 1], offset: 0 });

      (enterKey as any).table(tableNode, sel, mockEvent);

      expect(Transforms.select).toHaveBeenCalledWith(editor, {
        path: [1, 1],
        offset: 0,
      });
    });
  });

  describe('paragraph() method', () => {
    it('should return undefined when no matching pattern found', () => {
      const paragraphElement = {
        type: 'paragraph',
        children: [{ text: 'Regular text' }],
      };
      const path = [0, 0];
      const sel = {
        anchor: { path: [0, 0], offset: 12 },
        focus: { path: [0, 0], offset: 12 },
      };
      const node = [paragraphElement, path] as NodeEntry<ParagraphNode>;
      const mockEvent = { preventDefault: vi.fn() } as any;

      // Mock the parent to not be a list-item
      const mockParent = [{ type: 'root', children: [] }, []];
      (Editor.parent as Mock).mockReturnValue(mockParent);
      (Editor.end as Mock).mockReturnValue({ path: [0, 0], offset: 12 });
      (Point.equals as Mock).mockReturnValue(true);
      (Node.string as Mock).mockReturnValue('Regular text');
      (Path.hasPrevious as Mock).mockReturnValue(false);

      const result = (enterKey as any).paragraph(mockEvent, node, sel);

      expect(result).toBeUndefined();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should handle paragraph in list-item with Cmd/Ctrl key', () => {
      const paragraphElement = {
        type: 'paragraph',
        children: [{ text: 'List item text' }],
      };
      const path = [0, 0];
      const sel = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      };
      const node = [paragraphElement, path] as NodeEntry<ParagraphNode>;
      const mockEvent = { preventDefault: vi.fn(), metaKey: true } as any;

      const mockParent = [
        { type: 'list-item', children: [paragraphElement] },
        [0],
      ];
      (Editor.parent as Mock).mockReturnValue(mockParent);
      (Editor.end as Mock).mockReturnValue({ path: [0, 0], offset: 14 });
      (Point.equals as Mock).mockReturnValue(false);
      (EditorUtils.cutText as Mock).mockReturnValue([{ text: ' item text' }]);
      (Path.next as Mock).mockReturnValue([0, 1]);
      (Editor.hasPath as Mock).mockReturnValue(true);
      (Editor.start as Mock).mockReturnValue({ path: [0, 1], offset: 0 });

      const result = (enterKey as any).paragraph(mockEvent, node, sel);

      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'paragraph',
          children: [{ text: ' item text' }],
        },
        { at: [0, 1] },
      );
    });

    it('should handle new list-item creation in checked list', () => {
      const paragraphElement = {
        type: 'paragraph',
        children: [{ text: 'Checked item' }],
      };
      const path = [0, 0];
      const sel = {
        anchor: { path: [0, 0], offset: 12 },
        focus: { path: [0, 0], offset: 12 },
      };
      const node = [paragraphElement, path] as NodeEntry<ParagraphNode>;
      const mockEvent = { preventDefault: vi.fn(), metaKey: false } as any;

      const mockParent = [
        { type: 'list-item', children: [paragraphElement], checked: true },
        [0],
      ];
      (Editor.parent as Mock).mockReturnValue(mockParent);
      (Editor.end as Mock).mockReturnValue({ path: [0, 0], offset: 12 });
      (Point.equals as Mock).mockReturnValue(true);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (EditorUtils.cutText as Mock).mockReturnValue([{ text: '' }]);
      (Path.next as Mock).mockReturnValue([1]);
      (Editor.start as Mock).mockReturnValue({ path: [1], offset: 0 });
      (Editor.hasPath as Mock).mockReturnValue(false);
      (Node.string as Mock).mockReturnValue('Checked item');
      (Node.get as Mock).mockReturnValue(paragraphElement);

      const result = (enterKey as any).paragraph(mockEvent, node, sel);

      expect(result).toBe(true);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'list-item',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
          checked: false,
        },
        { at: [1] },
      );
    });
  });

  describe('empty() method - extended cases', () => {
    it('should handle blockquote with next element', () => {
      const path = [0, 0];
      const blockquoteParent = [{ type: 'blockquote', children: [] }, [0]];

      (Editor.parent as Mock).mockReturnValue(blockquoteParent);
      (Path.hasPrevious as Mock).mockReturnValue(true); // Has previous, so first condition fails
      (Editor.hasPath as Mock).mockReturnValue(false); // No next path, so second condition triggers
      (Path.next as Mock).mockReturnValueOnce([0, 1]).mockReturnValueOnce([1]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      (enterKey as any).empty(mockEvent, path);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.delete).toHaveBeenCalledWith(editor, { at: path });
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph', children: [{ text: '' }] },
        { at: [1], select: true },
      );
    });

    it('should handle list-item with non-empty content', () => {
      const path = [0, 0];
      const listItemParent = [
        {
          type: 'list-item',
          children: [{ text: 'Some content' }, { text: 'more' }],
        },
        [0],
      ];
      const listParent = [{ type: 'list', children: [listItemParent[0]] }, []];

      (Editor.parent as Mock)
        .mockReturnValueOnce(listItemParent)
        .mockReturnValueOnce(listParent);
      (Editor.hasPath as Mock).mockReturnValue(true);
      (Path.hasPrevious as Mock).mockReturnValue(false);
      (Path.next as Mock).mockReturnValue([1]);

      const mockEvent = { preventDefault: vi.fn() } as any;

      (enterKey as any).empty(mockEvent, path);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'list-item',
          checked: undefined,
          children: [EditorUtils.p],
        },
        { at: [1], select: true },
      );
    });

    it('should handle list-item with checked state and non-empty content', () => {
      const path = [0, 0];
      const listItemParent = [
        {
          type: 'list-item',
          children: [{ text: 'Content' }, { text: 'more' }],
          checked: true,
        },
        [0],
      ];
      const listParent = [{ type: 'list', children: [listItemParent[0]] }, []];

      (Editor.parent as Mock)
        .mockReturnValueOnce(listItemParent)
        .mockReturnValueOnce(listParent);
      (Editor.hasPath as Mock).mockReturnValue(false);
      (Path.hasPrevious as Mock).mockReturnValue(false);

      const mockEvent = { preventDefault: vi.fn() } as any;

      (enterKey as any).empty(mockEvent, path);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'list-item',
          checked: false,
          children: [EditorUtils.p],
        },
        { at: [1], select: true },
      );
    });
  });

  describe('table() method - extended cases', () => {
    it('should navigate to next element after table when no next row exists', () => {
      const tableNode = [{ type: 'table', children: [] }, [0, 1]] as any;
      const sel = {
        anchor: { path: [0, 0, 1], offset: 0 },
        focus: { path: [0, 0, 1], offset: 0 },
      };
      const mockEvent = { preventDefault: vi.fn(), metaKey: false } as any;

      // Mock Path operations - no next row exists
      (Path.parent as Mock)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([0, 0]);
      (Path.next as Mock).mockReturnValueOnce([1]).mockReturnValueOnce([1]);
      (Editor.hasPath as Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (Editor.start as Mock).mockReturnValue({ path: [1], offset: 0 });

      (enterKey as any).table(tableNode, sel, mockEvent);

      expect(Transforms.select).toHaveBeenCalledWith(editor, {
        path: [1],
        offset: 0,
      });
    });

    it('should insert new paragraph after table when no next element exists', () => {
      const tableNode = [{ type: 'table', children: [] }, [0, 1]] as any;
      const sel = {
        anchor: { path: [0, 0, 1], offset: 0 },
        focus: { path: [0, 0, 1], offset: 0 },
      };
      const mockEvent = { preventDefault: vi.fn(), metaKey: false } as any;

      // Mock Path operations - no next row and no next element exists
      (Path.parent as Mock)
        .mockReturnValueOnce([0])
        .mockReturnValueOnce([0, 0]);
      (Path.next as Mock).mockReturnValueOnce([1]).mockReturnValueOnce([1]);
      (Editor.hasPath as Mock).mockReturnValue(false);

      (enterKey as any).table(tableNode, sel, mockEvent);

      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        EditorUtils.p,
        { at: [1], select: true },
      );
    });
  });

  describe('head() method - extended cases', () => {
    it('should split heading text when cursor is in middle', () => {
      const headElement: HeadNode = {
        type: 'head',
        level: 2,
        children: [{ text: 'Split Heading' }],
      };
      const path = [0];
      const sel = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      };

      const start = { path: [0, 0], offset: 5 };
      const end = { path: [0, 0], offset: 5 };
      const elStart = { path: [0, 0], offset: 0 };
      const elEnd = { path: [0, 0], offset: 13 };

      (Range.start as Mock).mockReturnValue(start);
      (Range.end as Mock).mockReturnValue(end);
      (Editor.start as Mock).mockReturnValue(elStart);
      (Editor.end as Mock).mockReturnValue(elEnd);
      (Point.equals as Mock)
        .mockReturnValueOnce(false) // start !== elStart
        .mockReturnValueOnce(false); // end !== elEnd

      const mockFragment = [{ children: [{ text: ' Heading' }] }];
      (Node.fragment as Mock).mockReturnValue(mockFragment);
      (Path.next as Mock).mockReturnValue([1]);
      (Editor.start as Mock).mockReturnValue({ path: [1], offset: 0 });

      const result = (enterKey as any).head(headElement, path, sel);

      expect(result).toBe(true);
      expect(Transforms.delete).toHaveBeenCalled();
      expect(Transforms.insertNodes).toHaveBeenCalledWith(
        editor,
        {
          type: 'paragraph',
          children: [{ text: ' Heading' }],
        },
        { at: [1] },
      );
      expect(Transforms.select).toHaveBeenCalledWith(editor, {
        path: [1],
        offset: 0,
      });
    });
  });
});
