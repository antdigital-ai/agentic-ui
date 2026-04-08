import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MermaidRendererImpl } from '../../../src/Plugins/mermaid/MermaidRendererImpl';

vi.mock('../../../src/Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: vi.fn(() => true),
}));

const mockUseMermaidRender = vi.fn();
vi.mock('../../../src/Plugins/mermaid/useMermaidRender', () => ({
  useMermaidRender: (...args: unknown[]) => mockUseMermaidRender(...args),
}));

vi.mock('../../../src/Plugins/mermaid/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  })),
}));

describe('MermaidRendererImpl', () => {
  const defaultElement = {
    type: 'code' as const,
    language: 'mermaid',
    value: 'graph TD\nA --> B',
    children: [{ text: '' }] as [{ text: string }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMermaidRender.mockReturnValue({
      error: '',
      renderedCode: 'graph TD\nA --> B',
    });
  });

  it('应在无 ConfigProvider 时使用默认 baseCls (line 16 fallback)', () => {
    const emptyContext = { getPrefixCls: () => '', getIconPrefixCls: () => 'anticon' };
    const { container } = render(
      <ConfigProvider.ConfigContext.Provider value={emptyContext as any}>
        <MermaidRendererImpl element={defaultElement} />
      </ConfigProvider.ConfigContext.Provider>,
    );
    expect(container.querySelector('.plugin-mermaid')).toBeInTheDocument();
  });

  it('应在 ConfigProvider 下使用 prefixCls', () => {
    const { container } = render(
      <ConfigProvider prefixCls="ant">
        <MermaidRendererImpl element={defaultElement} />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('[class*="plugin-mermaid"]'),
    ).toBeInTheDocument();
  });

  it('应在 useMermaidRender 返回 error 时渲染错误块 (line 32, 68)', () => {
    mockUseMermaidRender.mockReturnValue({
      error: 'Parse error',
      renderedCode: '',
    });

    const { container } = render(
      <MermaidRendererImpl element={{ ...defaultElement, value: 'invalid' }} />,
    );

    expect(
      container.querySelector('.plugin-mermaid-error') ||
        container.querySelector('[class*="mermaid-error"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain('invalid');
  });

  it('应在无 error 且无 renderedCode 时渲染空状态', () => {
    mockUseMermaidRender.mockReturnValue({
      error: '',
      renderedCode: '',
    });

    const { container } = render(
      <MermaidRendererImpl element={{ ...defaultElement, value: '' }} />,
    );

    expect(
      container.querySelector('.plugin-mermaid-empty') ||
        container.querySelector('[class*="mermaid-empty"]'),
    ).toBeTruthy();
  });
});
