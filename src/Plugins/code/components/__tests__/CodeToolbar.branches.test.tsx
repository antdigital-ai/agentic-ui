import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeToolbar } from '../CodeToolbar';

vi.mock('../../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    editorProps: { codeProps: {} },
  }),
}));

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));

const langProps = {
  element: { type: 'code', language: 'js', value: 'x', children: [{ text: '' }] },
  setLanguage: vi.fn(),
  containerRef: { current: null },
} as any;

describe('CodeToolbar 分支覆盖', () => {
  it('readonly 显示语言；isExpanded 底边框', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded
        element={{ type: 'code', language: 'typescript', value: 'a', children: [{ text: '' }] } as any}
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
    expect(screen.getByText(/typescript|ts/i)).toBeTruthy();
  });

  it('html 含 script 禁用预览切换', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{
          type: 'code',
          language: 'html',
          value: '<script>alert(1)</script>',
          children: [{ text: '' }],
        } as any}
        readonly={false}
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
        onViewModeToggle={vi.fn()}
        viewMode="code"
      />,
    );
    expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
  });

  it('html 含 onclick / javascript: / eval 检测', () => {
    const cases = [
      '<div onclick="x()">',
      '<a href="javascript:void(0)">',
      'eval("1")',
      'Function("return 1")',
      'setTimeout("x", 1)',
    ];
    for (const value of cases) {
      const { unmount } = render(
        <CodeToolbar
          theme="dark"
          isExpanded={false}
          element={{ type: 'code', language: 'HTML', value, children: [{ text: '' }] } as any}
          readonly
          onCloseClick={vi.fn()}
          languageSelectorProps={langProps}
        />,
      );
      expect(screen.getByTestId('code-toolbar')).toBeTruthy();
      unmount();
    }
  });

  it('非 html 语言 hasJavaScript=false；空 value', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{ type: 'code', language: 'js', value: '', children: [{ text: '' }] } as any}
        readonly
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
      />,
    );
    expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
  });

  it('复制按钮可点击；mermaid 显示关闭', () => {
    render(
      <CodeToolbar
        theme="light"
        isExpanded={false}
        element={{
          type: 'code',
          language: 'mermaid',
          value: 'graph TD\nA-->B',
          children: [{ text: '' }],
        } as any}
        readonly={false}
        onCloseClick={vi.fn()}
        languageSelectorProps={langProps}
        onExpandToggle={vi.fn()}
        onLocalPreview={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
  });

  it('危险 HTML 模式串：on*/javascript:/eval/Function/setTimeout', () => {
    const cases = [
      '<div onclick="x()">',
      '<a href="javascript:alert(1)">',
      'eval("x")',
      'Function("return 1")()',
      'setTimeout("x", 1)',
    ];
    for (const value of cases) {
      const { unmount } = render(
        <CodeToolbar
          theme="dark"
          isExpanded={false}
          element={
            {
              type: 'code',
              language: 'html',
              value,
              children: [{ text: '' }],
            } as any
          }
          readonly={false}
          onCloseClick={vi.fn()}
          languageSelectorProps={langProps}
        />,
      );
      expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
      unmount();
    }
  });
});
