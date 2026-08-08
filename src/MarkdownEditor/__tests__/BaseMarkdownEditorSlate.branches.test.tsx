/**
 * BaseMarkdownEditorSlate 分支覆盖：toolbar/toc/floatBar/jinja/readonly/onBlur 等渲染分支。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../plugin';

/* ---------- captured props/state ---------- */
const mocks = vi.hoisted(() => ({
  storeUpdateNodeList: vi.fn(),
  storeGetHtmlContent: vi.fn(() => '<p>html</p>'),
}));

let slateEditorProps: Record<string, any> = {};
let mockEditorChildren: any[] = [{ type: 'paragraph', children: [{ text: 'hello' }] }];

const mockEditor = {
  children: mockEditorChildren,
  selection: null,
};

vi.mock('../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: (...args: any[]) => void) => ({ run: fn, cancel: vi.fn() }),
}));

vi.mock('../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: (...args: any[]) => any) => fn,
}));

vi.mock('../Config', () => ({
  useFormulaConfig: () => ({ enable: false, singleDollarTextMath: false }),
}));

vi.mock('../editor/Editor', () => ({
  SlateMarkdownEditor: (props: Record<string, any>) => {
    slateEditorProps = props;
    return <div data-testid="slate-editor">{props.initSchemaValue?.length}</div>;
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
  useStyle: () => ({ hashId: 'hash-test' }),
}));

vi.mock('../editor/utils', () => ({
  copy: vi.fn((v: unknown) => JSON.parse(JSON.stringify(v))),
}));

vi.mock('../editor/utils/createMarkdownSlateEditor', () => ({
  createMarkdownSlateEditor: vi.fn(() => mockEditor),
  getPluginsEditorCompositionKey: vi.fn((plugins: MarkdownEditorPlugin[]) =>
    (plugins || []).map((p) => p.withEditorKey || 'default').join('|'),
  ),
}));

vi.mock('../editor/utils/editorSelChange', () => ({
  createEditorSelChangeSubject: () => ({ subscribe: vi.fn(), next: vi.fn() }),
}));

vi.mock('../editor/utils/editorUtils', () => ({
  EditorUtils: {
    p: { type: 'paragraph', children: [{ text: '' }] },
    reset: vi.fn(),
    deleteAll: vi.fn(),
    blur: vi.fn(),
    coalesceRootAllEmptyParagraphs: vi.fn((nodes: any[]) => nodes),
  },
}));

vi.mock('../editor/parser/parserMdToSchema', () => ({
  parserMdToSchema: vi.fn(() => ({
    schema: [
      { type: 'paragraph', children: [{ text: 'parsed' }] },
      { type: 'paragraph', children: [] },
      { type: 'list', children: [] },
      { type: 'listItem', children: [] },
      { type: 'heading', children: [] },
    ],
  })),
}));

vi.mock('../editor/parser/parserSlateNodeToMarkdown', () => ({
  parserSlateNodeToMarkdown: vi.fn(() => '# md'),
}));

vi.mock('../editor/utils/keyboard', () => ({
  useSystemKeyboard: vi.fn(),
  KeyboardTask: {},
  Methods: {},
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
import { parserMdToSchema } from '../editor/parser/parserMdToSchema';

describe('BaseMarkdownEditorSlate 分支覆盖', () => {
  beforeEach(() => {
    slateEditorProps = {};
    vi.clearAllMocks();
    mockEditor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toolBar.enable=true 且非 readonly 时渲染 ToolBar', () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="# hi"
        toolBar={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toHaveClass(
      'ant-agentic-md-editor-edit',
    );
  });

  it('readonly 时不渲染 ToolBar 与 InsertLink', () => {
    render(
      <BaseMarkdownEditorSlate initValue="# hi" readonly toolBar={{ enable: true }} />,
    );
    expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('insert-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('markdown-editor')).toHaveClass(
      'ant-agentic-md-editor-readonly',
    );
  });

  it('readonly 时调用 store.updateNodeList', () => {
    render(<BaseMarkdownEditorSlate initValue="# stream" readonly />);
    expect(mocks.storeUpdateNodeList).toHaveBeenCalled();
  });

  it('非 readonly 时不调用 store.updateNodeList', () => {
    render(<BaseMarkdownEditorSlate initValue="# edit" />);
    expect(mocks.storeUpdateNodeList).not.toHaveBeenCalled();
  });

  it('无 onBlur 时点击外部不抛错', () => {
    render(<BaseMarkdownEditorSlate initValue="no-blur" />);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    expect(() => fireEvent.mouseDown(outside)).not.toThrow();
    outside.remove();
  });

  it('toc=false 时不渲染 TocHeading', () => {
    render(<BaseMarkdownEditorSlate initValue="# no-toc" toc={false} />);
    expect(screen.queryByTestId('toc-heading')).not.toBeInTheDocument();
  });

  it('floatBar.enable=true 且编辑模式渲染 FloatBar', () => {
    render(
      <BaseMarkdownEditorSlate initValue="# fb" floatBar={{ enable: true }} />,
    );
    expect(screen.getByTestId('float-bar')).toHaveAttribute(
      'data-readonly',
      'false',
    );
  });

  it('readonly + reportMode 渲染 readonly FloatBar', () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="# report"
        readonly
        reportMode
        floatBar={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('float-bar')).toHaveAttribute(
      'data-readonly',
      'true',
    );
  });

  it('readonly reportMode floatBar.enable=false 不渲染 FloatBar', () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="# report"
        readonly
        reportMode
        floatBar={{ enable: false }}
      />,
    );
    expect(screen.queryByTestId('float-bar')).not.toBeInTheDocument();
  });

  it('jinja 插件开启时渲染 JinjaTemplatePanel', () => {
    const jinjaPlugin: MarkdownEditorPlugin = {
      withEditorKey: 'jinja',
      jinja: true,
      jinjaConfig: { enable: true, templatePanel: true },
    } as any;
    render(
      <BaseMarkdownEditorSlate initValue="{{ x }}" plugins={[jinjaPlugin]} />,
    );
    expect(screen.getByTestId('jinja-panel')).toBeInTheDocument();
  });

  it('jinja templatePanel=false 时不渲染 JinjaTemplatePanel', () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="{{ x }}"
        jinja={{ enable: true, templatePanel: false }}
      />,
    );
    expect(screen.queryByTestId('jinja-panel')).not.toBeInTheDocument();
  });

  it('reportMode/slideMode 添加对应 className', () => {
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="" reportMode />,
    );
    expect(screen.getByTestId('markdown-editor')).toHaveClass(
      'ant-agentic-md-editor-report',
    );
    rerender(<BaseMarkdownEditorSlate initValue="" slideMode />);
    expect(screen.getByTestId('markdown-editor')).toHaveClass(
      'ant-agentic-md-editor-slide',
    );
  });

  it('textAreaProps.enable 时不渲染 focus 占位 div', () => {
    const { container } = render(
      <BaseMarkdownEditorSlate initValue="" textAreaProps={{ enable: true }} />,
    );
    expect(
      container.querySelector('.agentic-md-editor-focus'),
    ).not.toBeInTheDocument();
  });

  it('initSchemaValue 过滤空 paragraph/list/heading', () => {
    render(<BaseMarkdownEditorSlate initValue="# filter" />);
    expect(parserMdToSchema).toHaveBeenCalled();
    expect(slateEditorProps.initSchemaValue).toBeDefined();
    expect(EditorUtils.coalesceRootAllEmptyParagraphs).toHaveBeenCalled();
  });

  it('非 readonly 且 parse 结果为空时追加空段落', () => {
    vi.mocked(parserMdToSchema).mockReturnValueOnce({ schema: [] } as any);
    render(<BaseMarkdownEditorSlate initValue="" />);
    expect(slateEditorProps.initSchemaValue).toBeDefined();
  });

  it('initSchemaValue prop 优先于 initValue 解析', () => {
    const customSchema = [
      { type: 'paragraph', children: [{ text: 'custom' }] },
    ] as any;
    render(
      <BaseMarkdownEditorSlate
        initValue="ignored"
        initSchemaValue={customSchema}
      />,
    );
    expect(slateEditorProps.initSchemaValue).toEqual(customSchema);
  });

  it('plugins 变化触发 remount 并保留 schema', async () => {
    const p1: MarkdownEditorPlugin = {
      withEditorKey: 'a',
      withEditor: (e) => e,
    };
    const p2: MarkdownEditorPlugin = {
      withEditorKey: 'b',
      withEditor: (e) => e,
    };
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="keep" plugins={[p1]} />,
    );
    const firstKey = slateEditorProps.slateRemountKey;
    rerender(
      <BaseMarkdownEditorSlate initValue="keep" plugins={[p2]} />,
    );
    await waitFor(() => {
      expect(slateEditorProps.slateRemountKey).not.toBe(firstKey);
    });
    expect(EditorUtils.reset).toHaveBeenCalled();
  });

  it('plugin remount reset 失败时 deleteAll', async () => {
    vi.mocked(EditorUtils.reset).mockImplementationOnce(() => {
      throw new Error('reset fail');
    });
    const p1: MarkdownEditorPlugin = { withEditorKey: 'x', withEditor: (e) => e };
    const p2: MarkdownEditorPlugin = { withEditorKey: 'y', withEditor: (e) => e };
    mockEditor.children = [{ type: 'paragraph', children: [{ text: 'keep' }] }];
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="x" plugins={[p1]} />,
    );
    rerender(<BaseMarkdownEditorSlate initValue="x" plugins={[p2]} />);
    await waitFor(() => expect(EditorUtils.deleteAll).toHaveBeenCalled());
  });

  it('onBlur：编辑器聚焦后点击外部触发回调', async () => {
    const onBlur = vi.fn();
    render(<BaseMarkdownEditorSlate initValue="blur" onBlur={onBlur} />);
    const container = document.querySelector(
      '.ant-agentic-md-editor-container',
    ) as HTMLDivElement;
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => container,
    });
    fireEvent.focusIn(container);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    await waitFor(() => expect(onBlur).toHaveBeenCalled());
    expect(EditorUtils.blur).toHaveBeenCalled();
    outside.remove();
  });

  it('readonly 时不注册 onBlur 点击监听', () => {
    const onBlur = vi.fn();
    render(
      <BaseMarkdownEditorSlate initValue="r" readonly onBlur={onBlur} />,
    );
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    expect(onBlur).not.toHaveBeenCalled();
    outside.remove();
  });

  it('streaming/typewriter 传入 EditorStoreContext', () => {
    render(<BaseMarkdownEditorSlate initValue="" streaming />);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('onChange 经 handleChildChange 转发（toc 开启时 debounce）', () => {
    const onChange = vi.fn();
    render(<BaseMarkdownEditorSlate initValue="# ch" onChange={onChange} />);
    slateEditorProps.onChange?.('md', [{ type: 'paragraph', children: [] }]);
    expect(onChange).toHaveBeenCalledWith('md', expect.any(Array));
  });

  it('toc=false 时 onChange 仍转发但不更新 schema state', () => {
    const onChange = vi.fn();
    render(
      <BaseMarkdownEditorSlate initValue="# ch" toc={false} onChange={onChange} />,
    );
    slateEditorProps.onChange?.('md', []);
    expect(onChange).toHaveBeenCalled();
  });
});
