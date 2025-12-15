/**
 * DonutChart Legend 组件测试用例
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Legend from '../../../../src/Plugins/chart/DonutChart/Legend';
import type { DonutChartData } from '../../../../src/Plugins/chart/DonutChart/types';

const mockData: DonutChartData[] = [
  { label: 'A', value: 30 },
  { label: 'B', value: 50 },
  { label: 'C', value: 20 },
];

const mockBackgroundColors = ['#FF6384', '#36A2EB', '#FFCE56'];

const defaultProps = {
  chartData: mockData,
  backgroundColors: mockBackgroundColors,
  hiddenDataIndicesByChart: {},
  chartIndex: 0,
  onLegendItemClick: vi.fn(),
  total: 100,
  baseClassName: 'test-donut-chart',
  hashId: '',
  isMobile: false,
};

describe('DonutChart Legend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该渲染图例列表', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('应该显示每个数据项的值', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('应该显示百分比', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('应该在点击图例项时调用回调', () => {
      const onLegendItemClick = vi.fn();
      render(
        <Legend {...defaultProps} onLegendItemClick={onLegendItemClick} />,
      );

      const legendItem = screen.getByText('A').closest('[role="button"]');
      if (legendItem) {
        fireEvent.click(legendItem);
        expect(onLegendItemClick).toHaveBeenCalledWith(0);
      }
    });

    it('应该支持键盘交互（Enter键）', () => {
      const onLegendItemClick = vi.fn();
      render(
        <Legend {...defaultProps} onLegendItemClick={onLegendItemClick} />,
      );

      const legendItem = screen.getByText('A').closest('[role="button"]');
      if (legendItem) {
        fireEvent.keyDown(legendItem, { key: 'Enter' });
        expect(onLegendItemClick).toHaveBeenCalledWith(0);
      }
    });

    it('应该支持键盘交互（空格键）', () => {
      const onLegendItemClick = vi.fn();
      render(
        <Legend {...defaultProps} onLegendItemClick={onLegendItemClick} />,
      );

      const legendItem = screen.getByText('A').closest('[role="button"]');
      if (legendItem) {
        fireEvent.keyDown(legendItem, { key: ' ' });
        expect(onLegendItemClick).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('隐藏状态', () => {
    it('应该显示隐藏状态（删除线）', () => {
      const hiddenDataIndicesByChart = {
        0: new Set([0]),
      };

      render(
        <Legend
          {...defaultProps}
          hiddenDataIndicesByChart={hiddenDataIndicesByChart}
        />,
      );

      const legendItem = screen.getByText('A').closest('[role="button"]');
      expect(legendItem).toHaveStyle({ textDecoration: 'line-through' });
    });

    it('应该正确显示 aria-label 当项目被隐藏', () => {
      const hiddenDataIndicesByChart = {
        0: new Set([0]),
      };

      render(
        <Legend
          {...defaultProps}
          hiddenDataIndicesByChart={hiddenDataIndicesByChart}
        />,
      );

      const legendItem = screen.getByLabelText('显示 A');
      expect(legendItem).toBeInTheDocument();
    });

    it('应该正确显示 aria-label 当项目可见', () => {
      render(<Legend {...defaultProps} />);

      const legendItem = screen.getByLabelText('隐藏 A');
      expect(legendItem).toBeInTheDocument();
    });
  });

  describe('移动端适配', () => {
    it('应该在移动端使用不同的样式', () => {
      render(<Legend {...defaultProps} isMobile={true} />);

      const legendContainer = screen
        .getByText('A')
        .closest('.test-donut-chart-legend');
      expect(legendContainer).toHaveStyle({
        marginLeft: '0',
        maxHeight: '120px',
        overflowY: 'auto',
      });
    });

    it('应该在桌面端使用不同的样式', () => {
      render(<Legend {...defaultProps} isMobile={false} />);

      const legendContainer = screen
        .getByText('A')
        .closest('.test-donut-chart-legend');
      expect(legendContainer).toHaveStyle({
        marginLeft: '12px',
        maxHeight: 'none',
        overflowY: 'visible',
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      render(<Legend {...defaultProps} chartData={[]} />);

      const legendContainer = document.querySelector(
        '.test-donut-chart-legend',
      );
      expect(legendContainer).toBeInTheDocument();
      expect(legendContainer?.children.length).toBe(0);
    });

    it('应该处理 total 为 0 的情况', () => {
      render(<Legend {...defaultProps} total={0} />);

      // 当 total 为 0 时，百分比应该显示为 0%
      // 由于有多个数据项，会有多个 0%
      const zeroPercentElements = screen.getAllByText('0%');
      expect(zeroPercentElements.length).toBeGreaterThan(0);
    });

    it('应该处理 value 为字符串的情况', () => {
      const stringData: DonutChartData[] = [{ label: 'A', value: '30' as any }];

      render(<Legend {...defaultProps} chartData={stringData} total={100} />);

      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('应该处理 value 为 NaN 的情况', () => {
      const nanData: DonutChartData[] = [{ label: 'A', value: NaN as any }];

      render(<Legend {...defaultProps} chartData={nanData} total={100} />);

      // 应该显示 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('应该处理多个图表索引', () => {
      const hiddenDataIndicesByChart = {
        0: new Set([0]),
        1: new Set([1]),
      };

      render(
        <Legend
          {...defaultProps}
          hiddenDataIndicesByChart={hiddenDataIndicesByChart}
          chartIndex={1}
        />,
      );

      // 第二个图表的第二个数据项应该被隐藏
      const legendItem = screen.getByText('B').closest('[role="button"]');
      expect(legendItem).toHaveStyle({ textDecoration: 'line-through' });
    });
  });

  describe('hashId 支持', () => {
    it('应该应用 hashId 到类名', () => {
      const { container } = render(
        <Legend {...defaultProps} hashId="test-hash" />,
      );

      const legendContainer = container.querySelector(
        '.test-donut-chart-legend.test-hash',
      );
      expect(legendContainer).toBeInTheDocument();
    });
  });
});
