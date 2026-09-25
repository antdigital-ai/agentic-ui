/**
 * DonutChart Legend 分支覆盖：分页、暗色主题、移动端样式与百分比边界。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Legend from '../../DonutChart/Legend';
import type { DonutChartData } from '../../DonutChart/types';

const makeData = (count: number): DonutChartData[] =>
  Array.from({ length: count }, (_, i) => ({
    label: `Item-${i}`,
    value: 10,
  }));

const baseProps = {
  backgroundColors: [] as string[],
  hiddenDataIndicesByChart: {} as Record<number, Set<number>>,
  chartIndex: 0,
  onLegendItemClick: vi.fn(),
  total: 120,
  baseClassName: 'donut',
  hashId: 'hash',
  isMobile: false,
};

describe('DonutChart Legend 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('超过 12 项时渲染分页并可翻页', () => {
    const data = makeData(15);
    const colors = data.map((_, i) => `#${(i + 1).toString(16).padStart(6, '0')}`);
    render(
      <Legend {...baseProps} chartData={data} backgroundColors={colors} />,
    );

    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Item-0')).toBeInTheDocument();
    expect(screen.queryByText('Item-12')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('下一页'));
    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getByText('Item-12')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('上一页'));
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('首页上一页按钮 disabled；末页下一页 disabled', () => {
    const data = makeData(14);
    render(
      <Legend
        {...baseProps}
        chartData={data}
        backgroundColors={data.map(() => '#ccc')}
      />,
    );

    const prev = screen.getByLabelText('上一页') as HTMLButtonElement;
    const next = screen.getByLabelText('下一页') as HTMLButtonElement;
    expect(prev).toBeDisabled();

    fireEvent.click(next);
    expect(next).toBeDisabled();
    expect(prev).not.toBeDisabled();
  });

  it('暗色主题使用浅色文字与分页边框', () => {
    const data = makeData(14);
    const { container } = render(
      <Legend
        {...baseProps}
        chartData={data}
        backgroundColors={data.map(() => '#ccc')}
        theme="dark"
      />,
    );
    const pagination = container.querySelector('.donut-legend-pagination');
    expect(pagination).toBeInTheDocument();
    expect(pagination).toHaveStyle({ borderTopColor: 'rgba(255,255,255,0.12)' });
  });

  it('移动端 + 分页时 flexShrink 分支', () => {
    const data = makeData(14);
    const { container } = render(
      <Legend
        {...baseProps}
        chartData={data}
        backgroundColors={data.map(() => '#ccc')}
        isMobile
      />,
    );
    const pagination = container.querySelector('.donut-legend-pagination');
    expect(pagination).toHaveStyle({ flexShrink: '0' });
  });

  it('backgroundColors 缺失索引时使用 #ccc 回退', () => {
    render(
      <Legend
        {...baseProps}
        chartData={[{ label: 'X', value: 1 }]}
        backgroundColors={[]}
      />,
    );
    const colorSpan = document.querySelector('.donut-legend-color') as HTMLElement;
    expect(colorSpan?.style.getPropertyValue('--donut-legend-color')).toBe(
      '#ccc',
    );
  });

  it('hiddenDataIndicesByChart 无当前 chartIndex 时使用空 Set', () => {
    render(
      <Legend
        {...baseProps}
        chartData={[{ label: 'Visible', value: 1 }]}
        backgroundColors={['#111']}
        hiddenDataIndicesByChart={{ 1: new Set([0]) }}
        chartIndex={0}
      />,
    );
    const item = screen.getByText('Visible').closest('[role="button"]');
    expect(item).toHaveStyle({ textDecoration: 'none' });
  });

  it('chartIndex 变化时重置到第一页', () => {
    const data = makeData(14);
    const { rerender } = render(
      <Legend
        {...baseProps}
        chartData={data}
        backgroundColors={data.map(() => '#ccc')}
      />,
    );
    fireEvent.click(screen.getByLabelText('下一页'));
    expect(screen.getByText('2/2')).toBeInTheDocument();

    rerender(
      <Legend
        {...baseProps}
        chartData={data}
        backgroundColors={data.map(() => '#ccc')}
        chartIndex={1}
      />,
    );
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('非 Enter/Space 按键不触发 onLegendItemClick', () => {
    const onLegendItemClick = vi.fn();
    render(
      <Legend
        {...baseProps}
        chartData={[{ label: 'A', value: 1 }]}
        backgroundColors={['#f00']}
        onLegendItemClick={onLegendItemClick}
      />,
    );
    const item = screen.getByText('A').closest('[role="button"]')!;
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    expect(onLegendItemClick).not.toHaveBeenCalled();
  });

  it('字符串 value 可解析为数字并计算百分比', () => {
    render(
      <Legend
        {...baseProps}
        chartData={[{ label: 'Str', value: '25' as any }]}
        backgroundColors={['#0f0']}
        total={100}
      />,
    );
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('total=0 或非有限 value 时百分比为 0%', () => {
    render(
      <Legend
        {...baseProps}
        chartData={[{ label: 'NaN', value: Number.NaN as any }]}
        backgroundColors={['#00f']}
        total={0}
      />,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
