import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MermaidRendererImpl } from '../MermaidRendererImpl';

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: vi.fn(() => true),
}));

vi.mock('../../../I18n', () => ({
  useLocale: () => ({
    copy: '复制',
    download: '下载',
  }),
}));

const mockUseMermaidRender = vi.fn();
vi.mock('../useMermaidRender', () => ({
  useMermaidRender: (...args: unknown[]) => mockUseMermaidRender(...args),
}));

vi.mock('../style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
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
    const emptyContext = {
      getPrefixCls: () => '',
      getIconPrefixCls: () => 'anticon',
    };
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

  it('渲染成功后应展示复制与下载工具栏', () => {
    render(<MermaidRendererImpl element={defaultElement} />);
    expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下载' })).toBeInTheDocument();
  });

  it('点击复制应写入 Mermaid 源码', () => {
    render(<MermaidRendererImpl element={defaultElement} />);
    fireEvent.click(screen.getByRole('button', { name: '复制' }));
    expect(vi.mocked(copy)).toHaveBeenCalledWith(defaultElement.value);
  });

  it('无 SVG 时点击下载不应抛错', () => {
    render(<MermaidRendererImpl element={defaultElement} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: '下载' }));
    }).not.toThrow();
  });

  it('有 SVG 时应触发下载链', () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock');
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});

    const { container } = render(
      <MermaidRendererImpl element={defaultElement} />,
    );
    const diagram = container.querySelector('[data-mermaid-container="true"]');
    expect(diagram).toBeTruthy();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-mermaid-svg', 'true');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '10');
    rect.setAttribute('height', '10');
    svg.appendChild(rect);
    diagram!.appendChild(svg);

    fireEvent.click(screen.getByRole('button', { name: '下载' }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});
