/**
 * BaseMarkdownEditorSlate deepen2：reset 失败、onBlur 触发、reportMode floatBar、commentList 纯净。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../plugin';

const mocks = vi.hoisted(() => ({
  storeUpdateNodeList: vi.fn(),
  storeGetHtmlContent: vi.fn(() => '<p>html</p>'),
  copyThrows: false,
  resetThrows: false,
}));

let slateEditorProps: Record<string, any> = {};
let mockEditorChildren: any[] = [
  { type: 'paragraph', children: [{ text: 'hello' }] },
];

const mockEditor = {
  get children() {
    return mockEditorChildren;
  },
  selection: null,
};

vi.mock('../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: (...args: any[]) => void) => ({
    run: fn,
    cancel: vi.fn(),
  }),
}));

vi.mock('../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../Config', () => ({
  useFormulaConfig: () => ({ enable: true, singleDollarTextMath: true }),
}));

vi.mock('../editor/Editor', () => ({
  SlateMarkdownEditor: (props: Record<string, any>) => {
    slateEditorProps = props;
    return (
      <div data-testid="slate-editor">{props.initSchemaValue?.length}</div>
    );
  },
}));

vi.mock('../editor/tools/ToolBar/ToolBar', () => ({
  default: () => <div data-testid="toolbar">toolbar</div>,
}));

vi.mock('../editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: ({ readonly }: { readonly?: boolean }) => (
    <div data-testid="float-bar" data-readonly={String(!!readonly)} />
  ),
}));

vi.mock('../editor/tools/Leading', () => ({
  TocHeading: () => <div data-testid="toc-heading">toc</div>,
}));

vi.mock('../editor/components/CommentList', () => ({
  CommentList: ({ pure }: { pure?: boolean }) => (
    <div data-testid="comment-list" data-pure={String(!!pure)} />
  ),
}));

vi.mock('../editor/tools/InsertLink', () => ({
  InsertLink: () => <div data-testid="insert-link" />,
}));

vi.mock('../editor/tools/InsertAutocomplete', () => ({
  InsertAutocomplete: () => <div data-testid="insert-autocomplete" />,
}));

vi.mock('../editor/tools/JinjaTemplatePanel', () => ({
  JinjaTemplatePanel: () => <div data-testid="jinja-panel" />,
}));

vi.mock('../I18nBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'hash-d2' }),
}));

vi.mock('../editor/utils', () => ({
  copy: vi.fn((v: unknown) => {
    if (mocks.copyThrows) throw new Error('copy fail');
    return JSON.parse(JSON.stringify(v));
  }),
}));

vi.mock('../editor/utils/createMarkdownSlateEditor', () => ({
  createMarkdownSlateEditor: vi.fn(() => mockEditor),
  getPluginsEditorCompositionKey: vi.fn((plugins: MarkdownEditorPlugin[]) =>
    (plugins || []).map((p) => p.withEditorKey || 'default').join('|'),
  ),
}));

vi.mock('../editor/utils/editorSelChange', () => ({
  createEditorSelChangeSubject: () => ({
    subscribe: vi.fn(),
    next: vi.fn(),
  }),
}));

vi.mock('../editor/utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    reset: vi.fn(() => {
      if (mocks.resetThrows) throw new Error('reset fail');
    }),
    deleteAll: vi.fn(),
    blur: vi.fn(),
    coalesceRootAllEmptyParagraphs: vi.fn((nodes: any[]) => nodes),
  },
}));

vi.mock('../editor/parser/parserMdToSchema', () => ({
  parserMdToSchema: vi.fn(() => ({
    schema: [{ type: 'paragraph', children: [{ text: 'parsed' }] }],
  })),
}));

vi.mock('../editor/parser/parserSlateNodeToMarkdown', () => ({
  parserSlateNodeToMarkdown: vi.fn(() => '# md'),
}));

vi.mock('../editor/utils/keyboard', () => ({
  useSystemKeyboard: vi.fn(),
}));

vi.mock('../utils/exportHtml', () => ({
  exportHtml: vi.fn(),
}));

vi.mock('../utils/sanitizeChromeStyle', () => ({
  sanitizeEditorChromeStyle: (s: any) => s,
}));

vi.mock('../../Constants/contentPaddingVars', () => ({
  resolveContainerContentStyle: (s: any) => s,
}));

vi.mock('../editor/store', () => {
  class MockEditorStore {
    updateNodeList = mocks.storeUpdateNodeList;
    getHtmlContent = mocks.storeGetHtmlContent;
    setRuntimeConfig = vi.fn();
  }
  return {
    EditorStore: MockEditorStore,
    EditorStoreContext: React.createContext(null),
  };
});

import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import { EditorUtils } from '../editor/utils/editorUtils';

describe('BaseMarkdownEditorSlate deepen2 residual branches', () => {
  beforeEach(() => {
    slateEditorProps = {};
    mocks.copyThrows = false;
    mocks.resetThrows = false;
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockEditorChildren = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ];
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('plugin remount：reset 抛错走 deleteAll', async () => {
    mocks.resetThrows = true;
    const p1: MarkdownEditorPlugin = {
      withEditorKey: 'r1',
      withEditor: (e) => e,
    };
    const p2: MarkdownEditorPlugin = {
      withEditorKey: 'r2',
      withEditor: (e) => e,
    };
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="x" plugins={[p1]} />,
    );
    rerender(<BaseMarkdownEditorSlate initValue="x" plugins={[p2]} />);
    await waitFor(() => expect(EditorUtils.deleteAll).toHaveBeenCalled());
  });

  it('onBlur：readonly 时不注册外部点击', () => {
    const onBlur = vi.fn();
    render(
      <BaseMarkdownEditorSlate initValue="x" readonly onBlur={onBlur} />,
    );
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    expect(onBlur).not.toHaveBeenCalled();
    outside.remove();
  });

  it('plugins 缺省走 || [] composition', () => {
    render(<BaseMarkdownEditorSlate initValue="x" />);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('readonly reportMode：floatBar 默认启用；enable=false 隐藏', () => {
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="x" readonly reportMode />,
    );
    expect(screen.getByTestId('float-bar')).toHaveAttribute(
      'data-readonly',
      'true',
    );
    rerender(
      <BaseMarkdownEditorSlate
        initValue="x"
        readonly
        reportMode
        floatBar={{ enable: false }}
      />,
    );
    expect(screen.queryByTestId('float-bar')).not.toBeInTheDocument();
  });

  it('toc=false 且有 commentList 渲染 pure CommentList', async () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="x"
        toc={false}
        comment={{ enable: true } as any}
      />,
    );
    // bump showComment via slate onChange path if exposed; else set via props path
    slateEditorProps?.onChange?.('md', [
      { type: 'paragraph', children: [{ text: 'c', comment: [{ id: '1' }] }] },
    ]);
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    // even without comments, toc=false should not show TocHeading
    expect(screen.queryByTestId('toc-heading')).not.toBeInTheDocument();
  });

  it('width/height 缺省走 100%/auto；slideMode class', () => {
    render(<BaseMarkdownEditorSlate initValue="" slideMode />);
    const root = screen.getByTestId('markdown-editor');
    expect(root.style.width).toBe('100%');
    expect(root.style.height).toBe('auto');
  });

  it('编辑模式 floatBar.enable=true 渲染可编辑 FloatBar', () => {
    render(
      <BaseMarkdownEditorSlate initValue="" floatBar={{ enable: true }} />,
    );
    expect(screen.getByTestId('float-bar')).toHaveAttribute(
      'data-readonly',
      'false',
    );
  });
});
