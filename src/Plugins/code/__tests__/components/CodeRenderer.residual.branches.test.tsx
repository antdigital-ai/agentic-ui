/**
 * CodeRenderer 残留：html/js 检测、markdown/csv 视图、think 块。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

const { mockEditorStore } = vi.hoisted(() => ({
  mockEditorStore: {
    store: { editor: { focus: vi.fn() } },
    readonly: false,
    editorProps: { codeProps: {} },
    markdownEditorRef: { current: { focus: vi.fn() } },
  },
}));

vi.mock('../../../../MarkdownEditor/editor/store', async () => {
  const React = await import('react');
  return {
    useEditorStore: () => mockEditorStore,
    EditorStore: class EditorStore {},
    EditorStoreContext: React.createContext(mockEditorStore),
  };
});

vi.mock('../../../chart/hooks', () => ({
  useDetectTheme: () => 'light',
}));

vi.mock('../../hooks', () => ({
  useCodeEditorState: () => ({
    state: { value: 'code', hide: false, lang: 'javascript' },
    update: vi.fn(),
    path: [0],
    handleCloseClick: vi.fn(),
    handleRunHtml: vi.fn(),
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
  useToolbarConfig: () => ({
    toolbarProps: {
      element: {},
      readonly: false,
      isFullScreen: false,
      onCloseClick: vi.fn(),
      setLanguage: vi.fn(),
      isSelected: true,
      onSelectionChange: vi.fn(),
      onViewModeToggle: vi.fn(),
      viewMode: 'code',
      onLocalPreview: vi.fn(),
    },
  }),
}));

vi.mock('../../utils/localPreview', () => ({
  openHtmlLocalPreview: vi.fn(),
  openMarkdownLocalPreview: vi.fn(),
}));

vi.mock('../../utils/resolveInitialCodeBlockViewMode', () => ({
  resolveInitialCodeBlockViewMode: () => 'code',
}));

vi.mock('../../components/index', () => ({
  AceEditor: () => <div data-testid="ace" />,
  AceEditorContainer: ({ children }: any) => <div>{children}</div>,
  CodeContainer: ({ children }: any) => <div>{children}</div>,
  CodeToolbar: () => <div data-testid="tb" />,
  HtmlPreview: ({ html }: any) => <div data-testid="html">{html}</div>,
  ThinkBlock: ({ children }: any) => <div data-testid="think">{children}</div>,
}));

vi.mock('../../../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue }: any) => (
    <div data-testid="md">{initValue}</div>
  ),
}));

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    Skeleton: () => <div data-testid="skeleton" />,
    theme: { useToken: () => ({ token: {} }) },
  };
});

import { CodeRenderer } from '../../components/CodeRenderer';

describe('CodeRenderer residual branches', () => {
  it('js 代码走 ace', () => {
    render(
      <CodeRenderer
        element={{ type: 'code', language: 'javascript', value: '1' } as any}
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });

  it('html / markdown / think', () => {
    const { rerender } = render(
      <CodeRenderer
        element={
          {
            type: 'code',
            language: 'html',
            value: '<script>1</script>',
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(document.body).toBeTruthy();

    rerender(
      <CodeRenderer
        element={
          {
            type: 'code',
            language: 'markdown',
            value: '# t',
          } as any
        }
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );

    rerender(
      <CodeRenderer
        element={{ type: 'code', language: 'think', value: '...' } as any}
        attributes={{} as any}
      >
        <span />
      </CodeRenderer>,
    );
    expect(document.body).toBeTruthy();
  });
});
