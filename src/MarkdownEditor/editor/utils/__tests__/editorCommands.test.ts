import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  ListsEditor,
  listMatchesToolbarMode,
  syncListMetadataForMode,
} from '../../plugins/lists';
import {
  convertToParagraph,
  createList,
  decreaseHeadingLevel,
  getCurrentNodes,
  increaseHeadingLevel,
  insertCodeBlock,
  insertHorizontalLine,
  insertTable,
  setHeading,
  toggleQuote,
} from '../editorCommands';
import { EditorUtils } from '../editorUtils';

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
      withoutNormalizing: mockFn((_, fn: () => void) => fn()),
      isInline: mockFn(() => false),
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
vi.mock('../../../utils/native-table', () => ({
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

vi.mock('../../plugins/lists/ListsEditor', () => ({
  ListsEditor: {
    isListsEnabled: vi.fn(() => true),
    getLists: vi.fn(() => []),
    unwrapList: vi.fn(() => true),
    setListType: vi.fn(() => true),
    wrapInList: vi.fn(() => true),
  },
}));

vi.mock('../../plugins/lists/taskList', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../plugins/lists/taskList')>();
  return {
    ...actual,
    listMatchesToolbarMode: vi.fn(() => false),
    syncListMetadataForMode: vi.fn(),
  };
});

function mockWrappableBlocks(blocks: Array<[Record<string, unknown>, Path]>) {
  (Editor.nodes as Mock).mockReturnValue(blocks);
  (Element.isElement as unknown as Mock).mockReturnValue(true);
}

// Note: getCurrentNodes is an internal function, we'll mock Editor.nodes instead

describe('createList', () => {
  let editor: Editor;

  beforeEach(() => {
    vi.clearAllMocks();

    editor = {
      selection: null,
      children: [],
      normalize: vi.fn(),
    } as any;

    (ListsEditor.isListsEnabled as Mock).mockReturnValue(true);
    (ListsEditor.getLists as Mock).mockReturnValue([]);
    (ListsEditor.wrapInList as Mock).mockReturnValue(true);
    (ListsEditor.unwrapList as Mock).mockReturnValue(true);
    (ListsEditor.setListType as Mock).mockReturnValue(true);
    (listMatchesToolbarMode as Mock).mockReturnValue(false);
    (Element.isElement as unknown as Mock).mockReturnValue(true);
    (Editor.withoutNormalizing as Mock).mockImplementation((_, fn) => fn());
  });

  it('should return early if no selection', () => {
    editor.selection = null;

    createList(editor, 'unordered');

    expect(ListsEditor.wrapInList).not.toHaveBeenCalled();
  });

  it('should return early when lists plugin is disabled', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    (ListsEditor.isListsEnabled as Mock).mockReturnValue(false);

    createList(editor, 'unordered');

    expect(ListsEditor.wrapInList).not.toHaveBeenCalled();
  });

  it('should wrap selection in list when no list in selection', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    const paragraphNode = { type: 'paragraph', children: [{ text: 'Test' }] };
    mockWrappableBlocks([[paragraphNode, [0]]]);
    (Node.get as Mock).mockReturnValue(paragraphNode);

    createList(editor, 'unordered');

    expect(ListsEditor.wrapInList).toHaveBeenCalledWith(
      editor,
      'bulleted-list',
      editor.selection,
    );
    expect(syncListMetadataForMode).toHaveBeenCalled();
    expect(editor.normalize).toHaveBeenCalledWith({ force: true });
  });

  it('should unwrap when selection list matches toolbar mode', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    const listNode = { type: 'bulleted-list', children: [] };
    (ListsEditor.getLists as Mock).mockReturnValue([[listNode, [0]]]);
    (listMatchesToolbarMode as Mock).mockReturnValue(true);

    createList(editor, 'unordered');

    expect(ListsEditor.unwrapList).toHaveBeenCalledWith(
      editor,
      editor.selection,
    );
    expect(ListsEditor.wrapInList).not.toHaveBeenCalled();
  });

  it('should change list type when selection is in a different list type', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    const listNode = { type: 'bulleted-list', children: [] };
    (ListsEditor.getLists as Mock).mockReturnValue([[listNode, [0]]]);

    createList(editor, 'ordered');

    expect(ListsEditor.setListType).toHaveBeenCalledWith(
      editor,
      'numbered-list',
      editor.selection,
    );
    expect(syncListMetadataForMode).toHaveBeenCalled();
  });

  it('should demote heading before wrapping in list', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    const headNode = { type: 'head', level: 1, children: [{ text: 'Title' }] };
    mockWrappableBlocks([[headNode, [0]]]);
    (Node.get as Mock).mockReturnValue(headNode);

    createList(editor, 'unordered');

    expect(Transforms.setNodes).toHaveBeenCalledWith(
      editor,
      { type: 'paragraph' },
      { at: [0] },
    );
    expect(Transforms.unsetNodes).toHaveBeenCalledWith(editor, 'level', {
      at: [0],
    });
    expect(ListsEditor.wrapInList).toHaveBeenCalled();
  });

  it('should not wrap when no wrappable blocks in selection', () => {
    editor.selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } as any;
    (Editor.nodes as Mock).mockReturnValue([]);

    createList(editor, 'unordered');

    expect(ListsEditor.wrapInList).not.toHaveBeenCalled();
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

    expect(Transforms.unwrapNodes).toHaveBeenCalledWith(editor, {
      at: parentPath,
    });
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
    (EditorUtils.isTop as unknown as Mock).mockReturnValue(true);
    (Range.isCollapsed as Mock).mockReturnValue(true);
    (Element.isElement as unknown as Mock).mockReturnValue(true);
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
    (Element.isElement as unknown as Mock).mockReturnValue(true);
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
    (Element.isElement as unknown as Mock).mockReturnValue(true);
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
    (Element.isElement as unknown as Mock).mockReturnValue(true);
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
