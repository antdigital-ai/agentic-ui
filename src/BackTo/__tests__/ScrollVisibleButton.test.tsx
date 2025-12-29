import { fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollVisibleButton } from '../ScrollVisibleButton';

// Mock getScroll
vi.mock('../../utils/getScroll', () => ({
  default: vi.fn((target) => {
    if (target === window || !target) {
      return window.pageYOffset || 0;
    }
    return target.scrollTop || 0;
  }),
}));

describe('ScrollVisibleButton 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    });
  });

  it('应该渲染按钮内容', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton>
        <span>按钮内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.textContent).toContain('按钮内容');
      },
      { timeout: 500 },
    );
  });

  it('应该在滚动超过阈值时显示', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton shouldVisible={400}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该在滚动低于阈值时隐藏', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 300,
    });

    const { container } = render(
      <ScrollVisibleButton shouldVisible={400}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持函数形式的可见判断', async () => {
    const shouldVisible = vi.fn((scrollTop) => scrollTop > 300);

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton shouldVisible={shouldVisible}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(shouldVisible).toHaveBeenCalled();
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该触发 onClick 回调', async () => {
    const handleClick = vi.fn();

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton onClick={handleClick}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();

        if (button) {
          fireEvent.click(button);
          expect(handleClick).toHaveBeenCalled();
          expect(handleClick).toHaveBeenCalledWith(
            expect.any(Object),
            window,
          );
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

    const { container } = render(
      <ScrollVisibleButton target={() => scrollContainer}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(scrollContainer);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持 tooltip 属性（字符串形式）', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton tooltip="提示文本">
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持 tooltip 属性（对象形式）', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton
        tooltip={{ title: '提示文本', placement: 'left' }}
      >
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持 tooltip 属性（React 元素形式）', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton tooltip={<div>自定义提示</div>}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义 className', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton className="custom-button">
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('custom-button');
      },
      { timeout: 500 },
    );
  });

  it('应该支持自定义 style', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton style={{ backgroundColor: 'rgb(255, 0, 0)' }}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveStyle('background-color: rgb(255, 0, 0)');
      },
      { timeout: 500 },
    );
  });

  it('应该正确处理 ref', () => {
    const ref = React.createRef<any>();

    render(
      <ScrollVisibleButton ref={ref}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    expect(ref.current).toBeDefined();
    expect(ref.current).toHaveProperty('nativeElement');
  });

  it('应该暴露原生按钮元素通过 ref', async () => {
    const ref = React.createRef<any>();

    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton ref={ref}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        // 验证 ref 已设置
        expect(ref.current).toBeDefined();
        expect(ref.current).toHaveProperty('nativeElement');
      },
      { timeout: 500 },
    );
  });

  it('应该传递其他 DOM 属性到按钮', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton
        data-testid="custom-button"
        aria-label="自定义按钮"
      >
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('data-testid', 'custom-button');
        expect(button).toHaveAttribute('aria-label', '自定义按钮');
      },
      { timeout: 500 },
    );
  });

  it('应该使用默认的 shouldVisible 值（400）', async () => {
    // 滚动到 300px（低于默认阈值）
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 300,
    });

    const { container, rerender } = render(
      <ScrollVisibleButton>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // 滚动到 500px（超过默认阈值）
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    rerender(
      <ScrollVisibleButton>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).toBeInTheDocument();
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
        <ScrollVisibleButton>
          <span>内容</span>
        </ScrollVisibleButton>
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

  it('应该正确处理按钮类型', async () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 500,
    });

    const { container } = render(
      <ScrollVisibleButton>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    fireEvent.scroll(window);

    await waitFor(
      () => {
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'button');
      },
      { timeout: 500 },
    );
  });

  it('应该响应滚动位置变化', async () => {
    const { container } = render(
      <ScrollVisibleButton shouldVisible={400}>
        <span>内容</span>
      </ScrollVisibleButton>,
    );

    // 初始位置（不可见）
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 300,
    });
    fireEvent.scroll(window);

    await waitFor(
      () => {
        expect(container.querySelector('button')).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // 滚动到可见位置
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

    // 再次滚动到不可见位置
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 300,
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

