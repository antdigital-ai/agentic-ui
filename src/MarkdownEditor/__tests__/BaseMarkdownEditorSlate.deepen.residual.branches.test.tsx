/**
 * BaseMarkdownEditorSlate deepen residual：plugin remount 失败、jinja 组合、comment/toc 分支。
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
}));

let slateEditorProps: Record<string, any> = {};
let mockEditorChildren: any[] = [{ type: 'paragraph', children: [{ text: 'hello' }] }];

const mockEditor = {
  get children() {
    return mockEditorChildren;
  },
  selection: null,
};

vi.mock('../Hooks/useDebounceFn', () => ({
  useDebounceFn: (fn: (...args: any[]) => void) => ({ run: fn, cancel: vi.fn() }),
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
import { copy } from '../editor/utils';

describe('BaseMarkdownEditorSlate deepen residual branches', () => {
  beforeEach(() => {
    slateEditorProps = {};
    mocks.copyThrows = false;
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockEditorChildren = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('plugin remount：copy 失败时不保留 schema', async () => {
    mocks.copyThrows = true;
    const p1: MarkdownEditorPlugin = { withEditorKey: 'a', withEditor: (e) => e };
    const p2: MarkdownEditorPlugin = { withEditorKey: 'b', withEditor: (e) => e };
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="x" plugins={[p1]} />,
    );
    rerender(<BaseMarkdownEditorSlate initValue="x" plugins={[p2]} />);
    await waitFor(() => expect(copy).toHaveBeenCalled());
    expect(EditorUtils.reset).not.toHaveBeenCalled();
  });

  it('plugin remount：preservedSchema 空数组时不 reset', async () => {
    mockEditorChildren = [];
    const p1: MarkdownEditorPlugin = { withEditorKey: 'e1', withEditor: (e) => e };
    const p2: MarkdownEditorPlugin = { withEditorKey: 'e2', withEditor: (e) => e };
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="x" plugins={[p1]} />,
    );
    rerender(<BaseMarkdownEditorSlate initValue="x" plugins={[p2]} />);
    await waitFor(() => expect(EditorUtils.reset).not.toHaveBeenCalled());
  });

  it('jinja 插件无 jinjaConfig 时仍启用 templatePanel', () => {
    const plugin: MarkdownEditorPlugin = { jinja: true, withEditorKey: 'j' } as any;
    render(<BaseMarkdownEditorSlate initValue="{{ x }}" plugins={[plugin]} />);
    expect(screen.getByTestId('jinja-panel')).toBeInTheDocument();
  });

  it('props.jinja 直接配置 templatePanel 对象 enable=false', () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="{{ x }}"
        jinja={{ enable: true, templatePanel: { enable: false } }}
      />,
    );
    expect(screen.queryByTestId('jinja-panel')).not.toBeInTheDocument();
  });

  it('typewriter 别名 streaming 传入 context', () => {
    render(<BaseMarkdownEditorSlate initValue="" typewriter />);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });

  it('id=0 时不设置 id 属性', () => {
    render(<BaseMarkdownEditorSlate initValue="" id={0 as any} />);
    expect(screen.getByTestId('markdown-editor')).not.toHaveAttribute('id');
  });

  it('children 插槽渲染', () => {
    render(
      <BaseMarkdownEditorSlate initValue="">
        <div data-testid="child-slot">slot</div>
      </BaseMarkdownEditorSlate>,
    );
    expect(screen.getByTestId('child-slot')).toBeInTheDocument();
  });

  it('onBlur：未 focus 时点击外部不触发', () => {
    const onBlur = vi.fn();
    render(<BaseMarkdownEditorSlate initValue="x" onBlur={onBlur} />);
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    fireEvent.mouseDown(outside);
    expect(onBlur).not.toHaveBeenCalled();
    outside.remove();
  });

  it('readonly + initValue 变化触发 updateNodeList', async () => {
    const { rerender } = render(
      <BaseMarkdownEditorSlate initValue="# a" readonly />,
    );
    mocks.storeUpdateNodeList.mockClear();
    rerender(<BaseMarkdownEditorSlate initValue="# b" readonly />);
    await waitFor(() => expect(mocks.storeUpdateNodeList).toHaveBeenCalled());
  });

  it('initValue 无 initSchemaValue 时使用 copy(EditorUtils.p)', () => {
    render(<BaseMarkdownEditorSlate />);
    expect(copy).toHaveBeenCalled();
    expect(slateEditorProps.initSchemaValue).toBeDefined();
  });

  it('toolBar.enable 非 true 时不渲染 toolbar', () => {
    render(
      <BaseMarkdownEditorSlate initValue="" toolBar={{ enable: false as any }} />,
    );
    expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
  });

  it('floatBar enable 非 true 编辑模式不渲染', () => {
    render(
      <BaseMarkdownEditorSlate initValue="" floatBar={{ enable: false }} />,
    );
    expect(screen.queryByTestId('float-bar')).not.toBeInTheDocument();
  });

  it('debounced schema：toc 开启时 onChange 触发 debounce', async () => {
    const onChange = vi.fn();
    render(<BaseMarkdownEditorSlate initValue="# t" onChange={onChange} toc />);
    slateEditorProps.onChange?.('md', [{ type: 'head', children: [{ text: 'H' }] }]);
    expect(onChange).toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
  });
});
