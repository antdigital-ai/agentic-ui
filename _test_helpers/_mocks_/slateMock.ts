/**
 * Slate 三件套 (slate / slate-react / slate-history) 的全局 Mock
 *
 * Slate 编辑器在 happy-dom / jsdom 等非浏览器环境下依赖大量真实 DOM API
 * （window.getSelection()、MutationObserver、Range 等），初始化时会无限重试导致测试卡死。
 *
 * 使用方式：在测试文件顶部添加
 *   import '../_mocks_/slateMock';
 *
 * 注意：此文件内的 vi.mock 调用会被 Vitest 自动提升到文件顶部执行，
 * 因此 import 语句的位置不影响 mock 生效时机。
 */
import React from 'react';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// 共享的 mock editor 实例，供 slate-react hooks（useSlate 等）返回
// ---------------------------------------------------------------------------
export const mockSlateEditor = {
  children: [{ type: 'paragraph', children: [{ text: '' }] }],
  operations: [],
  selection: null,
  marks: null,
  isInline: vi.fn(() => false),
  isVoid: vi.fn(() => false),
  isBlock: vi.fn(() => true),
  normalizeNode: vi.fn(),
  onChange: vi.fn(),
  addMark: vi.fn(),
  apply: vi.fn(),
  deleteBackward: vi.fn(),
  deleteForward: vi.fn(),
  deleteFragment: vi.fn(),
  getFragment: vi.fn(() => []),
  insertBreak: vi.fn(),
  insertFragment: vi.fn(),
  insertNode: vi.fn(),
  insertText: vi.fn(),
  removeMark: vi.fn(),
  getDirtyPaths: vi.fn(() => []),
  getEdge: vi.fn(() => ({ path: [0, 0], offset: 0 })),
  shouldNormalize: vi.fn(() => false),
  history: { undos: [], redos: [] },
  undo: vi.fn(),
  redo: vi.fn(),
};

// ---------------------------------------------------------------------------
// slate
// ---------------------------------------------------------------------------
vi.mock('slate', () => {
  const createEditor = vi.fn(() => ({ ...mockSlateEditor }));

  const Editor = {
    above: vi.fn(),
    after: vi.fn(),
    before: vi.fn(),
    edges: vi.fn(() => [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 0 },
    ]),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    first: vi.fn(() => [{ text: '' }, [0, 0]]),
    fragment: vi.fn(() => []),
    hasBlocks: vi.fn(() => false),
    hasInlines: vi.fn(() => false),
    hasTexts: vi.fn(() => true),
    isBlock: vi.fn(() => true),
    isEditor: vi.fn(() => false),
    isEmpty: vi.fn(() => true),
    isEnd: vi.fn(() => false),
    isInline: vi.fn(() => false),
    isNormalizing: vi.fn(() => false),
    isStart: vi.fn(() => false),
    isVoid: vi.fn(() => false),
    last: vi.fn(() => [{ text: '' }, [0, 0]]),
    leaf: vi.fn(() => [{ text: '' }, [0, 0]]),
    levels: vi.fn(function* () {}),
    marks: vi.fn(() => ({})),
    next: vi.fn(),
    node: vi.fn(() => [{ children: [] }, [0]]),
    nodes: vi.fn(function* () {}),
    normalize: vi.fn(),
    parent: vi.fn(() => [{ children: [] }, [0]]),
    path: vi.fn(() => [0]),
    pathRef: vi.fn(() => ({ current: [0], unref: vi.fn(() => [0]) })),
    pathRefs: vi.fn(() => new Set()),
    point: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    pointRef: vi.fn(() => ({
      current: { path: [0, 0], offset: 0 },
      unref: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    })),
    pointRefs: vi.fn(() => new Set()),
    positions: vi.fn(function* () {}),
    previous: vi.fn(),
    range: vi.fn(() => ({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    })),
    rangeRef: vi.fn(() => ({ current: null, unref: vi.fn(() => null) })),
    rangeRefs: vi.fn(() => new Set()),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    string: vi.fn(() => ''),
    unhangRange: vi.fn(
      (_editor: unknown, range: { anchor: unknown; focus: unknown }) => range,
    ),
    void: vi.fn(),
    withoutNormalizing: vi.fn((_editor: unknown, fn: () => void) => fn()),
    addMark: vi.fn(),
    removeMark: vi.fn(),
    deleteBackward: vi.fn(),
    deleteForward: vi.fn(),
    deleteFragment: vi.fn(),
    insertBreak: vi.fn(),
    insertFragment: vi.fn(),
    insertNode: vi.fn(),
    insertText: vi.fn(),
    setNormalizing: vi.fn(),
  };

  const Transforms = {
    collapse: vi.fn(),
    delete: vi.fn(),
    deselect: vi.fn(),
    insertFragment: vi.fn(),
    insertNodes: vi.fn(),
    insertText: vi.fn(),
    liftNodes: vi.fn(),
    mergeNodes: vi.fn(),
    move: vi.fn(),
    moveNodes: vi.fn(),
    removeNodes: vi.fn(),
    select: vi.fn(),
    setNodes: vi.fn(),
    setPoint: vi.fn(),
    setSelection: vi.fn(),
    splitNodes: vi.fn(),
    unsetNodes: vi.fn(),
    unwrapNodes: vi.fn(),
    wrapNodes: vi.fn(),
    transform: vi.fn(),
  };

  const Node = {
    ancestor: vi.fn(() => ({ children: [] })),
    ancestors: vi.fn(function* () {}),
    child: vi.fn(() => ({ text: '' })),
    children: vi.fn(function* () {}),
    common: vi.fn(() => [[{ children: [] }], [0]]),
    descendant: vi.fn(() => ({ text: '' })),
    descendants: vi.fn(function* () {}),
    elements: vi.fn(function* () {}),
    first: vi.fn(() => [{ text: '' }, [0]]),
    fragment: vi.fn(() => []),
    get: vi.fn(() => ({ text: '' })),
    has: vi.fn(() => false),
    isNode: vi.fn(() => false),
    isNodeList: vi.fn(() => false),
    last: vi.fn(() => [{ text: '' }, [0]]),
    leaf: vi.fn(() => [{ text: '' }, [0]]),
    levels: vi.fn(function* () {}),
    matches: vi.fn(() => false),
    nodes: vi.fn(function* () {}),
    parent: vi.fn(() => [{ children: [] }, [0]]),
    string: vi.fn(() => ''),
    texts: vi.fn(function* () {}),
  };

  const Element = {
    isElement: vi.fn(() => false),
    isElementList: vi.fn(() => false),
    isElementType: vi.fn(() => false),
    isElementProps: vi.fn(() => false),
    matches: vi.fn(() => false),
  };

  const Text = {
    isText: vi.fn(() => false),
    isTextList: vi.fn(() => false),
    isTextProps: vi.fn(() => false),
    matches: vi.fn(() => false),
    equals: vi.fn(() => false),
    decorations: vi.fn(() => []),
  };

  const Path = {
    ancestors: vi.fn(() => []),
    common: vi.fn(() => []),
    compare: vi.fn(() => 0),
    endsAfter: vi.fn(() => false),
    endsAt: vi.fn(() => false),
    endsBefore: vi.fn(() => false),
    equals: vi.fn(() => false),
    hasPrevious: vi.fn(() => false),
    isAfter: vi.fn(() => false),
    isAncestor: vi.fn(() => false),
    isBefore: vi.fn(() => false),
    isChild: vi.fn(() => false),
    isCommon: vi.fn(() => false),
    isDescendant: vi.fn(() => false),
    isParent: vi.fn(() => false),
    isPath: vi.fn(() => false),
    isSibling: vi.fn(() => false),
    levels: vi.fn(() => []),
    next: vi.fn(() => []),
    operationCanTransformPath: vi.fn(() => true),
    parent: vi.fn(() => []),
    previous: vi.fn(() => []),
    relative: vi.fn(() => []),
    transform: vi.fn(),
  };

  const Range = {
    edges: vi.fn(() => [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 0 },
    ]),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    equals: vi.fn(() => false),
    includes: vi.fn(() => false),
    intersection: vi.fn(),
    isBackward: vi.fn(() => false),
    isCollapsed: vi.fn(() => true),
    isExpanded: vi.fn(() => false),
    isForward: vi.fn(() => true),
    isRange: vi.fn(() => false),
    points: vi.fn(function* () {}),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    transform: vi.fn(),
  };

  const Point = {
    compare: vi.fn(() => 0),
    equals: vi.fn(() => false),
    isAfter: vi.fn(() => false),
    isBefore: vi.fn(() => false),
    isPoint: vi.fn(() => false),
    transform: vi.fn(),
  };

  const Operation = {
    inverse: vi.fn(() => ({})),
    isOperation: vi.fn(() => false),
    isOperationList: vi.fn(() => false),
  };

  return {
    createEditor,
    Editor,
    Transforms,
    Node,
    Element,
    Text,
    Path,
    Range,
    Point,
    Operation,
    BaseEditor: {},
    BaseElement: {},
    BaseRange: {},
    BaseSelection: null,
    Selection: null,
    Location: {},
    NodeEntry: {},
  };
});

// ---------------------------------------------------------------------------
// slate-react
// ---------------------------------------------------------------------------
vi.mock('slate-react', () => {
  const SlateComp = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  const EditableComp = React.forwardRef((props: any, ref: any) =>
    React.createElement('div', {
      ref,
      'data-testid': 'slate-editable',
      contentEditable: true,
      suppressContentEditableWarning: true,
      ...props,
    }),
  );
  EditableComp.displayName = 'Editable';

  return {
    Slate: SlateComp,
    Editable: EditableComp,
    withReact: vi.fn((editor: unknown) => editor),
    useSlate: vi.fn(() => mockSlateEditor),
    useSlateStatic: vi.fn(() => mockSlateEditor),
    useSlateSelection: vi.fn(() => null),
    useFocused: vi.fn(() => false),
    useSelected: vi.fn(() => false),
    useReadOnly: vi.fn(() => false),
    ReactEditor: {
      blur: vi.fn(),
      deselect: vi.fn(),
      findEventRange: vi.fn(),
      findKey: vi.fn(() => ({ id: '0' })),
      findPath: vi.fn(() => [0]),
      findNode: vi.fn(() => ({ children: [] })),
      focus: vi.fn(),
      hasDOMNode: vi.fn(() => false),
      hasRange: vi.fn(() => false),
      insertData: vi.fn(),
      isComposing: vi.fn(() => false),
      isFocused: vi.fn(() => false),
      isReadOnly: vi.fn(() => false),
      setFragmentData: vi.fn(),
      toDOMNode: vi.fn(() => document.createElement('div')),
      toDOMPoint: vi.fn(() => [document.createTextNode(''), 0]),
      toDOMRange: vi.fn(() => document.createRange()),
      toSlateNode: vi.fn(() => ({ text: '' })),
      toSlatePoint: vi.fn(() => ({ path: [0, 0], offset: 0 })),
      toSlateRange: vi.fn(() => ({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      })),
    },
    RenderElementProps: {},
    RenderLeafProps: {},
  };
});

// ---------------------------------------------------------------------------
// slate-history
// ---------------------------------------------------------------------------
vi.mock('slate-history', () => ({
  withHistory: vi.fn((editor: unknown) => editor),
  HistoryEditor: {
    isHistoryEditor: vi.fn(() => false),
    isMerging: vi.fn(() => false),
    isSaving: vi.fn(() => false),
    redo: vi.fn(),
    undo: vi.fn(),
    withMerging: vi.fn((_editor: unknown, fn: () => void) => fn()),
    withoutMerging: vi.fn((_editor: unknown, fn: () => void) => fn()),
    withoutSaving: vi.fn((_editor: unknown, fn: () => void) => fn()),
  },
  History: {
    isHistory: vi.fn(() => false),
  },
}));
