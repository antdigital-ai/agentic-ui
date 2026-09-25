/**
 * Editor.tsx 核心 deepen：SSR 选区、WeChat focus、commentMap 合并、clipboard 边界。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let editableProps: Record<string, any> = {};
let slateOnChange: ((v: any[]) => void) | null = null;
let mockStoreConfig: any = {};

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
    slateOnChange = onChange;
    return children;
  },
  Editable: (props: Record<string, any>) => {
    editableProps = props;
    return React.createElement('div', { 'data-testid': 'mock-editable' });
  },
  ReactEditor: {
    toDOMRange: vi.fn(() => ({
      getBoundingClientRect: () => undefined,
      cloneContents: () => document.createDocumentFragment(),
    })),
    toDOMNode: vi.fn(() => {
      const el = document.createElement('div');
      el.innerHTML = '<input data-tag-popup-input />';
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
  useHighlight: () => () => [
    { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 1 } },
  ],
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
    checkEnd: vi.fn(() => false),
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
  parserMdToSchema: vi.fn(() => ({ schema: [] })),
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

import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { isWeChat } from '../../../Utils/env';
import { SlateMarkdownEditor } from '../Editor';
import {
  getSelectionFromDomSelection,
  hasEditableTarget,
} from '../utils/editorUtils';

function createMockEditor(overrides: any = {}) {
  return {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    },
    children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    operations: [{ type: 'insert_text' }],
    getFragment: vi.fn(() => [{ type: 'paragraph', children: [{ text: 'ab' }] }]),
    ...overrides,
  };
}

function setupStore(overrides: any = {}) {
  const editor = createMockEditor(overrides.editor);
  const container = document.createElement('div');
  mockStoreConfig = {
    store: { inputComposition: false },
    markdownEditorRef: { current: editor },
    markdownContainerRef: { current: container },
    readonly: overrides.readonly ?? false,
    setDomRect: overrides.setDomRect ?? vi.fn(),
    jinjaEnabled: false,
  };
  return { editor, container, setDomRect: mockStoreConfig.setDomRect };
}

function renderEditor(props: any = {}) {
  return render(
    <SlateMarkdownEditor
      prefixCls="ant-md"
      instance={props.instance ?? { id: 'inst' }}
      initSchemaValue={
        props.initSchemaValue ?? [{ type: 'paragraph', children: [{ text: '' }] }]
      }
      {...props}
    />,
  );
}

describe('Editor core deepen branches', () => {
  beforeEach(() => {
    editableProps = {};
    slateOnChange = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isWeChat).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    if (!globalThis.window) {
      globalThis.window = document.defaultView as Window & typeof globalThis;
    }
  });

  it('commentMap 同 path 同 selection 追加到已有 childrenMap', () => {
    setupStore({ readonly: false });
    const sameSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    renderEditor({
      comment: {
        enable: true,
        commentList: [
          { id: 'a', path: [0], selection: sameSelection },
          { id: 'b', path: [0], selection: sameSelection },
        ],
      },
    });

    const ranges = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'ab' }] },
      [0],
    ]);
    expect(ranges.some((r: any) => r.comment === true)).toBe(true);
  });

  it('readonly SSR window undefined 时跳过 DOM 选区同步', async () => {
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect: vi.fn() });
    renderEditor({
      reportMode: true,
      onSelectionChange,
      floatBar: { enable: true },
    });

    const savedWindow = globalThis.window;
    // @ts-expect-error simulate SSR only during selection handler
    delete globalThis.window;
    try {
      await act(async () => {
        editableProps.onSelect({});
      });
      expect(onSelectionChange).not.toHaveBeenCalled();
    } finally {
      globalThis.window = savedWindow;
    }
  });

  it('copy 无 selection 时不 preventDefault', () => {
    setupStore({ readonly: false });
    mockStoreConfig.markdownEditorRef.current.selection = null;

    renderEditor({});
    const preventDefault = vi.fn();
    editableProps.onCopy({
      preventDefault,
      clipboardData: { clearData: vi.fn(), setData: vi.fn(), getData: () => '' },
      target: document.createElement('div'),
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('cut 无 domSelection 时早退', () => {
    setupStore({ readonly: false });
    vi.spyOn(window, 'getSelection').mockReturnValue(null);
    mockStoreConfig.markdownEditorRef.current.selection = null;

    renderEditor({});
    const preventDefault = vi.fn();
    editableProps.onCut({
      preventDefault,
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('readonly 展开选区 setDomRect 接收 undefined rect', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });
    vi.mocked(getSelectionFromDomSelection).mockReturnValue({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    } as any);
    vi.mocked(Range.isCollapsed).mockReturnValue(false);

    renderEditor({ reportMode: true, onSelectionChange: vi.fn() });
    await act(async () => {
      editableProps.onSelect({});
    });

    expect(setDomRect).toHaveBeenCalledWith(null);
  });

  it('onSlateChange 触发 emitFootnoteDefinitionChange', () => {
    const onFootnoteDefinitionChange = vi.fn();
    const { editor } = setupStore({ readonly: false });
    renderEditor({ fncProps: { onFootnoteDefinitionChange } });

    editor.operations = [{ type: 'insert_text' }];
    act(() => {
      slateOnChange!([
        {
          type: 'footnoteDefinition',
          identifier: '1',
          children: [{ text: 'fn' }],
        },
      ]);
    });

    expect(onFootnoteDefinitionChange).toHaveBeenCalled();
  });

  it('WeChat compositionupdate 无 data-composition 时激活组合态', () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    renderEditor({ onCompositionActiveChange: vi.fn() });

    expect(container.hasAttribute('data-composition')).toBe(false);
    act(() => {
      editableProps.onCompositionUpdate?.({ data: '你' } as any);
    });
    expect(container.hasAttribute('data-composition')).toBe(true);
  });

  it('WeChat 原生 input 非 composing 时结束组合态', () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    mockStoreConfig.store.inputComposition = true;
    renderEditor({});

    act(() => {
      container.dispatchEvent(
        new InputEvent('input', { bubbles: true, cancelable: true }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(mockStoreConfig.store.inputComposition).toBe(false);
  });

  it('clipboard copy getFragment 假值时使用空 fragment', () => {
    const { editor } = setupStore({ readonly: false });
    editor.getFragment = () => undefined as any;
    renderEditor({});

    editableProps.onCopy({
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
        getData: () => '',
      },
    });

    expect(ReactEditor.setFragmentData).toHaveBeenCalled();
  });
});
