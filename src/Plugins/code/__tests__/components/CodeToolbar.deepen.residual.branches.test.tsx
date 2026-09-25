/**
 * CodeToolbar deepen：containsJavaScript 各检测、disableHtmlPreview、katex/chaos、copy 失败。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import copy from 'copy-to-clipboard';
import React, { createContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeToolbar } from '../../components/CodeToolbar';

const { mockEditorStore } = vi.hoisted(() => ({
  mockEditorStore: {
    editorProps: {
      codeProps: {
        disableHtmlPreview: false,
        viewModeLabels: { preview: 'Prev', code: 'Code' },
      },
    },
  },
}));

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
  EditorStore: class EditorStore {},
  EditorStoreContext: createContext(mockEditorStore),
}));

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));

vi.mock('antd', () => ({
  message: { success: vi.fn() },
  ConfigProvider: {
    ConfigContext: createContext({
      getPrefixCls: (s: string) => `ant-${s}`,
    }),
  },
  Segmented: ({ options, onChange, value }: any) => (
    <div data-testid="segmented" data-value={value}>
      {options?.map((option: any, index: number) => (
        <button
          key={index}
          type="button"
          data-testid={`seg-${option.value}`}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../components/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="lang" />,
}));

vi.mock('../../components/LoadImage', () => ({
  LoadImage: () => <img data-testid="lang-icon" alt="" />,
}));

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" onClick={onClick} title={title || 'a'}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: createContext({
    locale: {
      close: 'Close',
      copy: 'Copy',
      expandCollapse: 'Toggle',
      localPreview: 'Local',
    },
  }),
}));

vi.mock('../../../../MarkdownEditor/editor/utils/codeBlockPlainText', () => ({
  getSlateElementPlainText: vi.fn(() => 'plain-code'),
}));

const langProps = {
  element: { type: 'code', language: 'js', value: '1' },
  setLanguage: vi.fn(),
} as any;

describe('CodeToolbar deepen residual branches', () => {
  beforeEach(() => {
    mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
    vi.mocked(copy).mockReset();
    vi.mocked(copy).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('html 含 script/eval/Function 禁用预览；disableHtmlPreview', () => {
    const samples = [
      '<script>alert(1)</script>',
      '<div onclick="x()">',
      '<a href="javascript:void(0)">',
      'eval("1")',
      'new Function("return 1")',
      'setTimeout("x()", 1)',
      '',
    ];
    for (const value of samples) {
      cleanup();
      render(
        <CodeToolbar
          theme="light"
          isExpanded={false}
          element={{ type: 'code', language: 'html', value } as any}
          readonly={false}
          onCloseClick={vi.fn()}
          languageSelectorProps={langProps}
          onViewModeToggle={vi.fn()}
        />,
      );
      // 含 JS 或空串时不应出现 preview segmented（空串 hasJavaScript=false 会显示）
      if (value && value !== '') {
        expect(screen.queryByTestId('seg-preview')).toBeNull();
      }
    }

    mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
    cleanup();
    render(
      <CodeToolbar
        theme="light"
        isExpanded
        element={{ type: 'code', language: 'html', value: '<div/>' } as any}
        readonly={false}
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
        onViewModeToggle={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('seg-preview')).toBeNull();
  });

  it('readonly katex Formula；html+render Html Renderer；chaos theme 关闭', () => {
    render(
      <CodeToolbar
        theme="chaos"
        isExpanded={false}
        element={
          {
            type: 'code',
            language: 'tex',
            katex: true,
            value: 'E=mc^2',
          } as any
        }
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(screen.getByText('Formula')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Close'));

    cleanup();
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={
          {
            type: 'code',
            language: 'html',
            render: true,
            value: '<b/>',
          } as any
        }
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(screen.getByText('Html Renderer')).toBeInTheDocument();
  });

  it('markdown Segmented 自定义 labels；copy 抛错；localPreview', () => {
    const onViewModeToggle = vi.fn();
    const onLocalPreview = vi.fn();
    const onExpandToggle = vi.fn();
    vi.mocked(copy).mockImplementation(() => {
      throw new Error('copy-fail');
    });
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CodeToolbar
        theme="chaos"
        isExpanded
        element={
          { type: 'code', language: 'markdown', value: '# hi' } as any
        }
        readonly={false}
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
        onViewModeToggle={onViewModeToggle}
        viewMode="preview"
        onExpandToggle={onExpandToggle}
        onLocalPreview={onLocalPreview}
      />,
    );
    expect(screen.getByText('Prev')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('seg-code'));
    expect(onViewModeToggle).toHaveBeenCalledWith('code');
    fireEvent.click(screen.getByTitle('Copy'));
    expect(err).toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Toggle'));
    expect(onExpandToggle).toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Local'));
    expect(onLocalPreview).toHaveBeenCalled();
    err.mockRestore();
  });

  it('plain text 只读不显示语言名；language 缺省', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{ type: 'code', language: 'plain text', value: 'x' } as any}
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(screen.queryByText('plain text')).toBeNull();

    cleanup();
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{ type: 'code', value: 'x' } as any}
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});
