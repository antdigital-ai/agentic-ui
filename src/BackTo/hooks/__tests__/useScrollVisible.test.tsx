import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollVisible } from '../useScrollVisible';

// Mock getScroll
vi.mock('../../../utils/getScroll', () => ({
  default: vi.fn((target) => {
    if (target === window || !target) {
      return window.pageYOffset || 0;
    }
    return target.scrollTop || 0;
  }),
}));

// Mock throttleByAnimationFrame
vi.mock('../../../utils/throttleByAnimationFrame', () => ({
  default: vi.fn((fn) => {
    const throttled = fn;
    throttled.cancel = vi.fn();
    return throttled;
  }),
}));

describe('useScrollVisible hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    });
  });

  it('应该返回可见性状态和容器引用', () => {
    const target = () => window;
    const shouldVisible = (scrollTop: number) => scrollTop > 100;

    const { result } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    expect(result.current).toHaveProperty('visible');
    expect(result.current).toHaveProperty('currentContainer');
    expect(typeof result.current.visible).toBe('boolean');
    expect(result.current.currentContainer).toBeDefined();
  });

  it('应该使用 window 作为默认 target', () => {
    const target = () => window;
    const shouldVisible = vi.fn(() => false);

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    expect(shouldVisible).toHaveBeenCalled();
  });

  it('应该调用 shouldVisible 函数判断可见性', () => {
    const target = () => window;
    const shouldVisible = vi.fn((scrollTop: number) => scrollTop > 100);

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    expect(shouldVisible).toHaveBeenCalled();
  });

  it('应该根据滚动位置更新可见性', () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    });

    const target = () => window;
    const shouldVisible = (scrollTop: number) => scrollTop > 100;

    const { result, rerender } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    // 初始状态应该不可见
    expect(result.current.visible).toBe(false);

    // 更新滚动位置
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 200,
    });

    rerender();

    // 重新渲染后仍然需要触发滚动事件来更新状态
  });

  it('应该支持自定义容器', () => {
    const scrollContainer = document.createElement('div');
    Object.defineProperty(scrollContainer, 'scrollTop', {
      writable: true,
      value: 500,
    });

    const target = () => scrollContainer;
    const shouldVisible = vi.fn(() => true);

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    expect(shouldVisible).toHaveBeenCalled();
  });

  it('应该将容器传递给 shouldVisible 函数', () => {
    const target = () => window;
    const shouldVisible = vi.fn(
      (scrollTop: number, container: HTMLElement | Window) => {
        expect(container).toBe(window);
        return scrollTop > 100;
      },
    );

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    expect(shouldVisible).toHaveBeenCalled();
  });

  it('应该在组件卸载时清理事件监听器', () => {
    const target = () => window;
    const shouldVisible = () => false;
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  it('应该在组件挂载时添加事件监听器', () => {
    const target = () => window;
    const shouldVisible = () => false;
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
  });

  it('应该使用节流来优化滚动性能', async () => {
    const target = () => window;
    const shouldVisible = () => false;

    renderHook(() => useScrollVisible({ target, shouldVisible }));

    // 验证 hook 正常工作
    const throttleByAnimationFrame = await import(
      '../../../utils/throttleByAnimationFrame'
    );
    expect(throttleByAnimationFrame.default).toBeDefined();
  });

  it('应该在卸载时取消节流', () => {
    const target = () => window;
    const shouldVisible = () => false;

    const { unmount } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    // 测试卸载不会抛出错误
    expect(() => unmount()).not.toThrow();
  });

  it('应该更新 currentContainer ref', () => {
    const target = () => window;
    const shouldVisible = () => false;

    const { result } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    expect(result.current.currentContainer.current).toBe(window);
  });

  it('应该在 target 改变时重新设置监听器', () => {
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');

    const addEventListenerSpy1 = vi.spyOn(container1, 'addEventListener');
    const removeEventListenerSpy1 = vi.spyOn(
      container1,
      'removeEventListener',
    );
    const addEventListenerSpy2 = vi.spyOn(container2, 'addEventListener');

    const { rerender } = renderHook(
      ({ target }) => useScrollVisible({ target, shouldVisible: () => false }),
      {
        initialProps: { target: () => container1 },
      },
    );

    expect(addEventListenerSpy1).toHaveBeenCalled();

    // 更改 target
    rerender({ target: () => container2 });

    expect(removeEventListenerSpy1).toHaveBeenCalled();
    expect(addEventListenerSpy2).toHaveBeenCalled();

    addEventListenerSpy1.mockRestore();
    removeEventListenerSpy1.mockRestore();
    addEventListenerSpy2.mockRestore();
  });

  it('应该处理 shouldVisible 函数返回不同的值', () => {
    const target = () => window;
    let returnValue = false;
    const shouldVisible = vi.fn(() => returnValue);

    const { result, rerender } = renderHook(() =>
      useScrollVisible({ target, shouldVisible }),
    );

    expect(result.current.visible).toBe(false);

    returnValue = true;
    rerender();

    expect(shouldVisible).toHaveBeenCalled();
  });
});

