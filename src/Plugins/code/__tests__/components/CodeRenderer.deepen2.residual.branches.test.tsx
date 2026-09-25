/**
 * CodeRenderer deepen2：viewMode 切换、local preview md/html、禁用 preview 强制 code。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  CodeContainer: ({ children }: any) => (
    <div data-testid="code-container">{children}</div>
  ),
  CodeToolbar: ({ onViewModeToggle, onLocalPreview }: any) => (
    <div data-testid="code-toolbar">
      {onViewModeToggle && (
        <button
          type="button"
          data-testid="view-mode-toggle"
          onClick={onViewModeToggle}
        >
          toggle
        </button>
      )}
      {onLocalPreview && (
        <button
          type="button"
          data-testid="local-preview"
          onClick={onLocalPreview}
        >
          local
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

import {
  openHtmlLocalPreview,
  openMarkdownLocalPreview,
} from '../../utils/localPreview';
import { CodeRenderer } from '../../components/CodeRenderer';

const baseElement = (overrides: Record<string, unknown> = {}) => ({
  type: 'code' as const,
  language: 'html',
  value: '<div>safe</div>',
  children: [{ text: '<div>safe</div>' }],
  ...overrides,
});

describe('CodeRenderer deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    mockEditorStore.readonly = false;
    mockEditorStore.editorProps.codeProps = {};
    mockResolveInitialViewMode.mockReturnValue('preview');
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('preview↔code 双切', () => {
    render(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('html-preview')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('view-mode-toggle'));
    expect(screen.getByTestId('ace-wrap')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('view-mode-toggle'));
    expect(screen.getByTestId('html-preview')).toBeInTheDocument();
  });

  it('local preview：markdown / html', () => {
    const { rerender } = render(
      <CodeRenderer
        element={
          baseElement({
            language: 'markdown',
            value: '# hi',
            children: [{ text: '# hi' }],
          }) as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    fireEvent.click(screen.getByTestId('local-preview'));
    expect(openMarkdownLocalPreview).toHaveBeenCalled();

    rerender(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    fireEvent.click(screen.getByTestId('local-preview'));
    expect(openHtmlLocalPreview).toHaveBeenCalled();
  });

  it('disableHtmlPreview：preview 初始强制切到 code', () => {
    mockEditorStore.editorProps.codeProps = { disableHtmlPreview: true };
    mockResolveInitialViewMode.mockReturnValue('preview');
    render(
      <CodeRenderer element={baseElement() as any} attributes={{} as any}>
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('ace-wrap')).toBeInTheDocument();
    expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
  });
});
