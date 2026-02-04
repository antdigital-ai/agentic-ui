import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../../src/Components/ActionIconBox';

describe('ActionIconBox 组件', () => {
  const TestIcon = () => <span data-testid="test-icon">Icon</span>;

  it('应该渲染基本的图标盒子', () => {
    render(
      <ActionIconBox title="测试按钮">
        <TestIcon />
      </ActionIconBox>,
    );

    expect(screen.getByTestId('action-icon-box')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该显示标题文本', () => {
    render(
      <ActionIconBox title="测试标题" showTitle>
        <TestIcon />
      </ActionIconBox>,
    );

    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });

  it('应该处理点击事件', async () => {
    const handleClick = vi.fn();

    render(
      <ActionIconBox title="点击按钮" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');

    await act(async () => {
      fireEvent.click(button);
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该处理异步点击事件', async () => {
    const asyncClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(
      <ActionIconBox title="异步按钮" onClick={asyncClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    fireEvent.click(button);

    // 等待真实的 setTimeout 完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });

  it('应该在加载时显示加载图标', async () => {
    const handleClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    const { container } = render(
      <ActionIconBox title="加载按钮" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    fireEvent.click(button);

    // 检查是否显示加载图标
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const loadingIcon = container.querySelector('.anticon-loading');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('应该支持受控的加载状态', () => {
    const { container } = render(
      <ActionIconBox title="受控加载" loading={true}>
        <TestIcon />
      </ActionIconBox>,
    );

    const loadingIcon = container.querySelector('.anticon-loading');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('应该在加载时阻止重复点击', async () => {
    const handleClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(
      <ActionIconBox title="防重复点击" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');

    // 快速连续点击
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // 应该只被调用一次
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持 danger 类型', () => {
    const { container } = render(
      <ActionIconBox title="危险操作" type="danger">
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass('ant-agentic-md-editor-action-icon-box-danger');
  });

  it('应该支持 primary 类型', () => {
    const { container } = render(
      <ActionIconBox title="主要操作" type="primary">
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass('ant-agentic-md-editor-action-icon-box-primary');
  });

  it('应该支持无边框样式', () => {
    const { container } = render(
      <ActionIconBox title="无边框" borderLess>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass(
      'ant-agentic-md-editor-action-icon-box-border-less',
    );
  });

  it('应该支持激活状态', () => {
    const { container } = render(
      <ActionIconBox title="激活状态" active>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass('ant-agentic-md-editor-action-icon-box-active');
  });

  it('应该支持变换效果', () => {
    const { container } = render(
      <ActionIconBox title="变换效果" transform>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass(
      'ant-agentic-md-editor-action-icon-box-transform',
    );
  });

  it('应该支持主题设置', () => {
    const { container: lightContainer } = render(
      <ActionIconBox title="浅色主题" theme="light">
        <TestIcon />
      </ActionIconBox>,
    );

    const lightButton = lightContainer.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(lightButton).toHaveClass(
      'ant-agentic-md-editor-action-icon-box-light',
    );

    const { container: darkContainer } = render(
      <ActionIconBox title="深色主题" theme="dark">
        <TestIcon />
      </ActionIconBox>,
    );

    const darkButton = darkContainer.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(darkButton).toHaveClass(
      'ant-agentic-md-editor-action-icon-box-dark',
    );
  });

  it('应该支持无内边距', () => {
    const { container } = render(
      <ActionIconBox title="无内边距" noPadding>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = container.querySelector(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(button).toHaveClass(
      'ant-agentic-md-editor-action-icon-box-noPadding',
    );
  });

  it('应该支持键盘导航（Enter 键）', async () => {
    const handleClick = vi.fn();

    render(
      <ActionIconBox title="键盘导航" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');

    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持键盘导航（空格键）', async () => {
    const handleClick = vi.fn();

    render(
      <ActionIconBox title="键盘导航" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');

    await act(async () => {
      fireEvent.keyDown(button, { key: ' ' });
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该忽略其他键盘按键', () => {
    const handleClick = vi.fn();

    render(
      <ActionIconBox title="其他按键" onClick={handleClick}>
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    fireEvent.keyDown(button, { key: 'a' });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该支持自定义 className', () => {
    render(
      <ActionIconBox title="自定义类名" className="custom-class">
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    expect(button).toHaveClass('custom-class');
  });

  it('应该支持自定义样式', () => {
    render(
      <ActionIconBox
        title="自定义样式"
        style={{ backgroundColor: 'rgb(255, 0, 0)' }}
      >
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    expect(button).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该支持自定义 data-testid', () => {
    render(
      <ActionIconBox title="自定义ID" data-testid="custom-id">
        <TestIcon />
      </ActionIconBox>,
    );

    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });

  it('应该支持 tooltip 配置', () => {
    render(
      <ActionIconBox title="工具提示" tooltipProps={{ placement: 'bottom' }}>
        <TestIcon />
      </ActionIconBox>,
    );

    expect(screen.getByTestId('action-icon-box')).toBeInTheDocument();
  });

  it('应该调用 onInit 回调', () => {
    const handleInit = vi.fn();

    render(
      <ActionIconBox title="初始化" onInit={handleInit}>
        <TestIcon />
      </ActionIconBox>,
    );

    expect(handleInit).toHaveBeenCalledTimes(1);
  });

  it('应该支持自定义图标样式', () => {
    render(
      <ActionIconBox title="图标样式" iconStyle={{ fontSize: '20px' }}>
        <TestIcon />
      </ActionIconBox>,
    );

    // 验证组件正常渲染
    const button = screen.getByTestId('action-icon-box');
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    render(
      <ConfigProvider prefixCls="custom">
        <ActionIconBox title="配置提供者">
          <TestIcon />
        </ActionIconBox>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('action-icon-box')).toBeInTheDocument();
  });

  it('应该处理无 onClick 的情况', () => {
    render(
      <ActionIconBox title="无点击">
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('应该支持可访问性属性', () => {
    render(
      <ActionIconBox title="可访问性">
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabIndex', '0');
    expect(button).toHaveAttribute('aria-label', '可访问性');
  });

  it('应该触发 onLoadingChange 回调', async () => {
    const handleLoadingChange = vi.fn();
    const handleClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(
      <ActionIconBox
        title="加载变化"
        onClick={handleClick}
        onLoadingChange={handleLoadingChange}
      >
        <TestIcon />
      </ActionIconBox>,
    );

    const button = screen.getByTestId('action-icon-box');
    fireEvent.click(button);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(handleLoadingChange).toHaveBeenCalled();
  });
});
