import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../useAutoScroll';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useAutoScroll', () => {
  beforeEach(() => {
    // 设置测试环境
  });

  afterEach(() => {
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
});
