import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import ChartContainer from '@ant-design/agentic-ui/Plugins/chart/components/ChartContainer/ChartContainer';

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
});
