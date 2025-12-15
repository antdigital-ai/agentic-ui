import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChartContainer from '../../../../src/Plugins/chart/components/ChartContainer/ChartContainer';

describe('ChartContainer', () => {
  it('应该正确渲染基础容器', () => {
    render(
      <ChartContainer baseClassName="test-chart">
        <div data-testid="chart-content">图表内容</div>
      </ChartContainer>,
    );

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('应该应用浅色主题样式类名', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart" theme="light">
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).toContain('light-theme');
  });

  it('应该应用深色主题样式类名', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart" theme="dark">
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).toContain('dark-theme');
  });

  it('应该应用移动端样式类名', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart" isMobile={true}>
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).toContain('mobile');
  });

  it('应该应用桌面端样式类名', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart" isMobile={false}>
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).toContain('desktop');
  });

  it('应该组合多个样式类名', () => {
    const { container } = render(
      <ChartContainer
        baseClassName="test-chart"
        theme="light"
        isMobile={true}
        className="custom-class"
      >
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).toContain('test-chart');
    expect(chartContainer.className).toContain('light-theme');
    expect(chartContainer.className).toContain('mobile');
    expect(chartContainer.className).toContain('custom-class');
  });

  it('应该传递自定义样式', () => {
    const customStyle = { width: '500px', height: '300px' };
    const { container } = render(
      <ChartContainer baseClassName="test-chart" style={customStyle}>
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.style.width).toBe('500px');
    expect(chartContainer.style.height).toBe('300px');
  });

  it('应该传递其他HTML属性', () => {
    const { container } = render(
      <ChartContainer
        baseClassName="test-chart"
        data-testid="chart-container"
        role="region"
      >
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.getAttribute('data-testid')).toBe('chart-container');
    expect(chartContainer.getAttribute('role')).toBe('region');
  });

  it('应该正确处理变体样式', () => {
    const { container: outlineContainer } = render(
      <ChartContainer baseClassName="test-chart" variant="outline">
        <div>图表内容</div>
      </ChartContainer>,
    );

    const outlineChartContainer = outlineContainer.firstChild as HTMLElement;
    expect(outlineChartContainer.className).toContain('outline');

    const { container: borderlessContainer } = render(
      <ChartContainer baseClassName="test-chart" variant="borderless">
        <div>图表内容</div>
      </ChartContainer>,
    );

    const borderlessChartContainer =
      borderlessContainer.firstChild as HTMLElement;
    expect(borderlessChartContainer.className).toContain('borderless');
  });

  it('应该正确处理默认变体', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart">
        <div>图表内容</div>
      </ChartContainer>,
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.className).not.toContain('outline');
    expect(chartContainer.className).not.toContain('borderless');
  });

  it('应该正确处理错误边界配置', () => {
    const onError = vi.fn();
    const { container } = render(
      <ChartContainer
        baseClassName="test-chart"
        errorBoundary={{
          enabled: true,
          onError,
        }}
      >
        <div>图表内容</div>
      </ChartContainer>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该正确禁用错误边界', () => {
    const { container } = render(
      <ChartContainer
        baseClassName="test-chart"
        errorBoundary={{
          enabled: false,
        }}
      >
        <div>图表内容</div>
      </ChartContainer>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('应该正确处理加载状态', () => {
    const { container } = render(
      <ChartContainer baseClassName="test-chart" loading={true}>
        <div>图表内容</div>
      </ChartContainer>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
