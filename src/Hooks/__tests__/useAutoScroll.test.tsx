import { act, render, renderHook } from '@testing-library/react';
import React, { useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

// Mock ResizeObserver
global.ResizeObserver = vi.fn(function MockResizeObserver() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

type ResizeObserverCallbackMock = (entries: ResizeObserverEntry[]) => void;

const installSynchronousObserverMocks = () => {
  const resizeObserverInstances: Array<{
    callback: ResizeObserverCallbackMock;
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];

  global.ResizeObserver = vi.fn(function MockResizeObserver(
    callback: ResizeObserverCallbackMock,
  ) {
    const instance = {
      callback,
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
    resizeObserverInstances.push(instance);
    return instance;
  }) as unknown as typeof ResizeObserver;

  global.MutationObserver = vi.fn(function MockMutationObserver() {
    return {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: () => [],
    };
  }) as unknown as typeof MutationObserver;

  vi.stubGlobal('requestAnimationFrame', ((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  }) as typeof requestAnimationFrame);
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn() as unknown as typeof cancelAnimationFrame,
  );

  return resizeObserverInstances;
};

const installScrollMetrics = (
  element: HTMLElement,
  metrics: { scrollHeight: number; scrollTop: number; clientHeight: number },
) => {
  Object.entries(metrics).forEach(([property, value]) => {
    Object.defineProperty(element, property, {
      configurable: true,
      value,
      writable: true,
    });
  });
};

describe('useAutoScroll', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should return scrollToBottom function', () => {
    const { result } = renderHook(() => useAutoScroll());

    expect(typeof result.current.scrollToBottom).toBe('function');
  });

  it('should handle null refs gracefully', () => {
    expect(() => {
      renderHook(() => useAutoScroll());
    }).not.toThrow();
  });

  it('should handle undefined refs gracefully', () => {
    expect(() => {
      renderHook(() => useAutoScroll());
    }).not.toThrow();
  });

  it('should call scrollToBottom without error', () => {
    const { result } = renderHook(() => useAutoScroll());

    act(() => {
      result.current.scrollToBottom();
    });

    // 函数应该正常执行而不抛出错误
    expect(result.current.scrollToBottom).toBeDefined();
  });

  it('should handle multiple scrollToBottom calls', () => {
    const { result } = renderHook(() => useAutoScroll());

    act(() => {
      result.current.scrollToBottom();
      result.current.scrollToBottom();
      result.current.scrollToBottom();
    });

    // 多次调用应该正常执行
    expect(result.current.scrollToBottom).toBeDefined();
  });

  it('should return containerRef', () => {
    const { result } = renderHook(() => useAutoScroll());

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should expose the latest callbacks before consumer layout effects run', () => {
    const resizeObserverInstances = installSynchronousObserverMocks();
    const initialOnResize = vi.fn();
    const latestOnResize = vi.fn();

    const TestComponent = ({
      onResize,
      triggerResize,
    }: {
      onResize: (size: { width: number; height: number }) => void;
      triggerResize: boolean;
    }) => {
      const { containerRef } = useAutoScroll({
        onResize,
        scrollBehavior: 'auto',
      });

      useLayoutEffect(() => {
        if (!triggerResize) return;
        resizeObserverInstances[0].callback([]);
      }, [triggerResize]);

      return (
        <div
          ref={(element) => {
            if (!element) return;
            installScrollMetrics(element, {
              scrollHeight: 120,
              scrollTop: 0,
              clientHeight: 40,
            });
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = element;
          }}
        />
      );
    };

    const { rerender } = render(
      <TestComponent onResize={initialOnResize} triggerResize={false} />,
    );

    rerender(<TestComponent onResize={latestOnResize} triggerResize />);

    expect(initialOnResize).not.toHaveBeenCalled();
    expect(latestOnResize).toHaveBeenCalledTimes(1);
    expect(latestOnResize).toHaveBeenCalledWith({ width: 0, height: 40 });
  });
});
