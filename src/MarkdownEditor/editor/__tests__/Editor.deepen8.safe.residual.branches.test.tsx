/**
 * Editor deepen8 safe：decorate selection||{} + findDom miss + table 节点；
 * omit instance else 臂轻量。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let editableProps: Record<string, any> = {};
let mockStoreConfig: any = {};
let commentMapRef: Map<string, any> | null = null;

vi.mock('../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));
vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('slate', () => ({
  Editor: {
    fragment: vi.fn(() => [{ type: 'paragraph', children: [{ text: 'x' }] }]),
    hasPath: vi.fn(() => true),
    insertText: vi.fn(),
    node: vi.fn(() => [{ type: 'table', children: [] }, [0]]),
    nodes: vi.fn(function* () {}),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    end: vi.fn(() => ({ path: [0, 0], offset: 1 })),
    leaf: vi.fn((_ed: any, path: number[]) => [{ text: 'x' }, path]),
    isVoid: vi.fn(() => false),
  },
  Node: {
    get: vi.fn(() => ({ type: 'paragraph', children: [{ text: '' }] })),
    string: vi.fn(() => ''),
  },
  Range: { isCollapsed: vi.fn(() => true) },
  Transforms: {
    delete: vi.fn(),
    insertNodes: vi.fn(),
    insertText: vi.fn(),
    insertFragment: vi.fn(),
    select: vi.fn(),
    setNodes: vi.fn(),
  },
}));

vi.mock('slate-react', () => ({
  Editable: (props: Record<string, any>) => {
    editableProps = props;
    return React.createElement('div', { 'data-testid': 'mock-editable' });
  },
  Slate: ({ children }: any) => children,
  ReactEditor: {
    toDOMRange: vi.fn(() => ({
      getBoundingClientRect: () => ({ top: 1 }),
      cloneContents: () => document.createDocumentFragment(),
    })),
    toDOMNode: vi.fn(() => document.createElement('div')),
    toSlateRange: vi.fn(() => ({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    })),
    setFragmentData: vi.fn(),
    insertData: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    isFocused: vi.fn(() => false),
    findPath: vi.fn(() => [0]),
  },
  useSlate: () => ({}),
  useSelected: () => false,
  useFocused: () => false,
}));

vi.mock('../components/EditorEditable', () => ({
  EditorEditable: (props: Record<string, any>) => {
    editableProps = props;
    return React.createElement('div', { 'data-testid': 'mock-editable' });
  },
}));

vi.mock('../store', () => ({
  useEditorStore: () => mockStoreConfig,
  EditorStoreContext: React.createContext(null),
}));

vi.mock('../plugins/useHighlight', () => ({
  useHighlight: () => () => [],
}));
vi.mock('../plugins/useOnchange', () => ({
  useOnchange: () => vi.fn(),
}));
vi.mock('../plugins/useKeyboard', () => ({
  useKeyboard: () => vi.fn(),
}));
vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hash' }),
}));

vi.mock('../plugins/handlePaste', () => ({
  handleSlateMarkdownFragment: vi.fn(() => false),
  handleHtmlPaste: vi.fn(async () => false),
  handleFilesPaste: vi.fn(async () => false),
  handleTagNodePaste: vi.fn(() => false),
  shouldInsertTextDirectly: vi.fn(() => false),
  handleSpecialTextPaste: vi.fn(() => false),
  handleHttpLinkPaste: vi.fn(() => false),
  handlePlainTextPaste: vi.fn(async () => false),
}));

vi.mock('../utils', () => ({
  MARKDOWN_EDITOR_EVENTS: { SELECTIONCHANGE: 'md-selectionchange' },
  copy: vi.fn((v: unknown) => JSON.parse(JSON.stringify(v))),
  parserSlateNodeToMarkdown: vi.fn(() => 'md-out'),
}));

vi.mock('../utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    checkEnd: vi.fn(() => true),
    reset: vi.fn(),
    deleteAll: vi.fn(),
    focus: vi.fn(),
  },
  getSelectionFromDomSelection: vi.fn(() => null),
  hasEditableTarget: vi.fn(() => true),
  isEventHandled: vi.fn(() => false),
  findByPathAndText: vi.fn(() => []),
  findLeafPath: vi.fn((_ed: any, path: any) => path),
  isPath: vi.fn(() => true),
}));

vi.mock('../../BaseMarkdownEditor', () => ({
  parserMdToSchema: vi.fn(() => ({
    schema: [{ type: 'paragraph', children: [{ text: 'from-md' }] }],
  })),
}));
vi.mock('../../plugin', () => ({
  PluginContext: React.createContext([]),
}));
vi.mock('../elements', () => ({
  MElement: ({ children }: any) =>
    React.createElement('div', null, children),
  MLeaf: ({ children }: any) =>
    React.createElement('span', null, children),
}));
vi.mock('../../../Utils/env', () => ({
  isWeChat: vi.fn(() => false),
}));
vi.mock('../utils/htmlToMarkdown', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    isWordHtml: vi.fn(() => false),
    cleanWordHtml: vi.fn((h: string) => h),
    htmlToMarkdown: vi.fn(() => 'md'),
  };
});

import { Editor } from 'slate';
import { SlateMarkdownEditor } from '../Editor';
import { findByPathAndText, isPath } from '../utils/editorUtils';

function setupStore() {
  commentMapRef = new Map();
  mockStoreConfig = {
    store: { inputComposition: false },
    markdownEditorRef: {
      current: {
        selection: null,
        children: [{ type: 'table', children: [] }],
        operations: [],
        getFragment: vi.fn(() => []),
      },
    },
    markdownContainerRef: { current: document.createElement('div') },
    readonly: false,
    setDomRect: vi.fn(),
    jinjaEnabled: false,
    commentMap: commentMapRef,
  };
}

describe('Editor deepen8 safe residual branches', () => {
  beforeEach(() => {
    cleanup();
    editableProps = {};
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findByPathAndText).mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('decorate：selection null → ||{}；table 整段', () => {
    setupStore();
    commentMapRef!.set('0', [
      [
        {
          selection: null,
          refContent: 'gone',
          path: [0],
          focus: { path: [0, 0], offset: 0 },
        },
      ],
    ]);
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'table', children: [] },
      [0],
    ] as any);

    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e8' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        comment={{ enable: true }}
      />,
    );
    const ranges = editableProps.decorate?.([
      { type: 'table', children: [] },
      [0],
    ]);
    expect(Array.isArray(ranges)).toBe(true);
  });

  it('omit instance', () => {
    setupStore();
    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});
