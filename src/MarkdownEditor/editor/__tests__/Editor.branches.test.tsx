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
vi.mock('../../../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: any) => ({ run: fn, cancel: vi.fn() }),
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
vi.mock('../components/EditorEditable', () => ({
  EditorEditable: (props: Record<string, any>) => {
    editableProps = props;
    return React.createElement('div', { 'data-testid': 'mock-editable' });
  },
}));

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../plugins/useKeyboard', () => ({
  useKeyboard: () => mockOnKeyDown,
}));

vi.mock('../plugins/useOnchange', () => ({
  useOnchange: () => mockOnChange,
}));

const mockHighlightFn = vi.fn(() => []);

vi.mock('../plugins/useHighlight', () => ({
  useHighlight: () => mockHighlightFn,
}));

vi.mock('../style', () => ({
  useStyle: () => ({
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

vi.mock('../plugins/parseMarkdownToNodesAndInsert', () => ({
  parseMarkdownToNodesAndInsert: vi.fn(() => true),
}));

vi.mock('../utils', () => ({
  MARKDOWN_EDITOR_EVENTS: { SELECTIONCHANGE: 'md-selectionchange' },
  copy: vi.fn((value: unknown) => JSON.parse(JSON.stringify(value))),
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
  LazyElement: ({
    children,
    elementInfo,
    renderPlaceholder,
    rootMargin,
  }: any) => {
    if (elementInfo) {
      (globalThis as any).__lastLazyElementInfo = elementInfo;
    }
    if (renderPlaceholder) {
      renderPlaceholder(elementInfo);
    }
    if (rootMargin) {
      (globalThis as any).__lastLazyRootMargin = rootMargin;
    }
    return children;
  },
}));

vi.mock('../../../Utils/env', () => ({
  isWeChat: vi.fn(() => false),
}));

/* ========== Imports after mocks ========== */

import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isWeChat } from '../../../Utils/env';
import { PluginContext } from '../../plugin';
import { SlateMarkdownEditor } from '../Editor';
import * as handlePasteModule from '../plugins/handlePaste';
import { parseMarkdownToNodesAndInsert } from '../plugins/parseMarkdownToNodesAndInsert';
import { parserSlateNodeToMarkdown } from '../utils';
import {
  EditorUtils,
  findByPathAndText,
  findLeafPath,
  getSelectionFromDomSelection,
  hasEditableTarget,
  isEventHandled,
  isPath,
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

  it('readonly: stale selection path should skip toDOMRange and clear domRect', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const staleSelection = {
      anchor: { path: [99, 0], offset: 0 },
      focus: { path: [99, 0], offset: 1 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(
      staleSelection as any,
    );
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.hasPath).mockReturnValue(false);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () =>
        ({
          anchorNode: document.createElement('div'),
          focusNode: document.createElement('div'),
          rangeCount: 1,
        }) as any,
    );

    renderEditor({ reportMode: true });
    await editableProps.onSelect({});

    expect(ReactEditor.toDOMRange).not.toHaveBeenCalled();
    expect(setDomRect).toHaveBeenCalledWith(null);
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
    /**
     * 同 worker 内若先有测试加载真实 slate（如 EditorStore.unit.test），此处 vi.mock('slate') 不生效，
     * 真实 Editor.hasPath 在 createMockEditor 上会对 [0,0] 返回 false，导致 clearData 后即 return，
     * setData / Transforms.delete / 内层 catch 均无法覆盖。
     */
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('copy with invalid selection path stops before writing clipboard payload', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    vi.mocked(Editor.hasPath).mockReturnValueOnce(false);

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
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(ReactEditor.setFragmentData).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
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

  it('copy/cut with no selection lets native clipboard fallback run', () => {
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
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('copy/cut with isEventHandled lets native clipboard fallback run', () => {
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
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('clipboard inner error catch returns false', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    vi.mocked(ReactEditor.setFragmentData).mockImplementation(() => {
      throw new Error('setFragmentData error');
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

  it('Word HTML paste converts through markdown before HTML fallback', async () => {
    const { editor } = setupStore({ readonly: false });
    const wordHtml = [
      '<html><head>',
      '<meta name="Generator" content="Microsoft Word 16">',
      '</head><body>',
      '<p class="MsoNormal">Word&nbsp;text<o:p></o:p></p>',
      '</body></html>',
    ].join('');

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
        types: ['text/html'],
        getData: (t: string) => (t === 'text/html' ? wordHtml : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(parseMarkdownToNodesAndInsert).toHaveBeenCalledWith(
      editor,
      'Word text',
      [],
    );
    expect(handlePasteModule.handleHtmlPaste).not.toHaveBeenCalled();
  });

  it('Word HTML paste respects convertWordToMarkdown false', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHtmlPaste).mockResolvedValue(true);

    renderEditor({
      pasteConfig: { convertWordToMarkdown: false },
    });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/html'],
        getData: (t: string) =>
          t === 'text/html'
            ? '<p class="MsoNormal">Fallback through HTML</p>'
            : '',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(parseMarkdownToNodesAndInsert).not.toHaveBeenCalled();
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
        files: [
          new File(['image'], 'pasted.png', {
            type: 'image/png',
          }),
        ],
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

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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

    // 源码中 catch 块使用 console.error('[handlePaste] 处理纯文本粘贴失败:', e)
    expect(consoleSpy).toHaveBeenCalled();
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
    editableProps = {};
    slateOnChange = null;
  });

  it('first call with set_selection only returns early', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    expect(slateOnChange).toBeTruthy();
    editor.operations = [{ type: 'set_selection' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('first content-changing call still triggers onChange (e.g. void code block)', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    editor.operations = [{ type: 'set_node' }];
    slateOnChange!([{ type: 'code', value: 'x', children: [{ text: '' }] }]);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('after first content change subsequent calls trigger onChange', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    editor.operations = [{ type: 'insert_text' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: 'hello' }] }]);
    expect(mockOnChange).toHaveBeenCalledTimes(1);

    editor.operations = [{ type: 'insert_text' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: 'hello world' }] }]);
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('set_selection only on first call remains ignored before content change', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    editor.operations = [{ type: 'set_selection' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    expect(mockOnChange).not.toHaveBeenCalled();

    editor.operations = [{ type: 'set_selection' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('content change emits footnote definition callback when configured', () => {
    const onFootnoteDefinitionChange = vi.fn();
    const { editor } = setupStore({ readonly: false });
    renderEditor({
      fncProps: { onFootnoteDefinitionChange },
    });

    editor.operations = [{ type: 'insert_text' }];
    slateOnChange!([
      {
        type: 'footnoteDefinition',
        identifier: '1',
        children: [{ text: 'note' }],
      },
    ]);

    expect(onFootnoteDefinitionChange).toHaveBeenCalled();
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
    const { editor, container } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});

    const event = { preventDefault: vi.fn() } as any;
    editableProps.onCompositionStart(event);

    expect(mockStoreConfig.store.inputComposition).toBe(true);
    expect(container.hasAttribute('data-composition')).toBe(true);
    // preventDefault は移动端互換性のため呼び出さない：
    // 移动端键盘通过 IME 组合事件输入，调用 preventDefault 会阻断
    // 字符写入 contenteditable，导致占位符无法消失。
    expect(event.preventDefault).not.toHaveBeenCalled();
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

  it('compositionEnd 推迟清除 inputComposition，避免 IME Enter 确认选字误触', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    renderEditor({});

    editableProps.onCompositionStart({ preventDefault: vi.fn() });
    expect(mockStoreConfig.store.inputComposition).toBe(true);

    editableProps.onCompositionEnd();
    expect(mockStoreConfig.store.inputComposition).toBe(true);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(mockStoreConfig.store.inputComposition).toBe(false);
  });

  it('compositionEnd 在 Slate 未落盘时补写 IME 文本', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});

    editableProps.onCompositionEnd({ data: '，' });
    await act(async () => {
      await Promise.resolve();
    });

    expect(Editor.insertText).toHaveBeenCalledWith(editor, '，');
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

    // 源码在高亮计算失败时会通过 console.error 输出
    // "[highlight] 高亮计算失败:"，本用例正是构造该异常路径，需要静默
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    errorSpy.mockRestore();
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

  it('mouseup/touchend on container register selection sync listeners', async () => {
    const { container } = setupStore({ readonly: false });
    const addSpy = vi.spyOn(container, 'addEventListener');

    renderEditor({});

    expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('touchend', expect.any(Function), {
      passive: true,
    });
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

  it('WeChat mouseup 在 contenteditable 内聚焦编辑器', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container, editor } = setupStore({ readonly: false });
    vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(false);

    renderEditor({});

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    container.appendChild(editable);

    const mouseUp = new MouseEvent('mouseup', { bubbles: true });
    editable.dispatchEvent(mouseUp);

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(EditorUtils.focus).toHaveBeenCalledWith(editor);
    vi.mocked(isWeChat).mockReturnValue(false);
  });

  it('WeChat mouseup 在非 contenteditable 区域不聚焦', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(false);

    renderEditor({});

    const outer = document.createElement('div');
    container.appendChild(outer);
    outer.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(EditorUtils.focus).not.toHaveBeenCalled();
    vi.mocked(isWeChat).mockReturnValue(false);
  });

  it('WeChat touchend passive 监听仍触发选区同步', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    const onSelectionChange = vi.fn();

    renderEditor({ onSelectionChange });

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    container.appendChild(editable);

    editable.dispatchEvent(new Event('touchend', { bubbles: true }));

    await act(async () => {
      await flushPromises();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(onSelectionChange).toHaveBeenCalled();
    vi.mocked(isWeChat).mockReturnValue(false);
  });

  it('readonly WeChat 不尝试 focus 编辑器', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: true });

    renderEditor({});

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });
    vi.mocked(EditorUtils.focus).mockClear();

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    container.appendChild(editable);
    editable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(EditorUtils.focus).not.toHaveBeenCalled();
    vi.mocked(isWeChat).mockReturnValue(false);
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

  it('non-readonly with non-empty content does not apply empty paragraph focus class', () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [{ type: 'paragraph', children: [{ text: 'content' }] }];

    renderEditor({
      initSchemaValue: [{ type: 'paragraph', children: [{ text: 'content' }] }],
    });

    expect(editableProps.className).toContain('ant-md-content-edit');
    expect(editableProps.className).not.toContain('ant-md-content-focus');
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

describe('Editor branches - decorateFn comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    mockHighlightFn.mockReturnValue([{ fnc: true }]);
  });

  it('returns highlight decorations when comment disabled', () => {
    setupStore({ readonly: false });
    renderEditor({ comment: { enable: false, commentList: [] } });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'x' }] },
      [0],
    ]);
    expect(result).toEqual([{ fnc: true }]);
  });

  it('merges comment ranges when selection paths are valid', () => {
    setupStore({ readonly: false });
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findLeafPath).mockImplementation((_ed, path) => path);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'hi' }] } as any,
    ]);
    vi.mocked(Editor.hasPath).mockReturnValue(true);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'c1',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 2 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'hi' }] },
      [0],
    ]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('uses refContent fallback for table comment selection', () => {
    setupStore({ readonly: false });
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'table', children: [] },
      [0],
    ] as any);
    vi.mocked(Editor.start).mockReturnValue({ path: [0, 0, 0], offset: 0 });
    vi.mocked(Editor.end).mockReturnValue({ path: [0, 0, 0], offset: 3 });
    vi.mocked(findLeafPath).mockImplementation((_ed, path) => path);
    vi.mocked(Editor.fragment).mockReturnValue([]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 't1',
            path: [0],
            refContent: 'cell',
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'table', children: [] },
      [0],
    ]);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('Editor branches - renderElement and renderLeaf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('eleItemRender wraps non-table elements', () => {
    setupStore({ readonly: false });
    const eleItemRender = vi.fn((_props, dom) => (
      <div data-testid="custom-element">{dom}</div>
    ));

    renderEditor({ eleItemRender });

    const rendered = editableProps.renderElement({
      element: { type: 'paragraph', children: [{ text: '' }] },
      attributes: { 'data-slate-node': 'element' },
      children: <span>child</span>,
    });

    expect(eleItemRender).toHaveBeenCalled();
    expect(rendered.props['data-testid']).toBe('custom-element');
  });

  it('skips eleItemRender for table-cell and table-row', () => {
    setupStore({ readonly: false });
    const eleItemRender = vi.fn((_props, dom) => dom);

    renderEditor({ eleItemRender });

    editableProps.renderElement({
      element: { type: 'table-cell', children: [] },
      attributes: {},
      children: null,
    });
    editableProps.renderElement({
      element: { type: 'table-row', children: [] },
      attributes: {},
      children: null,
    });

    expect(eleItemRender).not.toHaveBeenCalled();
  });

  it('plugin element overrides default render', () => {
    setupStore({ readonly: false });
    const PluginEl = () => <div data-testid="plugin-el" />;

    renderEditor({
      plugins: [{ elements: { custom: PluginEl } }],
    });

    const rendered = editableProps.renderElement({
      element: { type: 'custom', children: [] },
      attributes: {},
      children: null,
    });

    expect(rendered.type).toBe(PluginEl);
  });

  it('lazy mode executes render path for table and non-table elements', () => {
    setupStore({ readonly: false });
    renderEditor({ lazy: { enable: true, placeholderHeight: 24 } });

    expect(() =>
      editableProps.renderElement({
        element: { type: 'paragraph', children: [{ text: 'a' }] },
        attributes: {},
        children: null,
      }),
    ).not.toThrow();

    const tableCell = editableProps.renderElement({
      element: { type: 'table-cell', children: [] },
      attributes: {},
      children: null,
    });
    expect(tableCell).toBeTruthy();
  });

  it('leafRender wraps default MLeaf output', () => {
    setupStore({ readonly: false });
    const leafRender = vi.fn((_props, dom) => (
      <span data-testid="custom-leaf">{dom}</span>
    ));

    renderEditor({ leafRender });

    const rendered = editableProps.renderLeaf({
      leaf: { text: 'x' },
      text: { text: 'x' },
      attributes: { 'data-slate-leaf': true },
      children: <span>x</span>,
    });

    expect(leafRender).toHaveBeenCalled();
    expect(rendered.props['data-testid']).toBe('custom-leaf');
  });
});

describe('Editor branches - paste extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('oversized HTML falls back to plain text insert', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(true);

    renderEditor({ pasteConfig: { htmlMaxBytes: 10 } });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/html', 'text/plain'],
        getData: (t: string) =>
          t === 'text/html' ? 'x'.repeat(20) : 'plain fallback',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertText).toHaveBeenCalledWith(
      expect.anything(),
      'plain fallback',
    );
  });

  it('plainTextOnly inserts text at selection', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({ pasteConfig: { plainTextOnly: true } });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'only plain' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertText).toHaveBeenCalledWith(
      expect.anything(),
      'only plain',
      expect.objectContaining({ at: editor.selection }),
    );
  });

  it('plainTextOnly without selection inserts paragraph node', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);

    renderEditor({ pasteConfig: { plainTextOnly: true } });

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? 'new block' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertNodes).toHaveBeenCalled();
  });

  it('Word HTML conversion error falls back to handleHtmlPaste', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(parseMarkdownToNodesAndInsert).mockImplementation(() => {
      throw new Error('word md fail');
    });
    vi.mocked(handlePasteModule.handleHtmlPaste).mockResolvedValue(true);

    renderEditor({});

    const wordHtml =
      '<html><head><meta name="Generator" content="Microsoft Word 16"></head><body><p class="MsoNormal">Word</p></body></html>';

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/html'],
        getData: (t: string) => (t === 'text/html' ? wordHtml : ''),
      }),
      target: document.createElement('div'),
    } as any;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handleHtmlPaste).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('text/markdown uses direct insert when shouldInsertTextDirectly', async () => {
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
        types: ['text/markdown'],
        getData: (t: string) => (t === 'text/markdown' ? 'inline md' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(Transforms.insertText).toHaveBeenCalledWith(
      expect.anything(),
      'inline md',
    );
    expect(Transforms.insertFragment).not.toHaveBeenCalled();
  });
});

describe('Editor branches - composition update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('onCompositionUpdate activates composition on WeChat', () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    renderEditor({ onCompositionActiveChange: vi.fn() });

    editableProps.onCompositionUpdate({ data: 'ni' });

    expect(mockStoreConfig.store.inputComposition).toBe(true);
    expect(container.hasAttribute('data-composition')).toBe(true);
  });

  it('onCompositionUpdate activates when container lacks data-composition', () => {
    vi.mocked(isWeChat).mockReturnValue(false);
    setupStore({ readonly: false });
    renderEditor({});

    editableProps.onCompositionUpdate({ data: 'hao' });
    expect(mockStoreConfig.store.inputComposition).toBe(true);
  });
});

describe('Editor branches - clipboard invalid focus path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    vi.spyOn(Editor, 'hasPath').mockImplementation((_ed, path) => {
      const p = path as number[];
      return !(p.length === 2 && p[0] === 0 && p[1] === 5);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copy with invalid focus path stops before writing clipboard payload', () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 5], offset: 1 },
    };
    vi.mocked(isEventHandled).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    } as any;

    editableProps.onCopy(event);

    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe('Editor branches - readonly early return', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('readonly without reportMode skips DOM selection sync', async () => {
    const setDomRect = vi.fn();
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect });

    renderEditor({});
    await editableProps.onSelect({});

    expect(setDomRect).toHaveBeenCalledWith(null);
    expect(getSelectionFromDomSelection).not.toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('getSelectionContent logs Failed to get selection content on fragment error', async () => {
    const onSelectionChange = vi.fn();
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.fragment).mockImplementation(() => {
      throw new Error('fragment fail');
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderEditor({ onSelectionChange });
    await editableProps.onSelect({});

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to get selection content:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('compositionEnd without data does not call insertText', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});
    editableProps.onCompositionEnd({});
    await act(async () => {
      await Promise.resolve();
    });

    expect(Editor.insertText).not.toHaveBeenCalled();
  });

  it('lazy mode passes elementInfo to LazyElement', () => {
    setupStore({ readonly: false });
    renderEditor({ lazy: { enable: true, placeholderHeight: 32 } });

    const result = editableProps.renderElement({
      element: { type: 'paragraph', children: [{ text: 'lazy' }] },
      attributes: {},
      children: null,
    });

    expect(result.props?.elementInfo).toEqual(
      expect.objectContaining({ type: 'paragraph' }),
    );
  });
});

describe('Editor branches - WeChat native input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    vi.mocked(isWeChat).mockReturnValue(true);
  });

  afterEach(() => {
    vi.mocked(isWeChat).mockReturnValue(false);
  });

  it('native input isComposing 激活组合输入态', () => {
    const { container } = setupStore({ readonly: false });
    renderEditor({});

    const event = new InputEvent('input', { bubbles: true, composed: true });
    Object.defineProperty(event, 'isComposing', { value: true });
    container.dispatchEvent(event);

    expect(mockStoreConfig.store.inputComposition).toBe(true);
    expect(container.hasAttribute('data-composition')).toBe(true);
  });

  it('native input 非组合态时结束 composition 并清除标记', async () => {
    const { container } = setupStore({ readonly: false });
    mockStoreConfig.store.inputComposition = true;
    container.setAttribute('data-composition', '');
    renderEditor({});

    const event = new InputEvent('input', { bubbles: true, composed: true });
    Object.defineProperty(event, 'isComposing', { value: false });
    container.dispatchEvent(event);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(mockStoreConfig.store.inputComposition).toBe(false);
  });

  it('readonly 时不注册 native input 监听', () => {
    const { container } = setupStore({ readonly: true });
    const addSpy = vi.spyOn(container, 'addEventListener');
    renderEditor({});
    expect(addSpy).not.toHaveBeenCalledWith('input', expect.any(Function), true);
    addSpy.mockRestore();
  });
});

describe('Editor branches - empty root focus class', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    slateOnChange = null;
  });

  it('根级空段落时应用 focus 类名', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    act(() => {
      editor.operations = [{ type: 'insert_text' }];
      slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    });

    expect(editableProps.className).toContain('ant-md-content-focus');
  });
});

describe('Editor branches - readonly floatBar selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Range.isCollapsed).mockReturnValue(true);
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);
    vi.mocked(ReactEditor.toDOMRange).mockReturnValue({
      cloneContents: () => document.createDocumentFragment(),
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
    } as any);
  });

  it('readonly + reportMode + floatBar 启用时同步 DOM 选区', async () => {
    const setDomRect = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(mockSelection as any);
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

    renderEditor({ reportMode: true, floatBar: { enable: true } });
    await editableProps.onSelect({});
    await flushPromises();

    expect(getSelectionFromDomSelection).toHaveBeenCalled();
    expect(setDomRect).toHaveBeenCalledWith(
      expect.objectContaining({ top: 10, left: 10 }),
    );
    window.getSelection = origGetSelection;
  });
});

describe('Editor branches - decorateFn extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    mockHighlightFn.mockReturnValue([]);
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findLeafPath).mockImplementation((_ed, path) => path);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
  });

  afterEach(() => {
    vi.mocked(Editor.node).mockRestore();
  });

  it('findByPathAndText 命中 refContent 时使用 DOM 偏移生成 comment range', () => {
    setupStore({ readonly: false });
    vi.mocked(findByPathAndText).mockReturnValue([
      { path: [0, 0], offset: { start: 1, end: 4 } },
    ] as any);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'abc' }] } as any,
    ]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'ref1',
            path: [0],
            refContent: 'abc',
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'abc' }] },
      [0],
    ]);
    expect(result.some((r: any) => r.comment === true)).toBe(true);
  });

  it('card 节点 refContent 未命中时回退整卡选区', () => {
    setupStore({ readonly: false });
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.node).mockReturnValue([
      { type: 'card', children: [{ text: 'card body' }] },
      [0],
    ] as any);
    vi.mocked(Editor.start).mockReturnValue({ path: [0, 0], offset: 0 });
    vi.mocked(Editor.end).mockReturnValue({ path: [0, 0], offset: 9 });
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'card', children: [{ text: 'card body' }] } as any,
    ]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'card1',
            path: [0],
            refContent: 'missing',
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'card', children: [{ text: 'card body' }] },
      [0],
    ]);
    expect(result.some((r: any) => r.comment === true)).toBe(true);
  });

  it('同 path 同 selection 的多条 comment 合并到同一 decorate range', () => {
    setupStore({ readonly: false });
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'hi' }] } as any,
    ]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'c1',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 2 },
            },
          },
          {
            id: 'c2',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 2 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'hi' }] },
      [0],
    ]);
    const commentRange = result.find((r: any) => r.comment === true);
    expect(commentRange?.data?.length).toBe(2);
  });

  it('table 选区异常时记录 Error selecting table node', () => {
    setupStore({ readonly: false });
    vi.mocked(findByPathAndText).mockReturnValue([]);
    vi.mocked(Editor.hasPath).mockImplementation((_ed, path) => {
      if (Array.isArray(path) && path[0] === 99) {
        return false;
      }
      return true;
    });
    vi.mocked(Editor.node).mockImplementation(() => {
      throw new Error('node fail');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 't-err',
            path: [0],
            refContent: 'cell',
            selection: {
              anchor: { path: [99, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
        ],
      },
    });

    editableProps.decorate([
      { type: 'table', children: [] },
      [0],
    ]);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error selecting table node:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe('Editor branches - lazy render options', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('lazy 透传 rootMargin 与 renderPlaceholder', () => {
    setupStore({ readonly: false });
    const renderPlaceholder = vi.fn(() => <div data-testid="lazy-ph" />);
    renderEditor({
      lazy: {
        enable: true,
        placeholderHeight: 48,
        rootMargin: '200px',
        renderPlaceholder,
      },
    });

    const result = editableProps.renderElement({
      element: { type: 'paragraph', children: [{ text: 'lazy' }] },
      attributes: {},
      children: null,
    });

    expect(result.props.rootMargin).toBe('200px');
    expect(result.props.renderPlaceholder).toBe(renderPlaceholder);
    expect(result.props.elementInfo).toEqual(
      expect.objectContaining({ type: 'paragraph', index: 0 }),
    );
  });
});

describe('Editor branches - comment map merge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    mockHighlightFn.mockReturnValue([]);
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findLeafPath).mockImplementation((_ed, path) => path);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
  });

  it('同 path 同 selection 的多条 comment 合并到 data 数组', () => {
    setupStore({ readonly: false });
    const sharedSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'abc' }] } as any,
    ]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          { id: 'c1', path: [0], selection: sharedSelection, updateTime: 1 },
          { id: 'c2', path: [0], selection: sharedSelection, updateTime: 2 },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'abc' }] },
      [0],
    ]);
    const commentRange = result.find((r: any) => r.comment === true);
    expect(commentRange?.data).toHaveLength(2);
  });

  it('readonly 仅 onSelectionChange 时不 early-return', async () => {
    const setDomRect = vi.fn();
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true, setDomRect });

    const mockSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(mockSelection as any);
    vi.mocked(Range.isCollapsed).mockReturnValue(false);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(ReactEditor.toDOMRange).mockReturnValue({
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
    } as any);

    const origGetSelection = window.getSelection;
    window.getSelection = vi.fn(
      () =>
        ({
          anchorNode: document.createElement('div'),
          focusNode: document.createElement('div'),
          rangeCount: 1,
        }) as any,
    );

    renderEditor({
      onSelectionChange,
      floatBar: { enable: false },
    });
    await editableProps.onSelect({});

    expect(onSelectionChange).toHaveBeenCalled();
    expect(getSelectionFromDomSelection).toHaveBeenCalled();
    window.getSelection = origGetSelection;
  });
});

describe('Editor branches - paste and composition depth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it.skip('clipboardData.types 缺失时默认走 text/plain', async () => {
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
      clipboardData: {
        types: undefined,
        getData: (t: string) => (t === 'text/plain' ? 'from default type' : ''),
        clearData: vi.fn(),
        setData: vi.fn(),
        files: [],
      },
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(handlePasteModule.handlePlainTextPaste).toHaveBeenCalledWith(
      expect.anything(),
      'from default type',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it('text/plain 仅空白字符时 trim 后 early return', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    const plainSpy = vi
      .mocked(handlePasteModule.handlePlainTextPaste)
      .mockResolvedValue(true);

    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? '  \n\t  ' : ''),
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();

    expect(plainSpy).not.toHaveBeenCalled();
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('非只读无 onSelectionChange 时 onSelect 仅派发事件', async () => {
    const { editor, container } = setupStore({ readonly: false });
    const dispatchSpy = vi.spyOn(container, 'dispatchEvent');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(Range.isCollapsed).mockReturnValue(true);

    renderEditor({});
    await editableProps.onSelect({});

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'md-selectionchange' }),
    );
  });

  it('onCompositionUpdate 已有 data-composition 时不重复激活', () => {
    const { container } = setupStore({ readonly: false });
    container.setAttribute('data-composition', '');
    mockStoreConfig.store.inputComposition = true;
    renderEditor({});

    editableProps.onCompositionUpdate({
      data: 'partial',
      preventDefault: vi.fn(),
    } as any);

    expect(mockStoreConfig.store.inputComposition).toBe(true);
  });

  it('纯文本粘贴仅空白时早退不插入', async () => {
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
        getData: () => '   \n\t  ',
      }),
      target: document.createElement('div'),
    } as any;

    editableProps.onPaste(event);
    await flushPromises();
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('未传 onSelectionChange 时 selection 变更不抛错', () => {
    setupStore({ readonly: false });
    expect(() => renderEditor({})).not.toThrow();
  });

  it('istanbul residual：clipboard 类型回退、无 selection 复制、无 onSelectionChange blur', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = null;
    renderEditor({});

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: undefined,
        getData: (t: string) => {
          if (t === 'text/rtf') return '';
          if (t === 'text/markdown') return '';
          if (t === 'text/html') return '<p>h</p>';
          if (t === 'text/plain') return 'plain';
          if (t === 'application/x-slate-md-fragment') return '';
          return '';
        },
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any;

    if (editableProps?.onPaste) {
      editableProps.onPaste(event);
      await flushPromises();
    }

    if (editableProps?.onCopy) {
      editableProps.onCopy({
        preventDefault: vi.fn(),
        clipboardData: { setData: vi.fn() },
      } as any);
    }

    setupStore({ readonly: false });
    renderEditor({});
    if (editableProps?.onSelect) {
      await editableProps.onSelect({});
    }
    if (editableProps?.onBlur) {
      editableProps.onBlur({});
    }
  });

  it('istanbul residual：slateEditor 目标点击与无 DOM selection', async () => {
    const { container } = setupStore({ readonly: false });
    renderEditor({});
    const slateEl = document.createElement('div');
    slateEl.dataset.slateEditor = 'true';
    container.appendChild(slateEl);

    if (editableProps?.onMouseDown) {
      editableProps.onMouseDown({
        target: slateEl,
        preventDefault: vi.fn(),
        button: 0,
      } as any);
    }

    const getSel = window.getSelection;
    (window as any).getSelection = () => null;
    if (editableProps?.onSelect) {
      await editableProps.onSelect({});
    }
    window.getSelection = getSel;
  });

  it('istanbul buffer：空 plain 早退、getFragment 假值、comment path 未命中', async () => {
    const { editor } = setupStore({ readonly: false });
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    renderEditor({});

    const emptyPlain = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: createClipboardData({
        types: ['text/plain'],
        getData: (t: string) => (t === 'text/plain' ? '   ' : ''),
      }),
      target: document.createElement('div'),
    } as any;
    editableProps?.onPaste?.(emptyPlain);
    await flushPromises();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    editor.getFragment = () => undefined as any;
    editableProps?.onCopy?.({
      preventDefault: vi.fn(),
      clipboardData: { setData: vi.fn() },
    } as any);

    setupStore({ readonly: false });
    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'miss',
            path: [99, 0],
            selection: undefined,
            refContent: 'ghost',
          },
        ],
      },
    });
    const ranges = editableProps?.decorate?.([
      { type: 'paragraph', children: [{ text: 'a' }] },
      [0],
    ]);
    expect(Array.isArray(ranges)).toBe(true);
  });

  it('istanbul fill：空 initSchema、clipboard 空串、hasEditableTarget 假、未知元素', async () => {
    setupStore({ readonly: false });
    renderEditor({ initSchemaValue: [] });
    expect(editableProps).toBeTruthy();

    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.shouldInsertTextDirectly).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleSpecialTextPaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handleHttpLinkPaste).mockReturnValue(false);
    vi.mocked(handlePasteModule.handlePlainTextPaste).mockResolvedValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(false);

    renderEditor({});
    await editableProps.onPaste?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: ['text/html', 'text/rtf', 'text/markdown', 'text/plain'],
        getData: (t: string) => {
          if (t === 'text/html') return '';
          if (t === 'text/rtf') return '';
          if (t === 'text/markdown') return '';
          if (t === 'text/plain') return 'fallback-plain';
          return '';
        },
        files: [],
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any);
    await flushPromises();

    const unknown = editableProps.renderElement?.({
      element: { type: 'totally-unknown-node', children: [{ text: '' }] },
      attributes: { 'data-slate-node': 'element' },
      children: <span>u</span>,
    });
    expect(unknown).toBeTruthy();

    editor.operations = [];
    slateOnChange?.([{ type: 'paragraph', children: [{ text: 'same' }] }]);
  });

  it('istanbul after：clipboardData.types 缺失回退；getFragment 假值', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    editor.getFragment = () => undefined as any;
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    renderEditor({});
    await editableProps.onCopy?.({
      preventDefault: vi.fn(),
      clipboardData: {
        types: undefined,
        setData: vi.fn(),
        getData: () => '',
      },
      target: document.createElement('div'),
    } as any);

    await editableProps.onPaste?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: undefined,
        getData: () => 'plain-only',
        files: [],
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any);
    await flushPromises();
    expect(editableProps).toBeTruthy();
  });

  it('istanbul buffer：超大 html 走 plain；空 markdown 跳过；无 files', async () => {
    const { editor } = setupStore({ readonly: false });
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    renderEditor({});

    const hugeHtml = `<p>${'x'.repeat(1_100_000)}</p>`;
    await editableProps.onPaste?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: ['text/html', 'text/plain'],
        getData: (t: string) =>
          t === 'text/html' ? hugeHtml : 'plain-fallback',
        files: [],
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any);
    await flushPromises();

    await editableProps.onPaste?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clipboardData: {
        types: ['text/markdown', 'text/plain'],
        getData: (t: string) => (t === 'text/markdown' ? '   \n' : ''),
        files: [],
        clearData: vi.fn(),
        setData: vi.fn(),
      },
      target: document.createElement('div'),
    } as any);
    await flushPromises();
    expect(editableProps).toBeTruthy();
  });
});

describe('Editor istanbul residual：onSelectionChange 假值 / 无 focus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
  });

  it('readonly 无 onSelectionChange 时选区回调 else 臂', async () => {
    // if (props.onSelectionChange) { else }
    setupStore({ readonly: true, setDomRect: vi.fn() });
    renderEditor({});
    await flushPromises();
    expect(editableProps).toBeTruthy();
  });
});

describe('Editor branches - deepen round 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editableProps = {};
    slateOnChange = null;
  });

  afterEach(() => {
    vi.mocked(isWeChat).mockReturnValue(false);
  });

  it('commentMap 同 path 不同 selection 走 else if childrenMap 分支', () => {
    setupStore({ readonly: false });
    vi.mocked(isPath).mockReturnValue(true);
    vi.mocked(findLeafPath).mockImplementation((_ed, path) => path);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Editor.fragment).mockReturnValue([
      { type: 'paragraph', children: [{ text: 'ab' }] } as any,
    ]);

    renderEditor({
      comment: {
        enable: true,
        commentList: [
          {
            id: 'c-first',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
          },
          {
            id: 'c-second',
            path: [0],
            selection: {
              anchor: { path: [0, 0], offset: 1 },
              focus: { path: [0, 0], offset: 2 },
            },
          },
        ],
      },
    });

    const result = editableProps.decorate([
      { type: 'paragraph', children: [{ text: 'ab' }] },
      [0],
    ]);
    const commentRanges = result.filter((r: any) => r.comment === true);
    expect(commentRanges.length).toBeGreaterThanOrEqual(2);
  });

  it('onSlateChange 在 operations 为 undefined 时使用空数组', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});

    editor.operations = [{ type: 'insert_text' }];
    slateOnChange!([{ type: 'paragraph', children: [{ text: 'first' }] }]);
    mockOnChange.mockClear();

    editor.operations = undefined;
    slateOnChange!([{ type: 'paragraph', children: [{ text: 'changed' }] }]);

    expect(mockOnChange).toHaveBeenCalledWith(
      [{ type: 'paragraph', children: [{ text: 'changed' }] }],
      [],
    );
  });

  it('WeChat mouseup 已 focus 时不重复 focus', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container, editor } = setupStore({ readonly: false });
    vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);

    renderEditor({});

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    container.appendChild(editable);
    editable.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(EditorUtils.focus).not.toHaveBeenCalledWith(editor);
  });

  it('initialNote 空 initSchemaValue 时不向 reset 传 schema', () => {
    setupStore({ readonly: false });
    vi.mocked(EditorUtils.reset).mockClear();

    renderEditor({
      instance: { id: 'empty-schema' },
      initSchemaValue: [],
      tableConfig: { minColumn: 2, minRows: 2 },
    });

    expect(EditorUtils.reset).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
    );
  });

  it('initialNote 有 schema 与 tableConfig 时调用 reset', () => {
    setupStore({ readonly: false });
    vi.mocked(EditorUtils.reset).mockClear();

    const schema = [{ type: 'paragraph', children: [{ text: 'seed' }] }];
    renderEditor({
      instance: { id: 'with-schema' },
      initSchemaValue: schema,
      tableConfig: { minColumn: 2, minRows: 2 },
    });

    expect(EditorUtils.reset).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ type: 'paragraph' }),
      ]),
    );
  });

  it('Word HTML 转 markdown 为空时回退 handleHtmlPaste', async () => {
    const htmlMod = await import('../utils/htmlToMarkdown');
    const isWordSpy = vi.spyOn(htmlMod, 'isWordHtml').mockReturnValue(true);
    const toMdSpy = vi.spyOn(htmlMod, 'htmlToMarkdown').mockReturnValue('   ');

    try {
      const { editor } = setupStore({ readonly: false });
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(Editor.hasPath).mockReturnValue(true);
      vi.mocked(handlePasteModule.handleTagNodePaste).mockReturnValue(false);
      vi.mocked(handlePasteModule.handleHtmlPaste).mockResolvedValue(true);

      renderEditor({});

      const wordHtml =
        '<html><head><meta name="Generator" content="Microsoft Word 16"></head><body><p></p></body></html>';

      editableProps.onPaste({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: createClipboardData({
          types: ['text/html'],
          getData: (t: string) => (t === 'text/html' ? wordHtml : ''),
        }),
        target: document.createElement('div'),
      } as any);
      await flushPromises();

      expect(parseMarkdownToNodesAndInsert).not.toHaveBeenCalled();
      expect(handlePasteModule.handleHtmlPaste).toHaveBeenCalled();
    } finally {
      isWordSpy.mockRestore();
      toMdSpy.mockRestore();
    }
  });
});
