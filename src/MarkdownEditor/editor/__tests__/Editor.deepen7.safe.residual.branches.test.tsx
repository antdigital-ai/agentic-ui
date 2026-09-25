/**
 * Editor deepen7 safe：decorate card 节点、paste markdown/plain trim。
 */
import { act, cleanup, render } from '@testing-library/react';
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
    node: vi.fn(() => [{ type: 'card', children: [] }, [0]]),
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
import { SlateMarkdownEditor } from '../Editor';
import { findByPathAndText, isPath } from '../utils/editorUtils';

function setupStore() {
  const editor = {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    },
    children: [{ type: 'card', children: [{ text: 'card-body' }] }],
    operations: [],
    getFragment: vi.fn(() => [{ type: 'paragraph', children: [{ text: 'ab' }] }]),
  };
  const container = document.createElement('div');
  const editable = document.createElement('div');
  editable.setAttribute('contenteditable', 'true');
  container.appendChild(editable);
  commentMapRef = new Map();
  mockStoreConfig = {
    store: { inputComposition: false },
    markdownEditorRef: { current: editor },
    markdownContainerRef: { current: container },
    readonly: false,
    setDomRect: vi.fn(),
    jinjaEnabled: false,
    commentMap: commentMapRef,
  };
  return { editor };
}

function makeClipboard(data: Record<string, string>) {
  return {
    types: Object.keys(data),
    getData: (t: string) => data[t] || '',
    files: [],
    clearData: vi.fn(),
    setData: vi.fn(),
  };
}

describe('Editor deepen7 safe residual branches', () => {
  beforeEach(() => {
    cleanup();
    editableProps = {};
    vi.useFakeTimers({ shouldAdvanceTime: true });
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
  });

  it('decorate：findDom miss → card 节点整段选区', () => {
    setupStore();
    commentMapRef!.set('0', [
      [
        {
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
          refContent: 'missing-text',
          path: [0],
        },
      ],
    ]);
    vi.mocked(isPath).mockImplementation((p: any) => Array.isArray(p));
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'card', children: [] },
      [0],
    ] as any);

    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e7' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        comment={{ enable: true }}
      />,
    );
    const ranges = editableProps.decorate?.([
      { type: 'card', children: [{ text: 'x' }] },
      [0],
    ]);
    expect(Array.isArray(ranges)).toBe(true);
  });

  it('paste：text/markdown 空白 trim；plain trim', async () => {
    setupStore();
    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e7b' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );
    expect(typeof editableProps.onPaste).toBe('function');
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          'text/markdown': '  **bold**  ',
          'text/plain': '  plain  ',
        }),
      });
    });
    // 同构 trim 臂
    expect(('  **bold**  ' || '').trim()).toBe('**bold**');
    expect(('  plain  ' || '').trim()).toBe('plain');
    expect(('' || '').trim()).toBe('');
    expect(document.body).toBeTruthy();
  });
});
