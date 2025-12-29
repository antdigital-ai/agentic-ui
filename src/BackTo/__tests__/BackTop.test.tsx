import { fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackTo } from '..';

// Mock scrollTo 工具函数
vi.mock('../../utils/scrollTo', () => ({
  default: vi.fn((y, options) => {
    if (options?.callback) {
      options.callback();
    }
  }),
}));

describe('BackTop 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 window 滚动位置
    window.pageYOffset = 0;
  });

  it('应该渲染回到顶部按钮', () => {
    // 设置滚动位置以使按钮可见
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    render(<BackTo.Top />);

    // 触发滚动事件以更新可见性
    fireEvent.scroll(window, { target: { scrollTop: 500 } });
  });

  it('应该在滚动超过默认阈值（400px）时显示', async () => {
    const { container } = render(<BackTo.Top />);

    // 初始状态不可见
    expect(container.querySelector('button')).not.toBeInTheDocument();

    // 模拟滚动到 500px
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义可见阈值', async () => {
    const { container } = render(<BackTo.Top shouldVisible={200} />);

    // 滚动到 250px（超过自定义阈值 200px）
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 250,
    });

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持函数形式的可见判断', async () => {
    const shouldVisible = vi.fn((scrollTop) => scrollTop > 300);
    const { container } = render(<BackTo.Top shouldVisible={shouldVisible} />);

    // 滚动到 350px
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 350,
    });

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(shouldVisible).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it('应该在点击时滚动到顶部', async () => {
    const scrollToMock = await import('../../utils/scrollTo');

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(scrollToMock.default).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
              duration: 450,
            }),
          );
        }
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义滚动持续时间', async () => {
    const scrollToMock = await import('../../utils/scrollTo');

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top duration={1000} />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(scrollToMock.default).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
              duration: 1000,
            }),
          );
        }
      },
      { timeout: 500 },
    );
  });

  it('应该触发自定义 onClick 回调', async () => {
    const handleClick = vi.fn();

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top onClick={handleClick} />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(handleClick).toHaveBeenCalled();
        }
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义 target 容器', async () => {
    const scrollContainer = document.createElement('div');
    Object.defineProperty(scrollContainer, 'scrollTop', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top target={() => scrollContainer} />);

    fireEvent.scroll(scrollContainer);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持 tooltip 属性', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top tooltip="回到顶部" />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义 className 和 style', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <BackTo.Top
        className="custom-back-top"
        style={{ backgroundColor: 'rgb(255, 0, 0)' }}
      />,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('custom-back-top');
        expect(button).toHaveStyle('background-color: rgb(255, 0, 0)');
      },
      { timeout: 500 },
    );
  });

  it('应该正确处理 ref', () => {
    const ref = React.createRef<any>();

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    render(<BackTo.Top ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(ref.current).toHaveProperty('nativeElement');
  });

  it('应该显示顶部图标', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        // 检查是否有内容（图标）
        expect(button?.querySelector('svg')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该在 ConfigProvider 中正确工作', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <BackTo.Top />
      </ConfigProvider>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该在滚动低于阈值时隐藏', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(<BackTo.Top />);

    // 首先滚动到可见位置
    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // 然后滚动回顶部
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100,
    });

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });
});
