import { fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackTo } from '..';

// Mock scrollTo 和 getScrollRailHeight
vi.mock('../../Utils/scrollTo', () => ({
  default: vi.fn((y, options) => {
    if (options?.callback) {
      options.callback();
    }
  }),
}));

vi.mock('../../Utils/getScroll', () => ({
  default: vi.fn((target) => {
    if (target === window || !target) {
      return window.pageYOffset || 0;
    }
    return target.scrollTop || 0;
  }),
  isWindow: vi.fn((obj) => obj === window),
  getScrollRailHeight: vi.fn((target) => {
    if (target === window || !target) {
      return 2000; // Mock 总可滚动高度
    }
    return target.scrollHeight - target.offsetHeight;
  }),
}));

describe('BackBottom 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 window 滚动位置
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    });
  });

  it('应该渲染回到底部按钮', () => {
    render(<BackTo.Bottom />);
  });

  it('应该在距离底部超过默认阈值（400px）时显示', async () => {
    const { container } = render(<BackTo.Bottom />);

    // 初始状态应该可见（距离底部2000px > 400px）
    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义可见阈值', async () => {
    const { container } = render(<BackTo.Bottom shouldVisible={500} />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持函数形式的可见判断', async () => {
    const shouldVisible = vi.fn((scrollTop) => scrollTop < 1600);

    const { container } = render(
      <BackTo.Bottom shouldVisible={shouldVisible} />,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(shouldVisible).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it('应该在点击时滚动到底部', async () => {
    const scrollToMock = await import('../../Utils/scrollTo');

    const { container } = render(<BackTo.Bottom />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(scrollToMock.default).toHaveBeenCalledWith(
            2000, // Mock 的滚动高度
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
    const scrollToMock = await import('../../Utils/scrollTo');

    const { container } = render(<BackTo.Bottom duration={1000} />);

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(scrollToMock.default).toHaveBeenCalledWith(
            2000,
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

    const { container } = render(<BackTo.Bottom onClick={handleClick} />);

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
      value: 0,
    });
    Object.defineProperty(scrollContainer, 'scrollHeight', {
      writable: true,
      value: 1000,
    });
    Object.defineProperty(scrollContainer, 'offsetHeight', {
      writable: true,
      value: 200,
    });

    const { container } = render(
      <BackTo.Bottom target={() => scrollContainer} />,
    );

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
    const { container } = render(<BackTo.Bottom tooltip="回到底部" />);

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
    const { container } = render(
      <BackTo.Bottom
        className="custom-back-bottom"
        style={{ backgroundColor: 'rgb(0, 0, 255)' }}
      />,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('custom-back-bottom');
        expect(button).toHaveStyle('background-color: rgb(0, 0, 255)');
      },
      { timeout: 500 },
    );
  });

  it('应该正确处理 ref', () => {
    const ref = React.createRef<any>();

    render(<BackTo.Bottom ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(ref.current).toHaveProperty('nativeElement');
  });

  it('应该显示底部图标', async () => {
    const { container } = render(<BackTo.Bottom />);

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
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <BackTo.Bottom />
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

  it('应该在接近底部时隐藏', async () => {
    const { container } = render(<BackTo.Bottom shouldVisible={400} />);

    // 首先在顶部时应该可见
    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // 模拟滚动到接近底部（距离底部不足400px）
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 1700, // 2000 - 1700 = 300 < 400
    });

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该同时支持 BackTop 和 BackBottom', async () => {
    const { container } = render(
      <div>
        <BackTo.Top />
        <BackTo.Bottom />
      </div>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const buttons = container.querySelectorAll('button');
        // 在顶部时，只有 BackBottom 应该可见
        expect(buttons.length).toBeGreaterThan(0);
      },
      { timeout: 500 },
    );
  });
});

