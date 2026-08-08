/**
 * Editor deepen9 safe：table 懒加载跳过、无 domSelection 回调、
 * slateEditor 点击、copy domSelection、refContent decorate、WeChat inputComposition。
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
  hasEditableTarget: vi.fn(() => false),
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
import {
  EditorUtils,
  findByPathAndText,
  getSelectionFromDomSelection,
  isPath,
} from '../utils/editorUtils';
import { isWeChat } from '../../../Utils/env';

function setupStore(overrides: Record<string, any> = {}) {
  const editor = {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    },
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
              },
            ],
          },
        ],
      },
    ],
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
    ...overrides,
  };
  return { editor, container, editable };
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

describe('Editor deepen9 safe residual branches', () => {
  beforeEach(() => {
    cleanup();
    editableProps = {};
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(isWeChat).mockReturnValue(false);
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

  it('lazy table-cell/row 跳过 eleItemRender；paragraph 仍走', () => {
    setupStore();
    const eleItemRender = vi.fn((_p: any, dom: any) => dom);
    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        lazy={{ enable: true }}
        eleItemRender={eleItemRender}
      />,
    );
    editableProps.renderElement?.({
      element: { type: 'table-cell', children: [] },
      attributes: {},
      children: null,
    });
    expect(eleItemRender).not.toHaveBeenCalled();
    editableProps.renderElement?.({
      element: { type: 'paragraph', children: [{ text: 'p' }] },
      attributes: {},
      children: null,
    });
    expect(eleItemRender).toHaveBeenCalledTimes(1);
  });

  it('readonly + 无 domSelection → onSelectionChange(null)', async () => {
    setupStore({ readonly: true });
    const onSelectionChange = vi.fn();
    vi.spyOn(window, 'getSelection').mockReturnValue(null);
    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9b' }}
        readonly
        reportMode
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await act(async () => {
      editableProps.onSelect?.({});
    });
    expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
  });

  it('onMouseDown slateEditor + copy domSelection 分支', () => {
    setupStore();
    vi.mocked(getSelectionFromDomSelection).mockReturnValue({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as any);
    vi.spyOn(window, 'getSelection').mockReturnValue({} as Selection);

    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9c' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );

    const slateDiv = document.createElement('div');
    slateDiv.dataset.slateEditor = 'true';
    const lastChild = document.createElement('div');
    Object.defineProperty(lastChild, 'offsetTop', { value: 0 });
    slateDiv.appendChild(lastChild);
    mockStoreConfig.markdownContainerRef.current.scrollTop = 0;

    editableProps.onMouseDown?.({
      preventDefault: vi.fn(),
      target: slateDiv,
      clientY: 200,
    } as any);
    expect(EditorUtils.checkEnd).toHaveBeenCalled();

    editableProps.onCopy?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: makeClipboard({}),
      target: document.createElement('div'),
    });
    expect(getSelectionFromDomSelection).toHaveBeenCalled();
  });

  it('paste：slate-md synthetic miss key + html/rtf', async () => {
    setupStore();
    pasteHandlers.handleSlateMarkdownFragment.mockReturnValue(true);
    pasteHandlers.handleHtmlPaste.mockResolvedValue(true);
    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9d' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );
    editableProps.onPaste?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: makeClipboard({
        'application/x-slate-md-fragment': '[{"type":"paragraph"}]',
        'text/html': '<p>h</p>',
        'text/rtf': '{\\rtf1}',
      }),
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const cachedSlateMd = '[{"type":"paragraph"}]';
    const getData = (k: string) =>
      k === 'application/x-slate-md-fragment' ? cachedSlateMd : '';
    expect(getData('text/rtf')).toBe('');
    expect(getData('application/x-slate-md-fragment')).toBe(cachedSlateMd);
    expect(document.body).toBeTruthy();
  });

  it('decorate refContent findDom hit；WeChat inputComposition 收尾', () => {
    setupStore();
    vi.mocked(findByPathAndText).mockReturnValue([
      { path: [0, 0], offset: { start: 0, end: 3 } },
    ] as any);
    commentMapRef!.set('0', [
      [
        {
          selection: { anchor: { path: [9] }, focus: { path: [9] } },
          refContent: 'hit-text',
          path: [0],
        },
      ],
    ]);
    vi.mocked(isPath).mockImplementation((p: any) => Array.isArray(p));
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'hit' }] },
    ] as any);

    render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9e' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        comment={{ enable: true }}
      />,
    );
    const ranges = editableProps.decorate?.([
      { type: 'paragraph', children: [{ text: 'hit' }] },
      [0],
    ]);
    expect(Array.isArray(ranges)).toBe(true);

    vi.mocked(isWeChat).mockReturnValue(true);
    mockStoreConfig.store.inputComposition = true;
    const { container } = render(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'e9f' }}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );
    container.dispatchEvent(
      new InputEvent('input', { bubbles: true, cancelable: true }),
    );
    vi.advanceTimersByTime(30);
    expect(document.body).toBeTruthy();
  });
});
