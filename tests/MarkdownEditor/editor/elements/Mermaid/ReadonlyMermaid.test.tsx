import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyMermaid } from '../../../../../src/MarkdownEditor/editor/elements/Mermaid/ReadonlyMermaid';

describe('ReadonlyMermaid', () => {
  const defaultProps = {
    attributes: { 'data-slate-node': 'element' },
    children: <span>graph TD A--&gt;B</span>,
    element: { type: 'mermaid', children: [], otherProps: {} },
  };

  const renderWithConfig = (element = defaultProps.element) =>
    render(
      <ConfigProvider>
        <ReadonlyMermaid
          {...defaultProps}
          element={element as any}
        />
      </ConfigProvider>,
    );

  it('应渲染 pre/code 并应用 baseCls', () => {
    renderWithConfig();
    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveClass('ant-agentic-md-editor-mermaid');
    expect(screen.getByText(/graph TD/)).toBeInTheDocument();
  });

  it('应在 element.otherProps.error 为 true 时添加 error 类名', () => {
    renderWithConfig({
      ...defaultProps.element,
      otherProps: { error: true },
    } as any);
    const pre = document.querySelector('pre');
    expect(pre).toHaveClass('ant-agentic-md-editor-mermaid-error');
  });
});
