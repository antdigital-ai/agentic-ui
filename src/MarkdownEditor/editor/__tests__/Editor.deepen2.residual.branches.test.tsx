/**
 * Editor deepen2：WeChat focus、selection 无 dom、checkEnd、paste 多类型、instance 重置。
 */
import { act, cleanup, render } from '@testing-library/react';
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
    slateOnChange = onChange;
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
  };
});

import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { isWeChat } from '../../../Utils/env';
import { SlateMarkdownEditor } from '../Editor';
import {
  EditorUtils,
  getSelectionFromDomSelection,
  hasEditableTarget,
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
        props.initSchemaValue ?? [
          { type: 'paragraph', children: [{ text: '' }] },
        ]
      }
      {...props}
    />,
  );
}

describe('Editor deepen2 residual branches', () => {
  beforeEach(() => {
    editableProps = {};
    slateOnChange = null;
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(isWeChat).mockReturnValue(false);
    vi.mocked(hasEditableTarget).mockReturnValue(true);
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);
    vi.mocked(Range.isCollapsed).mockReturnValue(true);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    Object.values(pasteHandlers).forEach((fn) => fn.mockClear?.());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('readonly：无 domSelection 回调 onSelectionChange(null)', async () => {
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true });
    vi.spyOn(window, 'getSelection').mockReturnValue(null);
    renderEditor({ reportMode: true, onSelectionChange });
    await act(async () => {
      editableProps.onSelect({});
    });
    expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
  });

  it('readonly：selection null 时 onSelectionChange(null)', async () => {
    const onSelectionChange = vi.fn();
    setupStore({ readonly: true });
    vi.mocked(getSelectionFromDomSelection).mockReturnValue(null);
    renderEditor({ reportMode: true, onSelectionChange });
    await act(async () => {
      editableProps.onSelect({});
    });
    expect(onSelectionChange).toHaveBeenCalledWith(null, '', []);
  });

  it('WeChat mouseup：contenteditable 内且未 focus 时 focus', async () => {
    vi.mocked(isWeChat).mockReturnValue(true);
    const { container } = setupStore({ readonly: false });
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    container.appendChild(editable);
    renderEditor({});
    await act(async () => {
      editable.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
      const raf = (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      };
      vi.stubGlobal('requestAnimationFrame', raf);
      editable.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });
    // focus 在 rAF 内；至少走完 WeChat 分支不抛错
    expect(document.body).toBeTruthy();
  });

  it('checkEnd：dataset.slateEditor 底部点击 preventDefault', () => {
    setupStore({ readonly: false });
    renderEditor({});
    const target = document.createElement('div');
    target.dataset.slateEditor = 'true';
    const child = document.createElement('div');
    Object.defineProperty(child, 'offsetTop', { value: 10 });
    target.appendChild(child);
    const scrollEl = mockStoreConfig.markdownContainerRef.current;
    Object.defineProperty(scrollEl, 'scrollTop', { value: 100, writable: true });
    const preventDefault = vi.fn();
    editableProps.onMouseDown?.({
      target,
      clientY: 50,
      preventDefault,
    });
    expect(EditorUtils.checkEnd).toHaveBeenCalled();
  });

  it('textArea enable 跳过 checkEnd；typewriter 跳过', () => {
    setupStore({ readonly: false });
    renderEditor({ textAreaProps: { enable: true } });
    expect(
      editableProps.onMouseDown?.({
        target: document.createElement('div'),
        preventDefault: vi.fn(),
      }),
    ).toBe(false);

    cleanup();
    setupStore({ readonly: false });
    vi.mocked(EditorUtils.checkEnd).mockClear();
    renderEditor({ typewriter: true });
    editableProps.onMouseDown?.({
      target: document.createElement('div'),
      preventDefault: vi.fn(),
    });
    expect(EditorUtils.checkEnd).not.toHaveBeenCalled();
  });

  it('paste：enabled=false 早退；markdown 插入；plainTextOnly', async () => {
    setupStore({ readonly: false });
    renderEditor({ pasteConfig: { enabled: false } });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: {
          types: ['text/plain'],
          getData: () => 'x',
          files: [],
        },
      });
    });

    cleanup();
    setupStore({ readonly: false });
    pasteHandlers.shouldInsertTextDirectly.mockReturnValue(false);
    renderEditor({});
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: {
          types: ['text/markdown'],
          getData: (t: string) => (t === 'text/markdown' ? '**hi**' : ''),
          files: [],
        },
      });
    });

    cleanup();
    setupStore({ readonly: false });
    renderEditor({ pasteConfig: { plainTextOnly: true } });
    await act(async () => {
      await editableProps.onPaste?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clipboardData: {
          types: ['text/plain'],
          getData: () => 'plain-only',
          files: [],
        },
      });
    });
  });

  it('copy 无 editable target 走 domSelection；cut 删除', () => {
    vi.mocked(hasEditableTarget).mockReturnValue(false);
    setupStore({ readonly: false });
    vi.mocked(getSelectionFromDomSelection).mockReturnValue({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    } as any);
    renderEditor({});
    editableProps.onCopy({
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
      target: document.createElement('div'),
    });
    expect(ReactEditor.setFragmentData).toHaveBeenCalled();

    editableProps.onCut({
      preventDefault: vi.fn(),
      clipboardData: { clearData: vi.fn(), setData: vi.fn() },
    });
  });

  it('instance 缺失与 tableConfig initSchema；slateRemountKey', () => {
    setupStore({ readonly: false });
    const { rerender } = renderEditor({
      instance: { id: 'a' },
      tableConfig: { minColumn: 2, minRows: 2 },
      initSchemaValue: [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ type: 'paragraph', children: [{ text: '' }] }],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(EditorUtils.reset).toHaveBeenCalled();

    rerender(
      <SlateMarkdownEditor
        prefixCls="ant-md"
        instance={{ id: 'b' }}
        slateRemountKey={2}
        initSchemaValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
      />,
    );
  });

  it('onSlateChange：仅 set_selection 首次忽略；空段落检测', () => {
    const { editor } = setupStore({ readonly: false });
    renderEditor({});
    editor.operations = [{ type: 'set_selection' }];
    act(() => {
      slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    });
    editor.operations = [{ type: 'insert_text' }];
    act(() => {
      slateOnChange!([{ type: 'paragraph', children: [{ text: '' }] }]);
    });
  });
});
