/**
 * ChartStatistic / formatNumber 分支：空值、formatter、header 组合、size/block/theme。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChartStatistic from '../ChartStatistic';
import { formatNumber, isValidNumber } from '../ChartStatistic/utils';

vi.mock('../../../Hooks/useAdaptiveTooltipProps', () => ({
  useAdaptiveTooltipProps: () => ({}),
}));

describe('formatNumber / isValidNumber 分支', () => {
  it('null/undefined/空串返回 --', () => {
    expect(formatNumber(null)).toBe('--');
    expect(formatNumber(undefined)).toBe('--');
    expect(formatNumber('')).toBe('--');
  });

  it('非法数字返回 --', () => {
    expect(formatNumber('abc')).toBe('--');
    expect(formatNumber(Number.NaN)).toBe('--');
  });

  it('precision 与千分位', () => {
    expect(formatNumber(1234.567, { precision: 2 })).toBe('1,234.57');
    expect(formatNumber(1000, { groupSeparator: '' })).toBe('1000');
    expect(formatNumber('12.3')).toBe('12.3');
  });

  it('isValidNumber 各分支', () => {
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('x')).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(10)).toBe(true);
    expect(isValidNumber('3.14')).toBe(true);
  });
});

describe('ChartStatistic 组件分支', () => {
  it('无 header 字段时不渲染 header', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartStatistic value={1} />
      </ConfigProvider>,
    );
    expect(container.querySelector('.ant-chart-statistic-header')).toBeNull();
  });

  it('formatter 优先于内置格式化', () => {
    render(
      <ConfigProvider>
        <ChartStatistic value={9} formatter={() => <span>自定义</span>} />
      </ConfigProvider>,
    );
    expect(screen.getByText('自定义')).toBeInTheDocument();
  });

  it('title + subtitle + tooltip + extra', () => {
    render(
      <ConfigProvider>
        <ChartStatistic
          title="主标题"
          subtitle="副标题"
          tooltip="提示"
          extra={<span>额外</span>}
          value={null}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
    expect(screen.getByText('额外')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('仅 subtitle 无 title', () => {
    render(
      <ConfigProvider>
        <ChartStatistic subtitle="只有副标题" value={2} />
      </ConfigProvider>,
    );
    expect(screen.getByText('只有副标题')).toBeInTheDocument();
  });

  it('仅 extra 作为 header', () => {
    render(
      <ConfigProvider>
        <ChartStatistic extra={<span>E</span>} value={3} />
      </ConfigProvider>,
    );
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('dark / large / block / prefix / suffix / classNames', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartStatistic
          title="T"
          value={1000}
          theme="dark"
          size="large"
          block
          prefix="¥"
          suffix="元"
          className="extra-root"
          classNames={{ root: 'r', value: 'v' }}
          styles={{ root: { margin: 1 }, value: { color: 'red' } }}
          style={{ padding: 2 }}
        />
      </ConfigProvider>,
    );
    const root = container.querySelector('.ant-chart-statistic');
    expect(root).toHaveClass('ant-chart-statistic-dark');
    expect(root).toHaveClass('ant-chart-statistic-large');
    expect(root).toHaveClass('ant-chart-statistic-block');
    expect(root).toHaveClass('extra-root');
    expect(screen.getByText('¥')).toBeInTheDocument();
    expect(screen.getByText('元')).toBeInTheDocument();
  });

  it('size=small 挂修饰类', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartStatistic value={1} size="small" />
      </ConfigProvider>,
    );
    expect(container.firstChild).toHaveClass('ant-chart-statistic-small');
  });

  it('空 prefix/suffix 不渲染前后缀节点', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartStatistic value={5} prefix="" suffix="" />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('.ant-chart-statistic-value-prefix'),
    ).toBeNull();
    expect(
      container.querySelector('.ant-chart-statistic-value-suffix'),
    ).toBeNull();
  });
});
