/**
 * BaseMarkdownEditorSlate deepen3：plugins||[]、id 空串、
 * schema||[]、commentList 路径。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../plugin';

const mocks = vi.hoisted(() => ({
  storeUpdateNodeList: vi.fn(),
  storeGetHtmlContent: vi.fn(() => '<p>html</p>'),
}));

let _slateEditorProps: Record<string, any> = {};
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
    _slateEditorProps = props;
    return (
      <div data-testid="slate-editor">{props.initSchemaValue?.length}</div>
    );
  },
}));

vi.mock('../editor/tools/ToolBar/ToolBar', () => ({
  default: () => <div data-testid="toolbar">toolbar</div>,
}));

vi.mock('../editor/tools/ToolBar/FloatBar', () => ({
  FloatBar: () => <div data-testid="float-bar" />,
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
  useStyle: () => ({ hashId: 'hash-d3' }),
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
  createEditorSelChangeSubject: () => ({
    subscribe: vi.fn(),
    next: vi.fn(),
  }),
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
    schema: null,
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

describe('BaseMarkdownEditorSlate deepen3 residual branches', () => {
  beforeEach(() => {
    _slateEditorProps = {};
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockEditorChildren = [
      { type: 'paragraph', children: [{ text: 'hello' }] },
    ];
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('plugins 缺省；id 空串', async () => {
    render(
      <BaseMarkdownEditorSlate
        id={'' as any}
        initValue="hi"
        readonly
        toc={false}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('schema null → || []；reportMode comment', async () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="x"
        readonly
        toc={false}
        comment={{ enable: true }}
        reportMode
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });
});
