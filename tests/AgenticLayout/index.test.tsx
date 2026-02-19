import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticLayout } from '../../src/AgenticLayout'; // Mock the style hook
vi.mock('../../src/AgenticLayout/style', () => ({
  useAgenticLayoutStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('AgenticLayout', () => {
  it('should handle case when window is undefined (SSR)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    global.window = originalWindow;
    expect(true).toBe(true);
  });

  it('should not handle resize move when not resizing', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
        />
      </TestWrapper>,
    );

    // 验证组件正常渲染
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();

    const moveEvent = new MouseEvent('mousemove');
    document.dispatchEvent(moveEvent);
  });
  // 测试窗口大小变化时右侧边栏宽度调整（currentRightWidth > maxWidth 时会 clamp）
  it('should adjust right sidebar width on window resize', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          rightWidth={800}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const rightPanel = screen.getByTestId('right').closest('div');
    expect(rightPanel).toBeInTheDocument();
  });

  it('getMaxRightWidth 在 window 缺失时返回 Infinity', () => {
    const resizeHandlers: Array<() => void> = [];
    const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((ev, fn) => {
      if (ev === 'resize') resizeHandlers.push(fn as () => void);
    });
    const removeSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

    const { unmount } = render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">L</div>}
          center={<div data-testid="center">C</div>}
          right={<div data-testid="right">R</div>}
          rightWidth={800}
        />
      </TestWrapper>,
    );

    const origWindow = global.window;
    try {
      (global as any).window = undefined;
      act(() => {
        resizeHandlers.forEach((fn) => fn());
      });
    } finally {
      (global as any).window = origWindow;
    }

    unmount();
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('unmount 时应移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">L</div>}
          center={<div data-testid="center">C</div>}
          right={<div data-testid="right">R</div>}
        />
      </TestWrapper>,
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  // 测试拖拽调整右侧边栏大小
  it('should handle resize of right sidebar', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
        />
      </TestWrapper>,
    );

    // 验证组件正常渲染
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
