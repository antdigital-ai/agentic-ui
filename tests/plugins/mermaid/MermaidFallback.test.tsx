import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MermaidCodePreview } from '../../../src/Plugins/mermaid/MermaidFallback';

vi.mock('../../../src/Plugins/mermaid/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  })),
}));

describe('MermaidCodePreview', () => {
  it('应展示传入的源码文本', () => {
    const code = 'graph TD\n  A --> B';
    const { container } = render(<MermaidCodePreview code={code} />);
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe(code);
  });

  it('空字符串时渲染空 pre', () => {
    const { container } = render(<MermaidCodePreview code="" />);
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe('');
  });

  it('应在 getPrefixCls 返回空时使用默认 baseCls', () => {
    const emptyPrefixClsContext = {
      getPrefixCls: () => '',
      getIconPrefixCls: () => 'anticon',
    };
    const { container } = render(
      <ConfigProvider.ConfigContext.Provider
        value={emptyPrefixClsContext as any}
      >
        <MermaidCodePreview code="pie title Test" />
      </ConfigProvider.ConfigContext.Provider>,
    );
    expect(
      container.querySelector('.agentic-plugin-mermaid-empty'),
    ).toBeInTheDocument();
  });

  it('应在 ConfigProvider 下使用 prefixCls', () => {
    const { container } = render(
      <ConfigProvider prefixCls="ant">
        <MermaidCodePreview code="graph LR\nX-->Y" />
      </ConfigProvider>,
    );
    const el =
      container.querySelector('.ant-agentic-plugin-mermaid-empty') ||
      container.querySelector('[class*="mermaid-empty"]');
    expect(el).toBeTruthy();
  });
});
