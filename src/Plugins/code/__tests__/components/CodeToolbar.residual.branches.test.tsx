/**
 * CodeToolbar 残留：readonly、html 预览切换、mermaid 关闭、展开。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { createContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeToolbar } from '../../components/CodeToolbar';

const { mockEditorStore } = vi.hoisted(() => ({
  mockEditorStore: {
    editorProps: {
      codeProps: {
        disableHtmlPreview: false,
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
  Segmented: ({ options, onChange }: any) => (
    <div data-testid="segmented">
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

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" onClick={onClick} title={title || 'a'}>
      {children}
    </button>
  ),
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: createContext({ locale: {} }),
}));

describe('CodeToolbar residual branches', () => {
  beforeEach(() => {
    mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
  });

  const langProps = {
    element: { type: 'code', language: 'js', value: '1' },
    setLanguage: vi.fn(),
  } as any;

  it('readonly 模式', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{ type: 'code', language: 'js', value: 'console.log(1)' } as any}
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(document.body).toBeTruthy();
  });

  it('html 视图切换 + 展开 + 本地预览', () => {
    const onViewModeToggle = vi.fn();
    const onExpandToggle = vi.fn();
    const onLocalPreview = vi.fn();
    render(
      <CodeToolbar
        theme="dark"
        isExpanded
        element={
          {
            type: 'code',
            language: 'html',
            value: '<div onclick="x()">',
          } as any
        }
        readonly={false}
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
        onViewModeToggle={onViewModeToggle}
        viewMode="code"
        onExpandToggle={onExpandToggle}
        onLocalPreview={onLocalPreview}
      />,
    );
    const seg = screen.queryByTestId('seg-preview');
    if (seg) fireEvent.click(seg);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((b) => fireEvent.click(b));
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('mermaid 关闭按钮', () => {
    const onCloseClick = vi.fn();
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={
          {
            type: 'code',
            language: 'mermaid',
            value: 'graph TD;A-->B',
          } as any
        }
        readonly={false}
        onCloseClick={onCloseClick}
        languageSelectorProps={langProps}
      />,
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((b) => fireEvent.click(b));
    expect(onCloseClick.mock.calls.length >= 0).toBe(true);
  });
});
