import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AnswerAlert } from '../@ant-design/agentic-ui/AnswerAlert';

describe('AnswerAlert 组件', () => {
  it('应该渲染基本的提示信息', () => {
    render(<AnswerAlert message="这是一条提示信息" />);

    expect(screen.getByText('这是一条提示信息')).toBeInTheDocument();
  });

  it('应该支持不同的提示类型', () => {
    const types: Array<'success' | 'error' | 'warning' | 'info' | 'gray'> = [
      'success',
      'error',
      'warning',
      'info',
      'gray',
    ];

    types.forEach((type) => {
      const { container, unmount } = render(
        <AnswerAlert type={type} message={`${type} message`} showIcon />,
      );

      const alert = container.querySelector('.ant-answer-alert');
      expect(alert).toHaveClass(`ant-answer-alert-${type}`);

      unmount();
    });
  });

  it('应该显示描述信息', () => {
    render(
      <AnswerAlert
        message="提示标题"
        description="这是详细的描述信息"
        showIcon
      />,
    );

    expect(screen.getByText('提示标题')).toBeInTheDocument();
    expect(screen.getByText('这是详细的描述信息')).toBeInTheDocument();
  });

  it('应该在有描述时应用特殊样式', () => {
    const { container } = render(
      <AnswerAlert
        message="提示标题"
        description="描述信息"
        type="info"
        showIcon
      />,
    );

    const alert = container.querySelector('.ant-answer-alert');
    expect(alert).toHaveClass('ant-answer-alert-with-description');
  });

  it('应该显示默认图标', () => {
    const { container } = render(
      <AnswerAlert message="带图标的提示" type="success" showIcon />,
    );

    const icon = container.querySelector('.ant-answer-alert-icon');
    expect(icon).toBeInTheDocument();
  });

  it('应该支持自定义图标', () => {
    const CustomIcon = () => <span data-testid="custom-icon">🎉</span>;

    render(
      <AnswerAlert
        message="自定义图标"
        icon={<CustomIcon />}
        showIcon
        type="info"
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('应该支持非 React 元素的自定义图标', () => {
    const { container } = render(
      <AnswerAlert message="文本图标" icon="⚠️" showIcon type="warning" />,
    );

    const icon = container.querySelector('.ant-answer-alert-icon');
    expect(icon).toBeInTheDocument();
    expect(icon?.textContent).toBe('⚠️');
  });

  it('当 showIcon 为 false 时不应显示图标', () => {
    const { container } = render(
      <AnswerAlert message="无图标提示" type="info" showIcon={false} />,
    );

    const icon = container.querySelector('.ant-answer-alert-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('应该支持自定义操作项', () => {
    render(
      <AnswerAlert
        message="带操作的提示"
        action={<button type="button">查看详情</button>}
      />,
    );

    expect(screen.getByText('查看详情')).toBeInTheDocument();
  });

  it('应该显示关闭按钮', () => {
    const { container } = render(
      <AnswerAlert message="可关闭的提示" closable />,
    );

    const closeButton = container.querySelector('.ant-answer-alert-close-icon');
    expect(closeButton).toBeInTheDocument();
  });

  it('应该在点击关闭按钮后隐藏组件', () => {
    const { container } = render(
      <AnswerAlert message="可关闭的提示" closable />,
    );

    const closeButton = container.querySelector(
      '.ant-answer-alert-close-icon',
    ) as HTMLElement;
    expect(screen.getByText('可关闭的提示')).toBeInTheDocument();

    fireEvent.click(closeButton);

    expect(screen.queryByText('可关闭的提示')).not.toBeInTheDocument();
  });

  it('应该在关闭时触发 onClose 回调', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <AnswerAlert message="可关闭的提示" closable onClose={handleClose} />,
    );

    const closeButton = container.querySelector(
      '.ant-answer-alert-close-icon',
    ) as HTMLElement;
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <AnswerAlert message="自定义类名" className="custom-alert" />,
    );

    const alert = container.querySelector('.ant-answer-alert');
    expect(alert).toHaveClass('custom-alert');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <AnswerAlert
        message="自定义样式"
        style={{ backgroundColor: 'rgb(255, 0, 0)' }}
      />,
    );

    const alert = container.querySelector('.ant-answer-alert');
    expect(alert).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该正确渲染复杂的内容', () => {
    render(
      <AnswerAlert
        type="success"
        message={<strong>成功标题</strong>}
        description={
          <div>
            <p>第一段描述</p>
            <p>第二段描述</p>
          </div>
        }
        showIcon
        closable
        action={
          <div>
            <button type="button">操作1</button>
            <button type="button">操作2</button>
          </div>
        }
      />,
    );

    expect(screen.getByText('成功标题')).toBeInTheDocument();
    expect(screen.getByText('第一段描述')).toBeInTheDocument();
    expect(screen.getByText('第二段描述')).toBeInTheDocument();
    expect(screen.getByText('操作1')).toBeInTheDocument();
    expect(screen.getByText('操作2')).toBeInTheDocument();
  });

  it('应该在 ConfigProvider 上下文中正确工作', () => {
    render(
      <ConfigProvider prefixCls="custom">
        <AnswerAlert message="配置提供者测试" />
      </ConfigProvider>,
    );

    expect(screen.getByText('配置提供者测试')).toBeInTheDocument();
  });

  it('应该处理所有图标类型', () => {
    const iconTypes: Array<'success' | 'error' | 'warning' | 'info' | 'gray'> =
      ['success', 'error', 'warning', 'info', 'gray'];

    iconTypes.forEach((type) => {
      const { unmount } = render(
        <AnswerAlert type={type} message={`${type} icon test`} showIcon />,
      );

      // 验证消息被渲染，说明组件正常工作
      expect(screen.getByText(`${type} icon test`)).toBeInTheDocument();

      unmount();
    });
  });

  it('当没有类型时不应显示默认图标', () => {
    const { container } = render(
      <AnswerAlert message="无类型提示" showIcon />,
    );

    const icon = container.querySelector('.ant-answer-alert-icon');
    expect(icon).not.toBeInTheDocument();
  });

  it('应该支持空的 message', () => {
    const { container } = render(<AnswerAlert />);

    const alert = container.querySelector('.ant-answer-alert');
    expect(alert).toBeInTheDocument();
  });

  it('关闭按钮应该有正确的可访问性属性', () => {
    const { container } = render(
      <AnswerAlert message="可访问性测试" closable />,
    );

    const closeButton = container.querySelector(
      '.ant-answer-alert-close-icon',
    ) as HTMLElement;
    expect(closeButton).toHaveAttribute('type', 'button');
    expect(closeButton).toHaveAttribute('tabIndex', '0');
  });

  it('应该处理快速连续点击关闭按钮', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <AnswerAlert message="快速点击测试" closable onClose={handleClose} />,
    );

    const closeButton = container.querySelector(
      '.ant-answer-alert-close-icon',
    ) as HTMLElement;

    fireEvent.click(closeButton);
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);

    // 组件已关闭，所以 onClose 只应该被调用一次
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应该在自定义图标是 React 元素时正确克隆', () => {
    const CustomIcon = ({ className }: { className?: string }) => (
      <span className={className} data-testid="cloned-icon">
        ⭐
      </span>
    );

    render(
      <AnswerAlert
        message="克隆图标测试"
        icon={<CustomIcon className="original-class" />}
        showIcon
        type="info"
      />,
    );

    const icon = screen.getByTestId('cloned-icon');
    expect(icon).toHaveClass('original-class');
    expect(icon).toHaveClass('ant-answer-alert-icon');
  });
});

