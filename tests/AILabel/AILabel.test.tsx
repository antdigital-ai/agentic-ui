import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AILabel } from '../../src/AILabel';

// Mock framer-motion 以加快测试速度
vi.mock('framer-motion', () => ({
  motion: {
    sup: ({ children, className, style, ...props }: any) => (
      <sup className={className} style={style} {...props}>
        {children}
      </sup>
    ),
  },
}));

describe('AILabel 组件', () => {
  it('应该渲染基本的 AI 标签', () => {
    const { container } = render(<AILabel />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeInTheDocument();
  });

  it('应该支持不同的状态', () => {
    const statuses: Array<'default' | 'emphasis' | 'watermark'> = [
      'default',
      'emphasis',
      'watermark',
    ];

    statuses.forEach((status) => {
      const { container, unmount } = render(<AILabel status={status} />);

      const label = container.querySelector('.ant-ai-label');
      expect(label).toHaveClass(`ant-ai-label-status-${status}`);

      unmount();
    });
  });

  it('应该在没有指定状态时使用默认状态', () => {
    const { container } = render(<AILabel />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeInTheDocument();
    // 默认状态不添加状态类名
    expect(label).not.toHaveClass('ant-ai-label-status-default');
  });

  it('应该支持 offset 偏移量', () => {
    const { container } = render(<AILabel offset={[10, -8]} />);

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ marginTop: '-8px', insetInlineEnd: '-10px' });
  });

  it('应该合并 offset 和 style 样式', () => {
    const { container } = render(
      <AILabel offset={[5, -10]} style={{ color: 'rgb(255, 0, 0)' }} />,
    );

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toHaveStyle({ marginTop: '-10px', insetInlineEnd: '-5px' });
    expect(dot).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('应该支持 tooltip 提示框', async () => {
    const { container } = render(
      <AILabel
        tooltip={{
          title: '这是 AI 生成的内容',
        }}
      />,
    );

    // Tooltip 会包裹 dot 元素
    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toBeInTheDocument();
  });

  it('应该支持自定义 tooltip 属性', () => {
    const { container } = render(
      <AILabel
        tooltip={{
          title: '自定义提示',
          placement: 'top',
        }}
      />,
    );

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeInTheDocument();
  });

  it('应该在有子元素时添加 with-children 类名', () => {
    const { container } = render(
      <AILabel>
        <span>子元素内容</span>
      </AILabel>,
    );

    const label = container.querySelector('.ant-ai-label');
    expect(label).toHaveClass('ant-ai-label-with-children');
    expect(screen.getByText('子元素内容')).toBeInTheDocument();
  });

  it('应该在没有子元素时不添加 with-children 类名', () => {
    const { container } = render(<AILabel />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).not.toHaveClass('ant-ai-label-with-children');
  });

  it('应该支持自定义 className', () => {
    const { container } = render(<AILabel className="custom-label" />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).toHaveClass('custom-label');
  });

  it('应该支持自定义 rootStyle', () => {
    const { container } = render(<AILabel rootStyle={{ padding: '10px' }} />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).toHaveStyle({ padding: '10px' });
  });

  it('应该支持自定义 style（应用到 dot）', () => {
    const { container } = render(
      <AILabel style={{ border: '2px solid red' }} />,
    );

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toHaveStyle({ border: '2px solid red' });
  });

  it('应该支持 HTML 属性', () => {
    const { container } = render(
      <AILabel data-testid="ai-label" aria-label="AI 标签" />,
    );

    const label = container.querySelector('[data-testid="ai-label"]');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('aria-label', 'AI 标签');
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <AILabel />
      </ConfigProvider>,
    );

    const label = container.querySelector('.custom-ai-label');
    expect(label).toBeInTheDocument();
  });

  it('应该支持复杂的子元素内容', () => {
    render(
      <AILabel status="emphasis">
        <div>
          <h3>标题</h3>
          <p>这是一段 AI 生成的内容</p>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
          </ul>
        </div>
      </AILabel>,
    );

    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('这是一段 AI 生成的内容')).toBeInTheDocument();
    expect(screen.getByText('列表项 1')).toBeInTheDocument();
    expect(screen.getByText('列表项 2')).toBeInTheDocument();
  });

  it('应该正确处理所有属性组合', () => {
    const { container } = render(
      <AILabel
        status="emphasis"
        offset={[5, -8]}
        className="custom-class"
        style={{ border: '1px solid blue' }}
        rootStyle={{ margin: '10px' }}
        tooltip={{
          title: '完整配置的标签',
          placement: 'top',
        }}
        data-testid="full-config-label"
      >
        <span>子元素</span>
      </AILabel>,
    );

    const label = container.querySelector('.ant-ai-label');
    expect(label).toHaveClass('custom-class');
    expect(label).toHaveClass('ant-ai-label-status-emphasis');
    expect(label).toHaveClass('ant-ai-label-with-children');
    expect(label).toHaveStyle({ margin: '10px' });
    expect(label).toHaveAttribute('data-testid', 'full-config-label');

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toHaveStyle({ marginTop: '-8px', insetInlineEnd: '-5px' });
    expect(dot).toHaveStyle({ border: '1px solid blue' });

    expect(screen.getByText('子元素')).toBeInTheDocument();
  });

  it('应该正确处理负数的 offset', () => {
    const { container } = render(<AILabel offset={[-10, -20]} />);

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toHaveStyle({ marginTop: '-20px', insetInlineEnd: '10px' });
  });

  it('应该正确处理正数的 offset', () => {
    const { container } = render(<AILabel offset={[15, 25]} />);

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toHaveStyle({ marginTop: '25px', insetInlineEnd: '-15px' });
  });

  it('应该支持 React 节点作为子元素', () => {
    const ChildComponent = () => <div>React 组件子元素</div>;

    render(
      <AILabel status="default">
        <ChildComponent />
      </AILabel>,
    );

    expect(screen.getByText('React 组件子元素')).toBeInTheDocument();
  });

  it('应该正确处理 null 和 undefined 值', () => {
    const { container } = render(
      <AILabel
        status={undefined}
        offset={undefined}
        className={undefined}
        style={undefined}
        rootStyle={undefined}
      />,
    );

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeInTheDocument();
  });

  it('应该正确处理空字符串 className', () => {
    const { container } = render(<AILabel className="" />);

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeInTheDocument();
  });

  it('应该支持事件处理', () => {
    const handleClick = vi.fn();

    const { container } = render(<AILabel onClick={handleClick} />);

    const label = container.querySelector('.ant-ai-label');
    fireEvent.click(label!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持鼠标事件', () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();

    const { container } = render(
      <AILabel
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />,
    );

    const label = container.querySelector('.ant-ai-label');
    fireEvent.mouseEnter(label!);
    fireEvent.mouseLeave(label!);

    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('应该正确处理 tooltip 状态变化', async () => {
    const { container } = render(
      <AILabel
        status="watermark"
        tooltip={{
          title: '测试提示',
        }}
      />,
    );

    const label = container.querySelector('.ant-ai-label');
    expect(label).toBeTruthy();
    expect(label).toBeInTheDocument();

    // 初始状态下不应该有 tooltip-visible 类名
    if (label) {
      expect(label).not.toHaveClass('ant-ai-label-tooltip-visible');
    }
  });

  it('应该在不同状态下正确渲染', () => {
    const { container: defaultContainer } = render(
      <AILabel status="default" />,
    );
    const defaultLabel = defaultContainer.querySelector(
      '.ant-ai-label.ant-ai-label-status-default',
    );
    expect(defaultLabel).toBeTruthy();
    expect(defaultLabel).toBeInTheDocument();

    const { container: emphasisContainer } = render(
      <AILabel status="emphasis" />,
    );
    const emphasisLabel = emphasisContainer.querySelector(
      '.ant-ai-label.ant-ai-label-status-emphasis',
    );
    expect(emphasisLabel).toBeTruthy();
    expect(emphasisLabel).toBeInTheDocument();

    const { container: watermarkContainer } = render(
      <AILabel status="watermark" />,
    );
    const watermarkLabel = watermarkContainer.querySelector(
      '.ant-ai-label.ant-ai-label-status-watermark',
    );
    expect(watermarkLabel).toBeTruthy();
    expect(watermarkLabel).toBeInTheDocument();
  });

  it('应该正确处理 offset 值', () => {
    // offset 应该是数字数组
    const { container } = render(<AILabel offset={[10, -8]} />);

    const dot = container.querySelector('.ant-ai-label-dot');
    expect(dot).toBeTruthy();
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ marginTop: '-8px', insetInlineEnd: '-10px' });
  });

  it('应该支持多个子元素', () => {
    render(
      <AILabel>
        <span>第一个子元素</span>
        <span>第二个子元素</span>
        <span>第三个子元素</span>
      </AILabel>,
    );

    expect(screen.getByText('第一个子元素')).toBeInTheDocument();
    expect(screen.getByText('第二个子元素')).toBeInTheDocument();
    expect(screen.getByText('第三个子元素')).toBeInTheDocument();
  });
});
