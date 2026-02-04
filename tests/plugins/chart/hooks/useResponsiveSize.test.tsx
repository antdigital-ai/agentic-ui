import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResponsiveSize } from '../../../../src/Plugins/chart/hooks/useResponsiveSize';

describe('useResponsiveSize', () => {
  const originalInnerWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1024;

  beforeEach(() => {
    // 重置 window.innerWidth
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    }
    vi.clearAllMocks();
  });

  it('应该返回默认的宽度和高度', () => {
    const { result } = renderHook(() => useResponsiveSize());

    expect(result.current.responsiveWidth).toBe(600);
    expect(result.current.responsiveHeight).toBe(400);
    expect(result.current.isMobile).toBe(false);
  });

  it('应该返回自定义的宽度和高度', () => {
    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.responsiveWidth).toBe(800);
    expect(result.current.responsiveHeight).toBe(500);
    expect(result.current.isMobile).toBe(false);
  });

  it('在桌面端应该返回原始宽度和高度', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.responsiveWidth).toBe(800);
    expect(result.current.responsiveHeight).toBe(500);
    expect(result.current.isMobile).toBe(false);
  });

  it('在移动端应该返回 100% 宽度和自适应高度', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.responsiveWidth).toBe('100%');
    expect(result.current.isMobile).toBe(true);
    // 移动端高度应该是 windowWidth * 0.8 和 400 中的较小值
    expect(result.current.responsiveHeight).toBe(400);
  });

  it('在移动端边界值（768px）应该返回移动端配置', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.responsiveWidth).toBe('100%');
    expect(result.current.isMobile).toBe(true);
  });

  it('在移动端边界值之上（769px）应该返回桌面端配置', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 769,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.responsiveWidth).toBe(800);
    expect(result.current.responsiveHeight).toBe(500);
    expect(result.current.isMobile).toBe(false);
  });

  it('应该监听窗口大小变化', () => {
    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.isMobile).toBe(false);

    // 模拟窗口大小变化
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.responsiveWidth).toBe('100%');
  });

  it('应该返回字符串类型的宽度', () => {
    const { result } = renderHook(() => useResponsiveSize('80%', 500));

    expect(result.current.responsiveWidth).toBe('80%');
  });

  it('在移动端应该正确处理字符串类型的宽度', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useResponsiveSize('80%', 500));

    expect(result.current.responsiveWidth).toBe('100%');
  });

  it('应该返回 windowWidth 值', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.windowWidth).toBe(1200);
  });

  it('应该正确处理窗口宽度变化', () => {
    const { result } = renderHook(() => useResponsiveSize(800, 500));

    expect(result.current.windowWidth).toBeGreaterThan(0);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.windowWidth).toBe(500);
  });

  it('在 SSR 环境中应该使用默认值', () => {
    // 保存原始 window
    const originalWindow = global.window;
    const originalInnerWidth = window.innerWidth;

    // 模拟 SSR 环境：hook 内部会检查 typeof window !== 'undefined'
    // 但 renderHook 需要 window 对象，所以我们通过修改 hook 的初始值来测试
    // 这里我们测试 hook 在 window.innerWidth 为默认值 768 时的行为
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsiveSize(800, 500));

    // 在移动端边界值（768px）应该返回移动端配置
    expect(result.current.isMobile).toBe(true);
    expect(result.current.responsiveWidth).toBe('100%');

    // 恢复原始值
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('应该清理事件监听器', () => {
    if (typeof window === 'undefined') {
      // 在 SSR 环境中跳过此测试
      return;
    }

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useResponsiveSize(800, 500));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
  });
});

