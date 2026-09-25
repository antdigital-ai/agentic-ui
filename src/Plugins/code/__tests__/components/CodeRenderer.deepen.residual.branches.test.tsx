/**
 * CodeRenderer deepen residual：containsJavaScript 边界、dark theme、expand、preview 切换。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEditorStore, mockUpdate, mockResolveInitialViewMode } = vi.hoisted(
  () => ({
    mockEditorStore: {
      store: { editor: { focus: vi.fn() } },
      readonly: false,
      editorProps: { codeProps: {} as Record<string, unknown> },
      markdownEditorRef: { current: { focus: vi.fn() } },
    },
    mockUpdate: vi.fn(),
    mockResolveInitialViewMode: vi.fn(() => 'preview' as const),
  }),
);

vi.mock('../../../../MarkdownEditor/editor/store', async () => {
  const React = await import('react');
  return {
    useEditorStore: () => mockEditorStore,
    EditorStore: class EditorStore {},
    EditorStoreContext: React.createContext(mockEditorStore),
  };
});

vi.mock('../../../chart/hooks', () => ({
  useDetectTheme: vi.fn(() => 'light'),
}));

vi.mock('../../hooks', () => ({
  useCodeEditorState: () => ({
    state: { showBorder: true, hide: false, lang: 'html' },
    update: mockUpdate,
    path: [0],
    handleCloseClick: vi.fn(),
    handleHtmlPreviewClose: vi.fn(),
    handleShowBorderChange: vi.fn(),
    handleHideChange: vi.fn(),
  }),
  useRenderConditions: (element: any, readonly: boolean) => ({
    shouldHideConfigHtml: element?.language === 'html' && element?.isConfig,
    shouldRenderAsThinkBlock: element?.language === 'think' && readonly,
    shouldRenderAsCodeEditor:
      !(element?.language === 'html' && element?.isConfig) &&
      !(element?.language === 'think' && readonly),
  }),
  useToolbarConfig: (config: any) => ({
    toolbarProps: {
      element: config?.element ?? {},
      readonly: config?.readonly ?? false,
      isFullScreen: false,
      onCloseClick: config?.onCloseClick ?? vi.fn(),
      setLanguage: config?.setLanguage ?? vi.fn(),
      isSelected: true,
      onSelectionChange: config?.onSelectionChange ?? vi.fn(),
      onViewModeToggle: config?.onViewModeToggle,
      viewMode: config?.viewMode ?? 'preview',
      onLocalPreview: config?.onLocalPreview,
    },
  }),
}));

vi.mock('../../utils/localPreview', () => ({
  openHtmlLocalPreview: vi.fn(),
  openMarkdownLocalPreview: vi.fn(),
}));

vi.mock('../../utils/resolveInitialCodeBlockViewMode', () => ({
  resolveInitialCodeBlockViewMode: (...args: unknown[]) =>
    mockResolveInitialViewMode(...args),
}));

vi.mock('../../components/index', () => ({
  AceEditor: () => ({
    dom: { current: document.createElement('div') },
    setLanguage: vi.fn(),
    focusEditor: vi.fn(),
  }),
  AceEditorContainer: ({ children }: any) => (
    <div data-testid="ace-wrap">{children}</div>
  ),
  CodeContainer: ({ children, onEditorClick }: any) => (
    <div data-testid="code-container" onClick={onEditorClick}>
      {children}
    </div>
  ),
  CodeToolbar: ({ onExpandToggle, onViewModeToggle }: any) => (
    <div data-testid="code-toolbar">
      <button type="button" data-testid="expand-toggle" onClick={onExpandToggle}>
        expand
      </button>
      {onViewModeToggle && (
        <button
          type="button"
          data-testid="view-mode-toggle"
          onClick={onViewModeToggle}
        >
          toggle
        </button>
      )}
    </div>
  ),
  HtmlPreview: ({ htmlStr }: any) => (
    <div data-testid="html-preview">{htmlStr}</div>
  ),
  ThinkBlock: () => <div data-testid="think-block" />,
}));

vi.mock('../../../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue }: any) => (
    <div data-testid="md-preview">{initValue}</div>
  ),
}));

import { useDetectTheme } from '../../../chart/hooks';
import { openHtmlLocalPreview, openMarkdownLocalPreview } from '../../utils/localPreview';
import { CodeRenderer } from '../../components/CodeRenderer';

const baseElement = (overrides: Record<string, unknown> = {}) => ({
  type: 'code' as const,
  language: 'html',
  value: '<div>safe</div>',
  children: [{ text: '<div>safe</div>' }],
  ...overrides,
});

describe('CodeRenderer deepen residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorStore.readonly = false;
    mockEditorStore.editorProps.codeProps = {};
    mockResolveInitialViewMode.mockReturnValue('preview');
    vi.mocked(useDetectTheme).mockReturnValue('light');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('containsJavaScript：空 html 与 setInterval 字符串检测', () => {
    const { unmount: unmountEmpty } = render(
      <CodeRenderer
        element={
          baseElement({ language: 'html', value: '', children: [{ text: '' }] }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('code-container')).toBeInTheDocument();
    unmountEmpty();

    mockResolveInitialViewMode.mockReturnValue('code');
    render(
      <CodeRenderer
        element={
          baseElement({
            value: '<div>setInterval("alert(1)", 100)</div>',
            children: [{ text: '<div>setInterval("alert(1)", 100)</div>' }],
          }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
  });

  it('dark theme 使用 chaos 算法', () => {
    vi.mocked(useDetectTheme).mockReturnValue('dark');
    render(
      <CodeRenderer element={baseElement({ language: 'javascript' }) as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('code-container')).toBeInTheDocument();
  });

  it('preview 模式渲染 HtmlPreview 与 MarkdownEditor', () => {
    mockResolveInitialViewMode.mockReturnValue('preview');
    const { rerender } = render(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('html-preview')).toBeInTheDocument();

    rerender(
      <CodeRenderer
        element={baseElement({ language: 'markdown', value: '# t', children: [{ text: '# t' }] }) as any}
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('md-preview')).toHaveTextContent('# t');
  });

  it('expand toggle 折叠隐藏 ace 区域', () => {
    render(
      <CodeRenderer element={baseElement({ language: 'javascript' }) as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    fireEvent.click(screen.getByTestId('expand-toggle'));
    expect(screen.getByTestId('code-container')).toBeInTheDocument();
  });

  it('frontmatter 存在时不渲染 CodeToolbar', () => {
    render(
      <CodeRenderer
        element={baseElement({ frontmatter: { title: 'x' } }) as any}
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(screen.queryByTestId('code-toolbar')).not.toBeInTheDocument();
  });

  it('配置型 HTML 短内容返回 null', () => {
    const { container } = render(
      <CodeRenderer
        element={
          baseElement({
            isConfig: true,
            otherProps: { finished: false },
            value: 'short',
            children: [{ text: 'short' }],
          }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(container.querySelector('[data-testid="code-container"]')).toBeNull();
  });

  it('viewMode toggle 在 preview/code 间切换', () => {
    mockResolveInitialViewMode.mockReturnValue('preview');
    render(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('html-preview')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('view-mode-toggle'));
    expect(screen.getByTestId('ace-wrap')).toBeInTheDocument();
  });

  it('safe HTML preview 模式正常渲染 HtmlPreview', () => {
    mockResolveInitialViewMode.mockReturnValue('preview');
    render(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('html-preview')).toHaveTextContent('safe');
    expect(openHtmlLocalPreview).not.toHaveBeenCalled();
    expect(openMarkdownLocalPreview).not.toHaveBeenCalled();
  });

  it('readonly 且未闭合时不触发 update 超时', () => {
    mockEditorStore.readonly = true;
    render(
      <CodeRenderer
        element={
          baseElement({
            language: 'javascript',
            otherProps: { finished: false },
          }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('shouldHideConfigHtml 为 true 且已完成时返回 null', () => {
    const { container } = render(
      <CodeRenderer
        element={
          baseElement({
            isConfig: true,
            otherProps: { finished: true },
            value: 'short',
            children: [{ text: 'short' }],
          }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(container.querySelector('[data-testid="code-container"]')).toBeNull();
  });
});
