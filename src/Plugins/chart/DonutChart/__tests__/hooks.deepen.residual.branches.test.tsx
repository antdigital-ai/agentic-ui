/**
 * DonutChart hooks deepen：useMobile SSR 初值与 categories[0] || ''。
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAutoCategory,
  useFilterLabels,
  useMobile,
  useResponsiveDimensions,
} from '../hooks';

describe('DonutChart hooks deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('useMobile 初始化并响应 resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
    });
    const { result } = renderHook(() => useMobile());
    expect(result.current.isMobile).toBe(true);
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 900,
      });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.isMobile).toBe(false);
  });

  it('useResponsiveDimensions 移动/桌面两臂', () => {
    expect(useResponsiveDimensions(true, 400, 600, 400).width).toBeLessThanOrEqual(
      360,
    );
    expect(useResponsiveDimensions(false, 900, 600, 400).chartWidth).toBe(600);
  });

  it('useFilterLabels 无 filter 时清空选中', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useFilterLabels(data),
      {
        initialProps: {
          data: [
            { label: 'a', value: 1, filterLabel: 'A' },
            { label: 'b', value: 2, filterLabel: 'B' },
          ] as any,
        },
      },
    );
    expect(result.current.filterLabels?.length).toBe(2);
    rerender({ data: [{ label: 'a', value: 1 }] as any });
    expect(result.current.selectedFilterLabel).toBeUndefined();
  });

  it('useAutoCategory 多类目初始化；关闭时清理', () => {
    const data = [
      { label: 'a', value: 1, category: 'c1' },
      { label: 'b', value: 2, category: 'c2' },
    ] as any;
    const { result, rerender } = renderHook(
      ({ enable }) => useAutoCategory(data, enable),
      { initialProps: { enable: true } },
    );
    expect(result.current.selectedCategory).toBeTruthy();
    rerender({ enable: false });
    expect(result.current.selectedCategory).toBe('');
  });
});
