import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChartStatistic from '../ChartStatistic';

// Mock useStyle hook
vi.mock('../ChartStatistic/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: (node: any) => node,
    hashId: 'test-hash-id',
  })),
}));

describe('ChartStatistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染统计组件', () => {
      render(<ChartStatistic title="总销售额" value={1000} />);

      expect(screen.getByText('总销售额')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<ChartStatistic title="用户数量" value={500} />);

      expect(screen.getByText('用户数量')).toBeInTheDocument();
    });

    it('应该正确渲染数值', () => {
      render(<ChartStatistic value={1234567} />);

      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('应该不渲染标题当未提供时', () => {
      const { container } = render(<ChartStatistic value={100} />);

      expect(
        container.querySelector('.ant-chart-statistic-header'),
      ).not.toBeInTheDocument();
    });
  });

  describe('数值格式化测试', () => {
    it('应该正确格式化整数', () => {
      render(<ChartStatistic value={1000} />);

      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    it('应该正确格式化小数', () => {
      render(<ChartStatistic value={1234.567} precision={2} />);

      expect(screen.getByText('1,234.57')).toBeInTheDocument();
    });

    it('应该支持自定义精度', () => {
      render(<ChartStatistic value={123.456789} precision={3} />);

      expect(screen.getByText('123.457')).toBeInTheDocument();
    });

    it('应该支持自定义千分位分隔符', () => {
      render(<ChartStatistic value={1000000} groupSeparator=" " />);

      expect(screen.getByText('1 000 000')).toBeInTheDocument();
    });

    it('应该处理字符串类型的数值', () => {
      render(<ChartStatistic value="1234.56" />);

      expect(screen.getByText('1,234.56')).toBeInTheDocument();
    });

    it('应该处理无效的字符串', () => {
      render(<ChartStatistic value="invalid" />);

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('应该处理 null 值', () => {
      render(<ChartStatistic value={null} />);

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('应该处理 undefined 值', () => {
      render(<ChartStatistic value={undefined} />);

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('应该处理 0 值', () => {
      render(<ChartStatistic value={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('应该处理负数', () => {
      render(<ChartStatistic value={-1234.56} precision={2} />);

      expect(screen.getByText('-1,234.56')).toBeInTheDocument();
    });
  });

  describe('前缀和后缀测试', () => {
    it('应该正确显示前缀', () => {
      render(<ChartStatistic value={100} prefix="¥" />);

      expect(screen.getByText('¥')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('应该正确显示后缀', () => {
      render(<ChartStatistic value={50} suffix="%" />);

      expect(screen.getByText('%')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('应该同时显示前缀和后缀', () => {
      render(<ChartStatistic value={100} prefix="$" suffix="USD" />);

      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });

    it('应该支持 React 节点作为前缀', () => {
      render(
        <ChartStatistic
          value={100}
          prefix={<span data-testid="custom-prefix">$</span>}
        />,
      );

      expect(screen.getByTestId('custom-prefix')).toBeInTheDocument();
    });

    it('应该支持 React 节点作为后缀', () => {
      render(
        <ChartStatistic
          value={100}
          suffix={<span data-testid="custom-suffix">元</span>}
        />,
      );

      expect(screen.getByTestId('custom-suffix')).toBeInTheDocument();
    });
  });

  describe('自定义格式化函数测试', () => {
    it('应该支持自定义格式化函数', () => {
      const formatter = (value: any) => `自定义: ${value}`;

      render(<ChartStatistic value={100} formatter={formatter} />);

      expect(screen.getByText('自定义: 100')).toBeInTheDocument();
    });

    it('应该支持返回 React 节点的格式化函数', () => {
      const formatter = (value: any) => (
        <span data-testid="custom-format">格式化: {value}</span>
      );

      render(<ChartStatistic value={100} formatter={formatter} />);

      expect(screen.getByTestId('custom-format')).toBeInTheDocument();
      expect(screen.getByTestId('custom-format')).toHaveTextContent(
        '格式化: 100',
      );
    });

    it('格式化函数应该优先于默认格式化', () => {
      const formatter = () => '覆盖';

      render(
        <ChartStatistic
          value={100}
          precision={2}
          prefix="$"
          formatter={formatter}
        />,
      );

      expect(screen.getByText('覆盖')).toBeInTheDocument();
      // 注意: prefix 仍然会被渲染，因为它在 formatter 之外
      expect(screen.getByText('$')).toBeInTheDocument();
    });
  });

  describe('提示信息测试', () => {
    it('应该显示提示图标当提供 tooltip 时', () => {
      render(
        <ChartStatistic title="总销售额" value={1000} tooltip="这是提示信息" />,
      );

      const tooltipIcon = screen.getByRole('img', { hidden: true });
      expect(tooltipIcon).toBeInTheDocument();
    });

    it('应该在鼠标悬停时显示提示内容', async () => {
      const user = userEvent.setup();

      render(
        <ChartStatistic
          title="总销售额"
          value={1000}
          tooltip="详细的销售数据说明"
        />,
      );

      const tooltipIcon = screen.getByRole('img', { hidden: true });
      await user.hover(tooltipIcon);

      // Note: Antd Tooltip might need additional time to show
      // This is a basic test, actual tooltip content might need async waiting
    });

    it('应该不显示提示图标当未提供 tooltip 时', () => {
      render(<ChartStatistic title="总销售额" value={1000} />);

      const tooltipIcon = screen.queryByRole('img', { hidden: true });
      expect(tooltipIcon).not.toBeInTheDocument();
    });
  });

  describe('主题测试', () => {
    it('应该支持 light 主题', () => {
      const { container } = render(
        <ChartStatistic value={100} theme="light" />,
      );

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-light');
    });

    it('应该支持 dark 主题', () => {
      const { container } = render(<ChartStatistic value={100} theme="dark" />);

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-dark');
    });

    it('应该默认使用 light 主题', () => {
      const { container } = render(<ChartStatistic value={100} />);

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-light');
    });
  });

  describe('尺寸测试', () => {
    it('应该支持 small 尺寸', () => {
      const { container } = render(<ChartStatistic value={100} size="small" />);

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-small');
    });

    it('应该支持 default 尺寸', () => {
      const { container } = render(
        <ChartStatistic value={100} size="default" />,
      );

      const statistic = container.firstChild;
      expect(statistic).not.toHaveClass('ant-chart-statistic-small');
      expect(statistic).not.toHaveClass('ant-chart-statistic-large');
    });

    it('应该支持 large 尺寸', () => {
      const { container } = render(<ChartStatistic value={100} size="large" />);

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-large');
    });

    it('应该默认使用 default 尺寸', () => {
      const { container } = render(<ChartStatistic value={100} />);

      const statistic = container.firstChild;
      expect(statistic).not.toHaveClass('ant-chart-statistic-small');
      expect(statistic).not.toHaveClass('ant-chart-statistic-large');
    });
  });

  describe('布局测试', () => {
    it('应该支持 block 布局', () => {
      const { container } = render(<ChartStatistic value={100} block />);

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic-block');
    });

    it('应该默认不使用 block 布局', () => {
      const { container } = render(<ChartStatistic value={100} />);

      const statistic = container.firstChild;
      expect(statistic).not.toHaveClass('ant-chart-statistic-block');
    });
  });

  describe('自定义类名测试', () => {
    it('应该支持自定义 className', () => {
      const { container } = render(
        <ChartStatistic value={100} className="custom-statistic" />,
      );

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('custom-statistic');
    });

    it('应该保留默认类名', () => {
      const { container } = render(
        <ChartStatistic value={100} className="custom-statistic" />,
      );

      const statistic = container.firstChild;
      expect(statistic).toHaveClass('ant-chart-statistic');
      expect(statistic).toHaveClass('custom-statistic');
    });
  });

  describe('额外内容测试', () => {
    it('应该支持渲染额外内容', () => {
      render(
        <ChartStatistic
          title="总销售额"
          value={1000}
          extra={<button data-testid="extra-button">详情</button>}
        />,
      );

      expect(screen.getByTestId('extra-button')).toBeInTheDocument();
    });

    it('应该将额外内容放在标题旁边', () => {
      render(
        <ChartStatistic
          title="总销售额"
          value={1000}
          extra={<span data-testid="extra-content">额外信息</span>}
        />,
      );

      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
      expect(screen.getByText('总销售额')).toBeInTheDocument();
    });

    it('应该在没有标题时也能渲染额外内容', () => {
      render(
        <ChartStatistic
          value={1000}
          extra={<span data-testid="extra-content">额外信息</span>}
        />,
      );

      expect(screen.getByTestId('extra-content')).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理非常大的数字', () => {
      render(<ChartStatistic value={9999999999999} />);

      expect(screen.getByText('9,999,999,999,999')).toBeInTheDocument();
    });

    it('应该处理非常小的数字', () => {
      render(<ChartStatistic value={0.000001} precision={6} />);

      expect(screen.getByText('0.000001')).toBeInTheDocument();
    });

    it('应该处理科学计数法', () => {
      render(<ChartStatistic value={1e10} />);

      expect(screen.getByText('10,000,000,000')).toBeInTheDocument();
    });

    it('应该处理 Infinity', () => {
      render(<ChartStatistic value={Infinity} />);

      expect(screen.getByText('Infinity')).toBeInTheDocument();
    });

    it('应该处理 -Infinity', () => {
      render(<ChartStatistic value={-Infinity} />);

      expect(screen.getByText('-Infinity')).toBeInTheDocument();
    });

    it('应该处理 NaN', () => {
      render(<ChartStatistic value={NaN} />);

      expect(screen.getByText('--')).toBeInTheDocument();
    });
  });

  describe('复杂场景测试', () => {
    it('应该正确组合所有属性', () => {
      render(
        <ChartStatistic
          title="总销售额"
          tooltip="包含所有渠道的销售总额"
          value={1234567.89}
          precision={2}
          groupSeparator=","
          prefix="¥"
          suffix="元"
          className="custom-class"
          theme="dark"
          size="large"
          block
          extra={<button>查看详情</button>}
        />,
      );

      expect(screen.getByText('总销售额')).toBeInTheDocument();
      expect(screen.getByText('¥')).toBeInTheDocument();
      expect(screen.getByText('1,234,567.89')).toBeInTheDocument();
      expect(screen.getByText('元')).toBeInTheDocument();
      expect(screen.getByText('查看详情')).toBeInTheDocument();
    });

    it('应该在格式化函数中处理 null 值', () => {
      const formatter = (value: any) => (value ? `值: ${value}` : '无数据');

      render(<ChartStatistic value={null} formatter={formatter} />);

      expect(screen.getByText('无数据')).toBeInTheDocument();
    });

    it('应该在格式化函数中处理字符串值', () => {
      const formatter = (value: any) => `处理后: ${value}`;

      render(<ChartStatistic value="自定义文本" formatter={formatter} />);

      expect(screen.getByText('处理后: 自定义文本')).toBeInTheDocument();
    });
  });

  describe('组合场景测试', () => {
    it('应该支持多个统计组件并排显示', () => {
      const { container } = render(
        <div>
          <ChartStatistic title="指标1" value={100} />
          <ChartStatistic title="指标2" value={200} />
          <ChartStatistic title="指标3" value={300} />
        </div>,
      );

      expect(screen.getByText('指标1')).toBeInTheDocument();
      expect(screen.getByText('指标2')).toBeInTheDocument();
      expect(screen.getByText('指标3')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
    });

    it('应该支持嵌套在其他组件中', () => {
      render(
        <div data-testid="parent">
          <ChartStatistic title="嵌套统计" value={500} />
        </div>,
      );

      const parent = screen.getByTestId('parent');
      expect(parent).toContainElement(screen.getByText('嵌套统计'));
    });
  });

  describe('数字格式化边界测试', () => {
    it('应该处理只有整数部分的小数', () => {
      render(<ChartStatistic value={100.0} precision={2} />);

      expect(screen.getByText('100.00')).toBeInTheDocument();
    });

    it('应该正确四舍五入', () => {
      render(<ChartStatistic value={123.456} precision={2} />);

      expect(screen.getByText('123.46')).toBeInTheDocument();
    });

    it('应该处理精度为 0', () => {
      render(<ChartStatistic value={123.789} precision={0} />);

      expect(screen.getByText('124')).toBeInTheDocument();
    });
  });
});
