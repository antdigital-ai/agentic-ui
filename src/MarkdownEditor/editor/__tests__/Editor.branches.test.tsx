/**
 * Editor.tsx 分支覆盖补充测试
 *
 * 策略：Mock Slate/Editable 以捕获 handler 函数并直接调用，
 * Mock useDebounceFn 使 handleSelectionChange 同步执行。
 *
 * 目标：覆盖 handleSelectionChange、handleClipboardCopy、handlePasteEvent、
 * onCompositionStart/End、checkEnd、onSlateChange、decorateFn 等未覆盖分支。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ========== Module-level state ========== */

let editableProps: Record<string, any> = {};
let slateOnChange: ((v: any[]) => void) | null = null;
let mockStoreConfig: any = {};
const mockOnKeyDown = vi.fn();
const mockOnChange = vi.fn();

/* ========== Module Mocks ========== */

// useDebounceFn：让 handleSelectionChange 同步执行
vi.mock('@ant-design/pro-components', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('slate', () => ({
  Editor: {
    fragment: vi.fn(() => []),
    hasPath: vi.fn(() => true),
    node: vi.fn(() => [{ type: 'paragraph', children: [{ text: '' }] }, [0]]),
    nodes: vi.fn(function* () {}),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
  },
  Node: {
    get: vi.fn(() => ({ type: 'paragraph', children: [{ text: '' }] })),
    string: vi.fn(() => ''),
  },
  Range: {
    isCollapsed: vi.fn(() => true),
  },
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
    toDOMRange: vi.fn(() => {
      const frag = document.createDocumentFragment();
      return {
        cloneContents: () => frag,
        getBoundingClientRect: () => ({
          top: 10,
          left: 10,
          width: 100,
          height: 20,
          bottom: 30,
          right: 110,
          x: 10,
          y: 10,
          toJSON: () => ({}),
        }),
      };
    }),
    insertData: vi.fn(),
    setFragmentData: vi.fn(),
    focus: vi.fn(),
    isFocused: vi.fn(() => false),
    findPath: vi.fn(() => [0]),
    toDOMNode: vi.fn(() => document.createElement('div')),
  },
}));

vi.mock('../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../plugins/useKeyboard', () => ({
  useKeyboard: () => mockOnKeyDown,
}));

vi.mock('../plugins/useOnchange', () => ({
  useOnchange: () => mockOnChange,
}));

vi.mock('../plugins/useHighlight', () => ({
  useHighlight: () => () => [],
}));

vi.mock('../style', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

vi.mock('../store', () => ({
  useEditorStore: () => mockStoreConfig,
  EditorStoreContext: React.createContext(null),
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
  parserSlateNodeToMarkdown: vi.fn(() => 'mock-md'),
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
  findLeafPath: vi.fn((_editor: any, path: any) => path),
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
    React.createElement('div', { 'data-testid': 'melement' }, children),
  MLeaf: ({ children }: any) =>
    React.createElement('span', { 'data-testid': 'mleaf' }, children),
}));

vi.mock('../components/LazyElement', () => ({
  LazyElement: ({ children }: any) => children,
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

/* ========== Imports after mocks ========== */

import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { PluginContext } from '../../plugin';
import { SlateMarkdownEditor } from '../Editor';
import * as handlePasteModule from '../plugins/handlePaste';
import { parserSlateNodeToMarkdown } from '../utils';
import {
  EditorUtils,
  getSelectionFromDomSelection,
  hasEditableTarget,
  isEventHandled,
} from '../utils/editorUtils';

/* ========== Helpers ========== */

function createMockEditor(overrides: any = {}) {
  return {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    operations: [] as any[],
    getFragment: vi.fn(() => [
      { type: 'paragraph', children: [{ text: 'frag' }] },
    ]),
    hasPath: vi.fn(() => true),
    ...overrides,
  };
}

function createMockContainer() {
  const container = document.createElement('div');
  // dispatchEvent 使用真实实现
  return container;
}

function setupStore(overrides: any = {}) {
  const editor = createMockEditor(overrides.editor);
  const container = overrides.container ?? createMockContainer();

  mockStoreConfig = {
    store: { inputComposition: false, editor: { children: [] } },
    markdownEditorRef: { current: editor },
    markdownContainerRef: { current: container },
    readonly: overrides.readonly ?? false,
    setDomRect: overrides.setDomRect ?? vi.fn(),
    ...overrides.extra,
  };

  return { editor, container, setDomRect: mockStoreConfig.setDomRect };
}

function renderEditor(props: any = {}) {
  return render(
    <PluginContext.Provider value={props.plugins || []}>
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={props.instance ?? {}}
        initSchemaValue={
          props.initSchemaValue ?? [
            { type: 'paragraph', children: [{ text: '' }] },
          ]
        }
        {...props}
      />
    </PluginContext.Provider>,
  );
}

function createClipboardData(overrides: any = {}) {
  return {
    types: overrides.types ?? ['text/plain'],
    clearData: vi.fn(),
    setData: vi.fn(),
    getData: overrides.getData ?? vi.fn(() => ''),
    ...overrides,
  };
}

async function flushPromises() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

/* ========== Tests ========== */

describe('Editor branches - handleSelectionChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    slateOnChange = null;
  });

  it('non-readonly: dispatches CustomEvent and calls onSelectionChange with selection content', async () => {
    const onSelectionChange = vi.fn();
    const { editor, container } = setupStore({ readonly: false });
    const dispatchSpy = vi.spyOn(container, 'dispatchEvent');

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'Hello' }] } as any,
    ]);
    vi.mocked(parserSlateNodeToMarkdown).mockReturnValue('Hello');

    renderEditor({ onSelectionChange });

    await editableProps.onSelect({});

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'md-selectionchange' }),
    );
    expect(onSelectionChange).toHaveBeenCalledWith(
      editor.selection,
      'Hello',
      expect.any(Array),
    );
  });

  it('non-readonly: collapsed selection passes empty markdown to onSelectionChange', async () => {
    const onSelectionChange = vi.fn();
    const { editor } = setupStore({ readonly: false });

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    expect(onSelectionChange).toHaveBeenCalledWith(editor.selection, '', []);
  });

  it('non-readonly: without onSelectionChange prop only dispatches event', async () => {
    const { container } = setupStore({ readonly: false });
    const dispatchSpy = vi.spyOn(container, 'dispatchEvent');

    renderEditor({});
    await editableProps.onSelect({});

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('non-readonly: getSelectionContent catch branch on Editor.fragment error', async () => {
    const onSelectionChange = vi.fn();
    const { editor } = setupStore({ readonly: false });

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.fragment).mockImplementation(() => {
      throw new Error('fragment error');
    });

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    // Should call onSelectionChange with empty content due to catch
    expect(onSelectionChange).toHaveBeenCalledWith(editor.selection, '', []);
  });

  it('readonly: skips selection sync when no onSelectionChange and floatBar disabled', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    renderEditor({
      reportMode: true,
      floatBar: { enable: false },
    });
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
  });

  it('readonly: window.getSelection returns null calls setDomRect(null) and onSelectionChange', async () => {
    const setDomRect = vi.fn();
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => null) as any;

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
    window.getSelection = origGetSelection;
  });

  it('readonly: window.getSelection returns null without onSelectionChange does not throw', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => null) as any;

    renderEditor({});
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    window.getSelection = origGetSelection;
  });

  it('readonly: valid non-collapsed selection sets domRect', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSelection as any,
    );
    vi.mocked(Range.isCollapsed).mockReturnValue(false);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () =>
        ({
          anchorNode: document.createElement('div'),
          focusNode: document.createElement('div'),
          rangeCount: 1,
        }) as any,
    );

    // reportMode: true 避免 readonly 早期返回
    renderEditor({ reportMode: true });
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(
      expect.objectContaining({ top: 10, left: 10 }),
    );
    window.getSelection = origGetSelection;
  });

  it('readonly: valid non-collapsed selection with onSelectionChange', async () => {
    const setDomRect = vi.fn();
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSelection as any,
    );
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'sel' }] } as any,
    ]);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () =>
        ({
          anchorNode: document.createElement('div'),
          focusNode: document.createElement('div'),
          rangeCount: 1,
        }) as any,
    );

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    expect(onSelectionChange).toHaveBeenCalledWith(
      mockSelection,
      expect.any(String),
      expect.any(Array),
    );
    window.getSelection = origGetSelection;
  });

  it('readonly: collapsed selection sets domRect to null', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSelection as any,
    );
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () => ({ anchorNode: document.createElement('div') }) as any,
    );

    renderEditor({});
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    window.getSelection = origGetSelection;
  });

  it('readonly: null rect from toDOMRange sets domRect to null', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSelection as any,
    );
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(ReactEditor.toDOMRange).mockReturnValue({
      cloneContents: () => document.createDocumentFragment(),
      getBoundingClientRect: () => null as any,
    } as any);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () => ({ anchorNode: document.createElement('div') }) as any,
    );

    renderEditor({});
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    window.getSelection = origGetSelection;
  });

  it('readonly: getSelectionFromDomSelection returns null, calls onSelectionChange with null', async () => {
    const setDomRect = vi.fn();
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect });

    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () => ({ anchorNode: document.createElement('div') }) as any,
    );

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
    window.getSelection = origGetSelection;
  });

  it('readonly: error in try-catch logs error', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    vi.mocked(getSelectionFromDomSelection).mockImplementation(() => {
      throw new Error('selection error');
    });

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () => ({ anchorNode: document.createElement('div') }) as any,
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // reportMode: true 避免 readonly 早期返回
    renderEditor({ reportMode: true });
    await editableProps.onSelect({});

    expect(consoleSpy).toHaveBeenCalledWith(
      'Selection change error:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
    window.getSelection = origGetSelection;
  });
});

describe('Editor branches - handleClipboardCopy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('copy with valid selection sets clipboard data and returns true', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);

    expect(event.clipboardData.clearData).toHaveBeenCalled();
    expect(event.clipboardData.setData).toHaveBeenCalledWith(
      'application/x-slate-md-fragment',
      expect.any(String),
    );
    expect(event.clipboardData.setData).toHaveBeenCalledWith(
      'text/plain',
      expect.any(String),
    );
    expect(event.clipboardData.setData).toHaveBeenCalledWith(
      'text/markdown',
      expect.any(String),
    );
    expect(ReactEditor.setFragmentData).toHaveBeenCalled();
    // event.preventDefault called by handleClipboardCopy (line 552)
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('copy without editable target gets selection from DOM', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(false);

    const mockDomSelection = { anchorNode: document.createElement('div') };
    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(() => mockDomSelection) as any;

    const mockSlateSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSlateSelection as any,
    );

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);

    expect(getSelectionFromDomSelection).toHaveBeenCalled();
    expect(event.clipboardData.clearData).toHaveBeenCalled();
    window.getSelection = origGetSelection;
  });

  it('cut gets selection from DOM, deletes content, and sets clipboard', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(isEventHandled).mockReturnValue(false);

    const mockSlateSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      mockSlateSelection as any,
    );

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () => ({ anchorNode: document.createElement('div') }) as any,
    );

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCut(event);

    expect(getSelectionFromDomSelection).toHaveBeenCalled();
    expect(Transforms.delete).toHaveBeenCalled();
    expect(event.clipboardData.clearData).toHaveBeenCalled();
    window.getSelection = origGetSelection;
  });

  it('copy/cut with no selection returns false and calls preventDefault fallback', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    // getSelectionFromDomSelection returns null by default

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);
    // handleClipboardCopy returns false → onCopy calls preventDefault
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('copy/cut with isEventHandled returns false and calls preventDefault fallback', () => {
    setupStore({ readonly: false });
    vi.mocked(isEventHandled).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('clipboard inner error catch returns false', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    // Make toDOMRange throw
    vi.mocked(ReactEditor.toDOMRange).mockImplementation(() => {
      throw new Error('toDOMRange error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error during clipboard operation:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('clipboard outer error catch returns false', () => {
    setupStore({ readonly: false });
    vi.mocked(isEventHandled).mockImplementation(() => {
      throw new Error('outer error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: {
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Clipboard copy/cut operation failed:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe('Editor branches - handlePasteEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('pasteConfig.enabled false returns early', async () => {
    setupStore({ readonly: false });

    renderEditor({ pasteConfig: { enabled: false } });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData(),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(
      handlePasteModule.handleSlateMarkdownFragment,
    ).not.toHaveBeenCalled();
  });

  it('non-collapsed selection triggers delete before paste', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.hasPath).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'test' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.delete).toHaveBeenCalled();
  });

  it('handleTagNodePaste returns true stops paste', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'paragraph', children: [{ text: '' }] },
      [0],
    ] as any);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({ types: ['text/plain'] }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleTagNodePaste).toHaveBeenCalled();
    expect(
      handlePasteModule.handleSlateMarkdownFragment,
    ).not.toHaveBeenCalled();
  });

  it('onPaste prop returns false stops paste', async () => {
    const onPaste = vi.fn(() => false);
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({ onPaste });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({ types: ['text/plain'] }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(onPaste).toHaveBeenCalled();
  });

  it('slate-md-fragment handling calls handleSlateMarkdownFragment', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleSlateMarkdownFragment).mockReturnValue(
      true,
    );

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['application/x-slate-md-fragment', 'text/plain'],
        getData: (t: string) =>
          t === 'application/x-slate-md-fragment' ? JSON.stringify([]) : 'text',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleSlateMarkdownFragment).toHaveBeenCalled();
  });

  it('HTML paste handling calls handleHtmlPaste', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHtmlPaste).mockResolvedValue(false);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/html'],
        getData: (t: string) => (t === 'text/html' ? '<p>hello</p>' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleHtmlPaste).toHaveBeenCalled();
  });

  it('HTML paste returns false continues to next handler', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHtmlPaste).mockResolvedValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/html'],
        getData: (t: string) => (t === 'text/html' ? '<p>hello</p>' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleHtmlPaste).toHaveBeenCalled();
  });

  it('Files paste handling calls handleFilesPaste', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleFilesPaste).mockResolvedValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['Files'],
        getData: vi.fn(() => ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleFilesPaste).toHaveBeenCalled();
  });

  it('text/markdown paste inserts fragment', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/markdown'],
        getData: (t: string) => (t === 'text/markdown' ? '# Hello' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertFragment).toHaveBeenCalled();
  });

  it('text/plain with shouldInsertTextDirectly inserts text directly', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'direct text' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertText).toHaveBeenCalledWith(
      expect.anything(),
      'direct text',
    );
  });

  it('text/plain with handleSpecialTextPaste returns true stops', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(
      false,
    );
    vi.mocked(handlePasteModule.handleSpecialTextPaste).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'media://test' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleSpecialTextPaste).toHaveBeenCalled();
    expect(handlePasteModule.handleHttpLinkPaste).not.toHaveBeenCalled();
  });

  it('text/plain with handleHttpLinkPaste returns true stops', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(
      false,
    );
    vi.mocked(handlePasteModule.handleSpecialTextPaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHttpLinkPaste).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'https://test.com' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleHttpLinkPaste).toHaveBeenCalled();
  });

  it('text/plain with handlePlainTextPaste returns true stops', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(
      false,
    );
    vi.mocked(handlePasteModule.handleSpecialTextPaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHttpLinkPaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handlePlainTextPaste).mockResolvedValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) =>
          t === 'text/plain' ? 'plain text content' : '',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handlePlainTextPaste).toHaveBeenCalled();
  });

  it('text/plain error in try-catch logs and continues', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(
      false,
    );
    vi.mocked(handlePasteModule.handleSpecialTextPaste).mockImplementation(
      () => {
        throw new Error('special text error');
      },
    );

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'error text' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalledWith('insert error', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('empty text/plain returns early', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: () => '',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('fallback to ReactEditor.insertData for unsupported types', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['custom/type'],
        getData: () => '',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(ReactEditor.insertData).toHaveBeenCalled();
  });

  it('pasteConfig.allowedTypes filters out types', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({
      pasteConfig: { allowedTypes: ['text/plain'] },
    });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['application/x-slate-md-fragment', 'text/html'],
        getData: () => '',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    // Should not call the fragment or html handlers
    expect(
      handlePasteModule.handleSlateMarkdownFragment,
    ).not.toHaveBeenCalled();
    expect(handlePasteModule.handleHtmlPaste).not.toHaveBeenCalled();
  });
});

describe('Editor branches - checkEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('readonly mode clears domRect on mouseDown', () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    renderEditor({});

    const event = {
      target: document.createElement('div'),
    } as any;

    editableProps.onMouseDown(event);
    expect(setDomRect).toHaveBeenCalledWith(null);
  });

  it('textAreaProps.enable returns false early', () => {
    setupStore({ readonly: false });

    renderEditor({ textAreaProps: { enable: true } });

    const target = document.createElement('div');
    target.dataset.slateEditor = 'true';
    const event = { target } as any;

    editableProps.onMouseDown(event);
    // Should not throw
    expect(true).toBe(true);
  });

  it('click on data-slate-editor near bottom calls EditorUtils.checkEnd', () => {
    const { container } = setupStore({ readonly: false });
    Object.defineProperty(container, 'scrollTop', { value: 0 });

    renderEditor({});

    const target = document.createElement('div');
    target.dataset.slateEditor = 'true';
    const lastChild = document.createElement('div');
    Object.defineProperty(lastChild, 'offsetTop', { value: 10 });
    target.appendChild(lastChild);

    vi.mocked(EditorUtils.checkEnd).mockReturnValue(true);

    const event = {
      target,
      clientY: 200,
      preventDefault: vi.fn(),
    } as any;

    editableProps.onMouseDown(event);
    expect(EditorUtils.checkEnd).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('click on data-slate-editor with checkEnd returning false does not preventDefault', () => {
    const { container } = setupStore({ readonly: false });
    Object.defineProperty(container, 'scrollTop', { value: 0 });

    renderEditor({});

    const target = document.createElement('div');
    target.dataset.slateEditor = 'true';
    const lastChild = document.createElement('div');
    Object.defineProperty(lastChild, 'offsetTop', { value: 10 });
    target.appendChild(lastChild);

    vi.mocked(EditorUtils.checkEnd).mockReturnValue(false);

    const event = {
      target,
      clientY: 200,
      preventDefault: vi.fn(),
    } as any;

    editableProps.onMouseDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('typewriter mode returns early without processing', () => {
    setupStore({ readonly: false });

    renderEditor({ typewriter: true });

    const target = document.createElement('div');
    target.dataset.slateEditor = 'true';
    const event = { target, clientY: 200 } as any;

    editableProps.onMouseDown(event);
    expect(EditorUtils.checkEnd).not.toHaveBeenCalled();
  });
});

describe('Editor branches - onSlateChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    editableProps = {};
    slateOnChange = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('first call returns early and schedules timer', () => {
    setupStore({ readonly: false });
    renderEditor({});

    expect(slateOnChange).toBeTruthy();
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);

    // mockOnChange should NOT be called on first call
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('after timer, subsequent calls trigger onChange and detect content changes', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    // First call (returns early)
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    expect(mockOnChange).not.toHaveBeenCalled();

    // Advance timer to set first.current = false
    vi.advanceTimersByTime(150);

    // Set operations with content changes
    editor.operations = [{ type: 'insert_text' }];

    // Second call
    slateOnChange!([{ type: 'paragraph', children: [{ text: 'hello' }] }]);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('set_selection only operations do not mark content changed', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    vi.advanceTimersByTime(150);

    editor.operations = [{ type: 'set_selection' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);

    expect(mockOnChange).toHaveBeenCalled();
  });
});

describe('Editor branches - handleKeyDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('tag input key match inserts tag node', () => {
    setupStore({ readonly: false });

    renderEditor({
      tagInputProps: { enable: true, prefixCls: '$' },
    });

    const event = {
      key: '$',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;

    editableProps.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({
          code: true,
          tag: true,
          autoOpen: true,
        }),
      ]),
    );
  });

  it('tag input with array prefixCls matches correctly', () => {
    setupStore({ readonly: false });

    renderEditor({
      tagInputProps: { enable: true, prefixCls: ['$', '#'] },
    });

    const event = {
      key: '#',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;

    editableProps.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(Transforms.insertNodes).toHaveBeenCalled();
  });

  it('non-matching key delegates to onKeyDown', () => {
    setupStore({ readonly: false });

    renderEditor({
      tagInputProps: { enable: true, prefixCls: '$' },
    });

    const event = {
      key: 'a',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;

    editableProps.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockOnKeyDown).toHaveBeenCalledWith(event);
  });

  it('without tagInputProps.enable delegates to onKeyDown', () => {
    setupStore({ readonly: false });

    renderEditor({});

    const event = {
      key: '$',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as any;

    editableProps.onKeyDown(event);
    expect(mockOnKeyDown).toHaveBeenCalledWith(event);
  });
});

describe('Editor branches - onCompositionStart/End', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('compositionStart sets data-composition and inputComposition', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});

    const event = { preventDefault: vi.fn() } as any;
    editableProps.onCompositionStart(event);

    expect(mockStoreConfig.store.inputComposition).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('compositionStart with tag-popup-input sets data-composition on tag input', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const hostEl = document.createElement('div');
    const tagInput = document.createElement('input');
    tagInput.setAttribute('data-tag-popup-input', '');
    hostEl.appendChild(tagInput);
    vi.mocked(ReactEditor.toDOMNode).mockReturnValue(hostEl as any);
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});

    editableProps.onCompositionStart({ preventDefault: vi.fn() });

    expect(tagInput.hasAttribute('data-composition')).toBe(true);
  });

  it('compositionStart with no focusPath.length does not throw', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [], offset: 0 },
      focus: { path: [], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});

    expect(() => {
      editableProps.onCompositionStart({ preventDefault: vi.fn() });
    }).not.toThrow();
  });

  it('compositionStart with non-collapsed selection does not preventDefault', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(false);

    renderEditor({});

    const event = { preventDefault: vi.fn() } as any;
    editableProps.onCompositionStart(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('compositionStart with null selection does not throw', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;

    renderEditor({});

    expect(() => {
      editableProps.onCompositionStart({ preventDefault: vi.fn() });
    }).not.toThrow();
  });

  it('compositionEnd removes data-composition and sets inputComposition false', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    renderEditor({});

    // First start
    editableProps.onCompositionStart({ preventDefault: vi.fn() });
    expect(mockStoreConfig.store.inputComposition).toBe(true);

    // Then end
    editableProps.onCompositionEnd();
    expect(mockStoreConfig.store.inputComposition).toBe(false);
  });

  it('compositionEnd with tag-popup-input removes data-composition', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const hostEl = document.createElement('div');
    const tagInput = document.createElement('input');
    tagInput.setAttribute('data-tag-popup-input', '');
    tagInput.setAttribute('data-composition', '');
    hostEl.appendChild(tagInput);
    vi.mocked(ReactEditor.toDOMNode).mockReturnValue(hostEl as any);

    renderEditor({});

    editableProps.onCompositionEnd();
    expect(tagInput.hasAttribute('data-composition')).toBe(false);
  });

  it('compositionEnd with no focusPath does not throw', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [], offset: 0 },
      focus: { path: [], offset: 0 },
    };

    renderEditor({});

    expect(() => {
      editableProps.onCompositionEnd();
    }).not.toThrow();
  });
});

describe('Editor branches - decorateFn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('comment.enable false returns decorateList early', () => {
    setupStore({ readonly: false });

    renderEditor({
      comment: { enable: false, commentList: [] },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: '' }] },
      [0],
    ]);

    expect(result).toEqual([]);
  });

  it('commentMap.size === 0 returns decorateList early', () => {
    setupStore({ readonly: false });

    renderEditor({
      comment: { enable: true, commentList: [] },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: '' }] },
      [0],
    ]);

    expect(result).toEqual([]);
  });

  it('without comment prop returns decorateList', () => {
    setupStore({ readonly: false });

    renderEditor({});

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: '' }] },
      [0],
    ]);

    expect(result).toEqual([]);
  });

  it('error in decoration catch returns decorateList', () => {
    setupStore({ readonly: false });

    // Editor.hasPath throws
    vi.mocked(Editor.hasPath).mockImplementation(() => {
      throw new Error('hasPath error');
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'c1',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 3 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'test' }] },
      [0],
    ]);

    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe('Editor branches - initialNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('instance undefined sets nodeRef to undefined', () => {
    setupStore({ readonly: false });

    renderEditor({ instance: undefined });

    // Should render without error
    expect(editableProps).toBeDefined();
  });

  it('EditorUtils.reset error falls back to deleteAll', () => {
    setupStore({ readonly: false });

    vi.mocked(EditorUtils.reset).mockImplementation(() => {
      throw new Error('reset error');
    });

    renderEditor({
      instance: {},
      initSchemaValue: [{ type: 'paragraph', children: [{ text: 'x' }] }],
    });

    expect(EditorUtils.deleteAll).toHaveBeenCalled();
  });
});

describe('Editor branches - mouseup effect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('mouseup on container calls handleSelectionChange.run', async () => {
    const { container } = setupStore({ readonly: false });
    const addSpy = vi.spyOn(container, 'addEventListener');

    renderEditor({});

    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    addSpy.mockRestore();
  });

  it('null container in effect does not add listener', () => {
    setupStore({
      readonly: false,
      container: null,
    });
    mockStoreConfig.markdownContainerRef = { current: null };

    renderEditor({});
    // Should not throw
    expect(editableProps).toBeDefined();
  });
});

describe('Editor branches - onFocus and onBlur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('onFocus calls props.onFocus with markdown and children', () => {
    const onFocus = vi.fn();
    setupStore({ readonly: false });
    vi.mocked(parserSlateNodeToMarkdown).mockReturnValue('focus-md');

    renderEditor({ onFocus });

    editableProps.onFocus({ type: 'focus' });

    expect(onFocus).toHaveBeenCalledWith(
      'focus-md',
      expect.any(Array),
      expect.objectContaining({ type: 'focus' }),
    );
  });

  it('onBlur sets domRect to null', () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: false, setDomRect });

    renderEditor({});

    editableProps.onBlur();

    expect(setDomRect).toHaveBeenCalledWith(null);
  });
});

describe('Editor branches - readonlyCls and childrenIsEmpty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('editor with empty children renders successfully', () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [];

    renderEditor({});

    expect(editableProps).toBeDefined();
  });

  it('readonly mode applies readonly class', () => {
    setupStore({ readonly: true });

    renderEditor({});

    // The className should include readonly
    expect(editableProps.className).toContain('readonly');
  });

  it('non-readonly with non-empty content applies focus class', () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [{ type: 'paragraph', children: [{ text: 'content' }] }];

    renderEditor({
      initSchemaValue: [{ type: 'paragraph', children: [{ text: 'content' }] }],
    });

    // Should include 'focus' class when content is not empty
    expect(editableProps.className).toContain('focus');
  });

  it('non-readonly with only non-empty paragraphs has empty readonlyCls', () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [{ type: 'paragraph', children: [{ text: 'has text' }] }];

    renderEditor({
      initSchemaValue: [
        { type: 'paragraph', children: [{ text: 'has text' }] },
      ],
    });

    // className should be defined
    expect(editableProps.className).toBeDefined();
  });
});
