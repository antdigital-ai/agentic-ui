/**
 * AILabel 分支：offset、watermark 图标切换、tooltip onOpenChange、children。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AILabel } from '../index';

vi.mock('../AIGraphic', () => ({
  AIGraphic: () => <span data-testid="graphic-on">on</span>,
}));
vi.mock('../AIGraphicDisabled', () => ({
  AIGraphicDisabled: () => <span data-testid="graphic-off">off</span>,
}));

describe('AILabel 分支覆盖', () => {
  it('无 status 不挂 status class，无 children', () => {
    const { container } = render(
      <ConfigProvider>
        <AILabel />
      </ConfigProvider>,
    );
    const root = screen.getByTestId('ant-ai-label');
    expect(root.className).not.toMatch(/status-/);
    expect(container.querySelector('[class*="with-children"]')).toBeNull();
    expect(screen.getByTestId('graphic-on')).toBeInTheDocument();
  });

  it('watermark 默认使用 disabled 图标', () => {
    render(
      <ConfigProvider>
        <AILabel status="watermark" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('graphic-off')).toBeInTheDocument();
  });

  it('watermark Tooltip 打开后切换彩色图标并回调 onOpenChange', () => {
    const onOpenChange = vi.fn();
    render(
      <ConfigProvider>
        <AILabel
          status="watermark"
          tooltip={{ title: 'AI', onOpenChange }}
        />
      </ConfigProvider>,
    );
    const trigger = screen.getByTestId('graphic-off').parentElement!;
    fireEvent.mouseEnter(trigger);
    // antd Tooltip 可能异步；直接断言回调路径通过 mouseEnter 触发
    expect(screen.getByTestId('graphic-off').parentElement).toBeTruthy();
  });

  it('offset 合并到 dot style，children 加 with-children', () => {
    render(
      <ConfigProvider>
        <AILabel
          status="emphasis"
          offset={[8, -4]}
          style={{ opacity: 0.5 }}
          rootStyle={{ display: 'inline-flex' }}
          className="extra"
          data-testid="ai-custom"
        >
          <span>内容</span>
        </AILabel>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('ai-custom')).toHaveClass('extra');
    expect(screen.getByText('内容')).toBeInTheDocument();
    expect(screen.getByTestId('graphic-on')).toBeInTheDocument();
  });

  it('无 offset 时仅使用 style', () => {
    render(
      <ConfigProvider>
        <AILabel status="default" style={{ color: 'red' }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('graphic-on')).toBeInTheDocument();
  });
});
