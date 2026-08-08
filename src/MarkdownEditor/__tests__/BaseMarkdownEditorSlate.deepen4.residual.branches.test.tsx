/**
 * BaseMarkdownEditorSlate deepen4：plugins/children/filtered ||[]、
 * id 空串、props||{}、CommentList 双路径。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorPlugin } from '../plugin';

const mocks = vi.hoisted(() => ({
  storeUpdateNodeList: vi.fn(),
  storeGetHtmlContent: vi.fn(() => '<p>html</p>'),
  copyReturnsNull: false,
  EditorStoreContext: null as React.Context<any> | null,
}));

let _slateEditorProps: Record<string, any> = {};
let mockEditorChildren: any = [
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

vi.mock('../editor/store', () => {
  const ReactActual = require('react') as typeof React;
  const EditorStoreContext = ReactActual.createContext(null);
  mocks.EditorStoreContext = EditorStoreContext;
  class MockEditorStore {
    updateNodeList = mocks.storeUpdateNodeList;
    getHtmlContent = mocks.storeGetHtmlContent;
    setRuntimeConfig = vi.fn();
  }
  return {
    EditorStore: MockEditorStore,
    EditorStoreContext,
  };
});

vi.mock('../editor/Editor', () => ({
  SlateMarkdownEditor: (props: Record<string, any>) => {
    _slateEditorProps = props;
    const ReactActual = require('react') as typeof React;
    const ctx = ReactActual.useContext(mocks.EditorStoreContext as any);
    return (
      <div data-testid="slate-editor">
        <button
          type="button"
          data-testid="bump-comments"
          onClick={() =>
            ctx?.setShowComment?.([
              {
                id: 'c1',
                content: 'hi',
                path: [0, 0],
                selection: null,
                time: Date.now(),
              },
            ])
          }
        >
          bump
        </button>
        {props.initSchemaValue?.length}
      </div>
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
  useStyle: () => ({ hashId: 'hash-d4' }),
}));

vi.mock('../editor/utils', () => ({
  copy: vi.fn((v: unknown) => {
    if (mocks.copyReturnsNull) return null;
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

import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import { EditorUtils } from '../editor/utils/editorUtils';
import { parserSlateNodeToMarkdown } from '../editor/parser/parserSlateNodeToMarkdown';

describe('BaseMarkdownEditorSlate deepen4 residual branches', () => {
  beforeEach(() => {
    _slateEditorProps = {};
    mocks.copyReturnsNull = false;
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

  it('plugins 缺省 ||[]；id 空串 → String||undefined', async () => {
    render(
      <BaseMarkdownEditorSlate
        id={'' as any}
        initValue="hi"
        plugins={undefined}
        toc={false}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });

  it('filtered：copy null → schema?.filter || []', async () => {
    mocks.copyReturnsNull = true;
    render(
      <BaseMarkdownEditorSlate initValue="" readonly toc={false} />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    expect(EditorUtils.coalesceRootAllEmptyParagraphs).toHaveBeenCalled();
  });

  it('onBlur：children falsy 走 || []', async () => {
    const onBlur = vi.fn();
    mockEditorChildren = null;
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
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(parserSlateNodeToMarkdown).toHaveBeenCalledWith(
      [],
      '',
      [],
      undefined,
    );
    expect(onBlur).toHaveBeenCalled();
    outside.remove();
  });

  it('toc 开启 + commentList → CommentList 非 pure', async () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="x"
        toc
        comment={{ enable: true } as any}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    fireEvent.click(screen.getByTestId('bump-comments'));
    expect(screen.getByTestId('comment-list')).toHaveAttribute(
      'data-pure',
      'false',
    );
  });

  it('toc=false + commentList → pure CommentList', async () => {
    render(
      <BaseMarkdownEditorSlate
        initValue="x"
        toc={false}
        comment={{ enable: true } as any}
      />,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    fireEvent.click(screen.getByTestId('bump-comments'));
    expect(screen.getByTestId('comment-list')).toHaveAttribute(
      'data-pure',
      'true',
    );
  });

  it('无 jinja：editorProps 走 props||{} 真值臂', () => {
    render(<BaseMarkdownEditorSlate initValue="x" toc={false} />);
    expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
  });
});
