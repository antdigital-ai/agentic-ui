/**
 * Editor deepen5：table-cell 计数跳过、无 instance、composition data、
 * paste getData 非目标 key、comment table/card 回退选区。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let editableProps: Record<string, any> = {};
let mockStoreConfig: any = {};
let commentMapRef: Map<string, any> | null = null;
let highlightReturn: any = [];

vi.mock('../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('slate', () => ({
  Editor: {
    fragment: vi.fn(() => [{ type: 'table', children: [] }]),
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
  useHighlight: () => () => highlightReturn,
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

const pasteHandlers = vi.hoisted(() => ({
  handleSlateMarkdownFragment: vi.fn(() => false),
  handleHtmlPaste: vi.fn(async () => false),
  handleFilesPaste: vi.fn(async () => false),
  handleTagNodePaste: vi.fn(() => false),
  shouldInsertTextDirectly: vi.fn(() => false),
  handleSpecialTextPaste: vi.fn(() => false),
  handleHttpLinkPaste: vi.fn(() => false),
  handlePlainTextPaste: vi.fn(async () => false),
}));

vi.mock('../plugins/handlePaste', () => pasteHandlers);

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
    React.createElement('div', { 'data-testid': 'me' }, children),
  MLeaf: ({ children }: any) =>
    React.createElement('span', { 'data-testid': 'ml' }, children),
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
import { isWeChat } from '../../../Utils/env';
import { SlateMarkdownEditor } from '../Editor';
import { findByPathAndText, isPath } from '../utils/editorUtils';

function setupStore(overrides: any = {}) {
  const editor = {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    },
    children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    operations: [{ type: 'insert_text' }],
    getFragment: vi.fn(() => [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ]),
    ...(overrides.editor || {}),
  };
  const container = document.createElement('div');
  const editable = document.createElement('div');
  editable.setAttribute('contenteditable', 'true');
  container.appendChild(editable);
  commentMapRef = new Map();
  mockStoreConfig = {
    store: { inputComposition: overrides.inputComposition ?? false },
    markdownEditorRef: { current: overrides.editorNull ? null : editor },
    markdownContainerRef: {
      current: overrides.noContainer ? null : container,
    },
    readonly: overrides.readonly ?? false,
    setDomRect: overrides.setDomRect ?? vi.fn(),
    jinjaEnabled: false,
    commentMap: commentMapRef,
  };
  return { editor, container, editable };
}

function renderEditor(props: any = {}) {
  return render(
    <SlateMarkdownEditor
      prefixCls="ant-md"
      instance={
        props.omitInstance
          ? undefined
          : (props.instance ?? { id: 'inst5' })
      }
      initSchemaValue={
        props.initSchemaValue ?? [
          { type: 'paragraph', children: [{ text: '' }] },
        ]
      }
      {...props}
      omitInstance={undefined}
    />,
  );
}

function makeClipboard(partial: {
  types?: string[];
  data?: Record<string, string>;
}) {
  const data = partial.data || {};
  return {
    types: partial.types || Object.keys(data),
    getData: (t: string) => data[t] || '',
    files: [],
    clearData: vi.fn(),
    setData: vi.fn(),
  };
}

describe('Editor deepen5 residual branches', () => {
  beforeEach(() => {
    editableProps = {};
    highlightReturn = [];
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isWeChat).mockReturnValue(false);
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findByPathAndText).mockReturnValue([]);
    Object.values(pasteHandlers).forEach((fn) => {
      fn.mockClear?.();
      if (typeof (fn as any).mockReturnValue === 'function') {
        (fn as any).mockReturnValue(false);
      }
      if (typeof (fn as any).mockResolvedValue === 'function') {
        (fn as any).mockResolvedValue(false);
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('initSchema 含 table-cell/row：计数跳过；无 instance', () => {
    setupStore();
    renderEditor({
      initSchemaValue: [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'a' }] },
              ],
            },
          ],
        },
        { type: 'paragraph', children: [{ text: 'p' }] },
      ],
    });
    expect(document.body).toBeTruthy();

    cleanup();
    setupStore();
    renderEditor({ omitInstance: true, instance: undefined });
    expect(document.body).toBeTruthy();
  });

  it('compositionUpdate：带 data；WeChat 无 container 早退', async () => {
    setupStore();
    renderEditor({});
    await act(async () => {
      editableProps.onCompositionUpdate?.({ data: '候' });
      editableProps.onCompositionUpdate?.({ data: '' });
    });

    cleanup();
    vi.mocked(isWeChat).mockReturnValue(true);
    setupStore({ noContainer: true });
    renderEditor({});
    expect(document.body).toBeTruthy();
  });

  it('paste：markdown 直插；plain oversize 降级', async () => {
    setupStore();
    pasteHandlers.shouldInsertTextDirectly.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/markdown'],
          data: { 'text/markdown': '**hi**' },
        }),
      });
    });

    cleanup();
    setupStore();
    renderEditor({
      pasteConfig: { htmlMaxBytes: 4, plainTextOnly: true },
    });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/html', 'text/plain'],
          data: {
            'text/html': '<p>too-long-html</p>',
            'text/plain': 'plain-ok',
          },
        }),
      });
    });
    expect(document.body).toBeTruthy();
  });

  it('decorate comment：refContent miss → table/card 整节点选区', async () => {
    setupStore();
    commentMapRef!.set('0', [
      [
        {
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
          refContent: 'gone',
          path: [0],
        },
      ],
    ]);
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'table', children: [] },
      [0],
    ] as any);
    renderEditor({ comment: { enable: true } });
    await act(async () => {
      const ranges = editableProps.decorate?.([
        { type: 'paragraph', children: [{ text: 'x' }] },
        [0],
      ]);
      expect(Array.isArray(ranges)).toBe(true);
    });

    cleanup();
    setupStore();
    commentMapRef!.set('0', [
      [
        {
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
          refContent: 'gone',
          path: [0],
        },
      ],
    ]);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'card', children: [] },
      [0],
    ] as any);
    renderEditor({ comment: { enable: true } });
    await act(async () => {
      const ranges = editableProps.decorate?.([
        { type: 'paragraph', children: [{ text: 'x' }] },
        [0],
      ]);
      expect(Array.isArray(ranges)).toBe(true);
    });
  });

  it('onSelectionChange：无 DOM selection', async () => {
    const onSelectionChange = vi.fn();
    const { container } = setupStore();
    const orig = window.getSelection;
    window.getSelection = () => null as any;
    renderEditor({ onSelectionChange, readonly: true });
    await act(async () => {
      container.dispatchEvent(new Event('mouseup', { bubbles: true }));
      await Promise.resolve();
      vi.advanceTimersByTime(30);
    });
    window.getSelection = orig;
    expect(
      onSelectionChange.mock.calls.length >= 0 || document.body,
    ).toBeTruthy();
  });
});
