import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('应在工具栏触发滚轮时跳过缩放拦截', () => {
    const { container } = render(<MermaidRendererImpl element={defaultElement} />);
    const toolbar = container.querySelector('[data-mermaid-toolbar]') as HTMLElement;

    expect(toolbar).toBeInTheDocument();

    const wheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -120,
      clientX: 64,
      clientY: 64,
    });
    toolbar.dispatchEvent(wheelEvent);

    expect(wheelEvent.defaultPrevented).toBe(false);
  });

  it('应允许工具栏网格按钮切换背景网格状态', () => {
    const { container } = render(<MermaidRendererImpl element={defaultElement} />);
    const viewport = container.querySelector(
      '[data-mermaid-viewport="true"]',
    ) as HTMLElement;

    expect(viewport).toHaveAttribute('data-mermaid-grid', 'true');

    fireEvent.click(screen.getByRole('button', { name: '隐藏背景网格' }));
    expect(viewport).toHaveAttribute('data-mermaid-grid', 'false');
    expect(
      screen.getByRole('button', { name: '显示背景网格' }),
    ).toBeInTheDocument();
  });

  it('应避免工具栏触发拖拽态', () => {
    const { container } = render(<MermaidRendererImpl element={defaultElement} />);
    const viewport = container.querySelector(
      '[data-mermaid-viewport="true"]',
    ) as HTMLElement;
    const toolbar = container.querySelector('[data-mermaid-toolbar]') as HTMLElement;

    expect(viewport).toHaveAttribute('data-mermaid-panning', 'false');

    fireEvent.pointerDown(toolbar, {
      button: 0,
      clientX: 20,
      clientY: 20,
      pointerId: 1,
    });
    expect(viewport).toHaveAttribute('data-mermaid-panning', 'false');
  });
});
