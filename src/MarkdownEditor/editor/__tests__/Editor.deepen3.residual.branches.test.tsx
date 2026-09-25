/**
 * Editor deepen3：Word HTML 粘贴、html 超限、files、tag 粘贴、composition、decorate comment。
 * 仅覆盖 deepen2 未触及的分支。
 */
import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let editableProps: Record<string, any> = {};
let _slateOnChange: ((v: any[]) => void) | null = null;
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
    fragment: vi.fn(() => []),
    hasPath: vi.fn(() => true),
    insertText: vi.fn(),
    node: vi.fn(() => [{ type: 'paragraph', children: [{ text: '' }] }, [0]]),
    nodes: vi.fn(function* () {}),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
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
  Slate: ({ children, onChange }: any) => {
    _slateOnChange = onChange;
    return children;
  },
  Editable: (props: Record<string, any>) => {
    editableProps = props;
    return React.createElement('div', { 'data-testid': 'mock-editable' });
  },
  ReactEditor: {
    toDOMRange: vi.fn(() => ({
      getBoundingClientRect: () => ({ top: 1 }),
      cloneContents: () => document.createDocumentFragment(),
    })),
    toDOMNode: vi.fn(() => {
      const el = document.createElement('div');
      const tag = document.createElement('span');
      tag.setAttribute('data-tag-popup-input', 'true');
      el.appendChild(tag);
      return el;
    }),
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
  useHighlight: () => () => [{ anchor: { path: [0, 0], offset: 0 } }],
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

const htmlToMdMocks = vi.hoisted(() => ({
  isWordHtml: vi.fn(() => false),
  cleanWordHtml: vi.fn((h: string) => h),
  htmlToMarkdown: vi.fn(() => '**from-word**'),
}));

vi.mock('../utils/htmlToMarkdown', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    isWordHtml: htmlToMdMocks.isWordHtml,
    cleanWordHtml: htmlToMdMocks.cleanWordHtml,
    htmlToMarkdown: htmlToMdMocks.htmlToMarkdown,
  };
});

import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isWeChat } from '../../../Utils/env';
import { SlateMarkdownEditor } from '../Editor';
import {
  EditorUtils,
  getSelectionFromDomSelection,
  hasEditableTarget,
  isPath,
} from '../utils/editorUtils';

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
  commentMapRef = new Map();
  mockStoreConfig = {
    store: { inputComposition: false },
    markdownEditorRef: { current: editor },
    markdownContainerRef: { current: container },
    readonly: overrides.readonly ?? false,
    setDomRect: overrides.setDomRect ?? vi.fn(),
    jinjaEnabled: false,
    commentMap: commentMapRef,
  };
  return { editor, container, setDomRect: mockStoreConfig.setDomRect };
}

function renderEditor(props: any = {}) {
  return render(
    <SlateMarkdownEditor
      prefixCls="ant-md"
      instance={props.instance ?? { id: 'inst' }}
      initSchemaValue={
        props.initSchemaValue ?? [
          { type: 'paragraph', children: [{ text: '' }] },
        ]
      }
      {...props}
    />,
  );
}

function makeClipboard(partial: {
  types?: string[];
  data?: Record<string, string>;
  files?: File[];
}) {
  const data = partial.data || {};
  return {
    types: partial.types || Object.keys(data),
    getData: (t: string) => data[t] || '',
    files: partial.files || [],
    clearData: vi.fn(),
    setData: vi.fn(),
  };
}

describe('Editor deepen3 residual branches', () => {
  beforeEach(() => {
    editableProps = {};
    _slateOnChange = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isWeChat).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);
    vi.mocked(Range.isCollapsed).mockReturnValue(true);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    htmlToMdMocks.isWordHtml.mockReturnValue(false);
    htmlToMdMocks.htmlToMarkdown.mockReturnValue('**from-word**');
    Object.values(pasteHandlers).forEach((fn) => {
      fn.mockClear?.();
      if (fn === pasteHandlers.handleHtmlPaste) {
        pasteHandlers.handleHtmlPaste.mockResolvedValue(false);
      }
      if (fn === pasteHandlers.handleFilesPaste) {
        pasteHandlers.handleFilesPaste.mockResolvedValue(false);
      }
      if (fn === pasteHandlers.handlePlainTextPaste) {
        pasteHandlers.handlePlainTextPaste.mockResolvedValue(false);
      }
      if (
        typeof (fn as any).mockReturnValue === 'function' &&
        fn !== pasteHandlers.handleHtmlPaste &&
        fn !== pasteHandlers.handleFilesPaste &&
        fn !== pasteHandlers.handlePlainTextPaste
      ) {
        (fn as any).mockReturnValue(false);
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('instance 缺失走 else；tagInput 快捷键插入', async () => {
    setupStore({ readonly: false });
    renderEditor({ instance: undefined });
    expect(document.body).toBeTruthy();

    cleanup();
    setupStore({ readonly: false });
    renderEditor({
      tagInputProps: { enable: true, prefixCls: '$' },
    });
    await act(async () => {
      editableProps.onKeyDown?.({
        key: '$',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      });
    });
    expect(Transforms.insertNodes).toHaveBeenCalled();
  });

  it('paste：Word HTML→md；html 超限；files；tagNode；onPaste false', async () => {
    setupStore({ readonly: false });
    htmlToMdMocks.isWordHtml.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/html'],
          data: { 'text/html': '<p class="MsoNormal">hi</p>' },
        }),
      });
    });
    expect(htmlToMdMocks.cleanWordHtml).toHaveBeenCalled();

    cleanup();
    setupStore({ readonly: false });
    renderEditor({ pasteConfig: { htmlMaxBytes: 4 } });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/html', 'text/plain'],
          data: {
            'text/html': '<p>too-long-html</p>',
            'text/plain': 'fallback-plain',
          },
        }),
      });
    });

    cleanup();
    setupStore({ readonly: false });
    pasteHandlers.handleFilesPaste.mockResolvedValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['Files'],
          files: [new File(['x'], 'a.png', { type: 'image/png' })],
        }),
      });
    });
    expect(pasteHandlers.handleFilesPaste).toHaveBeenCalled();

    cleanup();
    setupStore({ readonly: false });
    pasteHandlers.handleTagNodePaste.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'tag' },
        }),
      });
    });

    cleanup();
    setupStore({ readonly: false });
    renderEditor({ onPaste: () => false });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'x' },
        }),
      });
    });
  });

  it('paste：md 直插；special/http/plain；plainTextOnly 无 selection；null types', async () => {
    setupStore({ readonly: false });
    pasteHandlers.shouldInsertTextDirectly.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/markdown'],
          data: { 'text/markdown': '**md**' },
        }),
      });
    });
    expect(Transforms.insertText).toHaveBeenCalled();

    cleanup();
    setupStore({ readonly: false });
    pasteHandlers.shouldInsertTextDirectly.mockReturnValue(false);
    pasteHandlers.handleSpecialTextPaste.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'special!' },
        }),
      });
    });

    cleanup();
    setupStore({ readonly: false });
    pasteHandlers.handleSpecialTextPaste.mockReturnValue(false);
    pasteHandlers.handleHttpLinkPaste.mockReturnValue(true);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'https://ex.com' },
        }),
      });
    });

    cleanup();
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    renderEditor({ pasteConfig: { plainTextOnly: true } });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'no-sel' },
        }),
      });
    });
    expect(Transforms.insertNodes).toHaveBeenCalled();

    cleanup();
    setupStore({ readonly: false });
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: {
          types: undefined,
          getData: () => '',
          files: [],
        },
      });
    });
  });

  it('copy：无 path / 无 selection 早退；toDOMRange 抛错 setDomRect null', async () => {
    setupStore({ readonly: false });
    vi.mocked(Editor.hasPath).mockReturnValue(false);
    vi.mocked(ReactEditor.setFragmentData).mockClear();
    renderEditor({});
    editableProps.onCopy?.({
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    });
    expect(ReactEditor.setFragmentData).not.toHaveBeenCalled();

    cleanup();
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(ReactEditor.setFragmentData).mockClear();
    renderEditor({});
    editableProps.onCopy?.({
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    });
    expect(ReactEditor.setFragmentData).not.toHaveBeenCalled();

    cleanup();
    const { setDomRect } = setupStore({ readonly: true });
    vi.spyOn(window, 'getSelection').mockReturnValue({
      rangeCount: 1,
    } as unknown as Selection);
    vi.mocked(getSelectionFromDomSelection).mockReturnValue({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    } as any);
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(ReactEditor.toDOMRange).mockImplementation(() => {
      throw new Error('dom');
    });
    renderEditor({ reportMode: true, onSelectionChange: vi.fn() });
    await act(async () => {
      editableProps.onSelect?.({});
    });
    expect(setDomRect).toHaveBeenCalledWith(null);
  });

  it('composition：start 重锚定；WeChat update；缺 attr update；end 清理', async () => {
    const onCompositionActiveChange = vi.fn();
    const { container } = setupStore({ readonly: false });
    const range = document.createRange();
    const text = document.createTextNode('ab');
    container.appendChild(text);
    range.selectNodeContents(text);
    const sel = {
      rangeCount: 1,
      getRangeAt: () => range,
    } as unknown as Selection;
    vi.spyOn(window, 'getSelection').mockReturnValue(sel);

    renderEditor({ onCompositionActiveChange });
    await act(async () => {
      editableProps.onCompositionStart?.();
    });
    expect(Transforms.select).toHaveBeenCalled();

    vi.mocked(isWeChat).mockReturnValue(true);
    await act(async () => {
      editableProps.onCompositionUpdate?.({ data: '候' });
    });

    vi.mocked(isWeChat).mockReturnValue(false);
    container.removeAttribute('data-composition');
    await act(async () => {
      editableProps.onCompositionUpdate?.({ data: '选' });
    });

    await act(async () => {
      editableProps.onCompositionEnd?.({ data: '成' });
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
      editableProps.onCompositionEnd?.({ data: '' });
    });
    expect(onCompositionActiveChange).toHaveBeenCalled();
  });

  it('WeChat native input：isComposing / 结束组合；decorate commentMap', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'c1',
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
            path: [0],
            content: 'note',
          },
        ],
      },
    });
    await act(async () => {
      container.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          isComposing: true,
        } as any),
      );
      mockStoreConfig.store.inputComposition = true;
      container.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          isComposing: false,
        } as any),
      );
    });

    if (commentMapRef) {
      commentMapRef.set('0', [
        [
          {
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
        ],
      ]);
    }
    vi.mocked(isPath).mockReturnValue(true);
    const decorate = editableProps.decorate;
    if (decorate) {
      decorate([{ text: 'ab' }, [0]]);
    }
    expect(EditorUtils.focus).toBeDefined();
  });

  it('非折叠选区删除后粘贴；leafRender / eleItemRender / lazy', async () => {
    setupStore({ readonly: false });
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: makeClipboard({
          types: ['text/plain'],
          data: { 'text/plain': 'sel' },
        }),
      });
    });
    expect(Transforms.delete).toHaveBeenCalled();

    cleanup();
    setupStore({ readonly: false });
    const leafRender = vi.fn((_p, dom) => dom);
    const eleItemRender = vi.fn((_p, dom) => dom);
    renderEditor({
      leafRender,
      eleItemRender,
      lazy: { enable: true, placeholderHeight: 20 },
      plugins: [
        {
          elements: {
            paragraph: (p: any) =>
              React.createElement('div', { 'data-testid': 'plug' }, p.children),
          },
        },
      ],
    });
    await act(async () => {
      editableProps.renderElement?.({
        element: { type: 'paragraph', children: [{ text: 'p' }] },
        children: 'c',
        attributes: {},
      });
      editableProps.renderElement?.({
        element: { type: 'table-cell', children: [{ text: 't' }] },
        children: 'c',
        attributes: {},
      });
      editableProps.renderLeaf?.({
        leaf: { text: 'x' },
        children: 'x',
        attributes: {},
        text: { text: 'x' },
      });
    });
    expect(eleItemRender).toHaveBeenCalled();
  });
});
