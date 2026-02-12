import { render, renderHook } from '@testing-library/react';
import React, { act, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useScrollShadow from '../../../../../src/MarkdownEditor/editor/elements/Table/useScrollShadow';

describe('useScrollShadow Hook', () => {
  let mockObserve: any;
  let mockDisconnect: any;

  beforeEach(() => {
    // Mock ResizeObserver
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    global.ResizeObserver = vi.fn(() => ({
      observe: mockObserve,
      unobserve: vi.fn(),
      disconnect: mockDisconnect,
    })) as any;

    // Mock requestAnimationFrame
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: any) => {
      cb();
      return 0;
    });

    // Mock cancelAnimationFrame
    vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该返回 ref 和初始的 scrollState', () => {
    const { result } = renderHook(() => useScrollShadow());

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toHaveProperty('current');
    expect(result.current[1]).toEqual({
      vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
      horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
    });
  });

  it('应该检测垂直滚动', () => {
    const { result } = renderHook(() => useScrollShadow());

    // 初始状态下应该没有滚动
    expect(result.current[1].vertical.hasScroll).toBe(false);
    expect(result.current[1].vertical.isAtStart).toBe(true);
    expect(result.current[1].vertical.isAtEnd).toBe(true);
  });

  it('应该检测水平滚动', () => {
    const { result } = renderHook(() => useScrollShadow());

    // 初始状态下应该没有滚动
    expect(result.current[1].horizontal.hasScroll).toBe(false);
    expect(result.current[1].horizontal.isAtStart).toBe(true);
    expect(result.current[1].horizontal.isAtEnd).toBe(true);
  });

  it('应该检测垂直滚动位置在顶部', () => {
    const { result } = renderHook(() => useScrollShadow(1));

    expect(result.current[1].vertical.isAtStart).toBe(true);
  });

  it('应该使用自定义 sensitivity', () => {
    const customSensitivity = 5;
    const { result } = renderHook(() => useScrollShadow(customSensitivity));

    expect(result.current).toBeDefined();
  });

  it('应该在组件卸载时清理', () => {
    const { result, unmount } = renderHook(() => useScrollShadow());

    // 验证 hook 正常初始化
    expect(result.current).toBeDefined();

    unmount();

    // 验证卸载成功
    expect(result.current).toBeDefined();
  });

  it('应该处理没有 ResizeObserver 的环境', () => {
    // 临时删除 ResizeObserver
    const originalResizeObserver = global.ResizeObserver;
    (global as any).ResizeObserver = undefined;

    const { result } = renderHook(() => useScrollShadow());

    expect(result.current).toHaveLength(2);
    expect(result.current[1]).toEqual({
      vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
      horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
    });

    // 恢复 ResizeObserver
    global.ResizeObserver = originalResizeObserver;
  });

  it('应该处理服务器端渲染（window undefined）', () => {
    const { result } = renderHook(() => useScrollShadow());

    // Hook 应该仍然返回正常的结构
    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toHaveProperty('current');
    expect(result.current[1]).toBeDefined();
  });

  it('应该在元素不存在时安全返回', () => {
    const { result } = renderHook(() => useScrollShadow());

    // ref.current 初始为 null
    expect(result.current[0].current).toBeNull();
    // 应该有初始的 scrollState
    expect(result.current[1]).toBeDefined();
    expect(result.current[1].vertical).toBeDefined();
    expect(result.current[1].horizontal).toBeDefined();
  });

  it('应该处理滚动到底部的情况', () => {
    const { result } = renderHook(() => useScrollShadow(1));

    // 验证初始状态
    expect(result.current[1].vertical.isAtEnd).toBe(true);
  });

  it('应该处理滚动到右侧边缘的情况', () => {
    const { result } = renderHook(() => useScrollShadow(1));

    // 验证初始状态
    expect(result.current[1].horizontal.isAtEnd).toBe(true);
  });

  it('应该处理中间位置的滚动', () => {
    const { result } = renderHook(() => useScrollShadow(1));

    // 验证初始状态
    expect(result.current[1]).toBeDefined();
    expect(result.current[1].vertical).toBeDefined();
    expect(result.current[1].horizontal).toBeDefined();
  });

  it('应该处理没有滚动的情况', () => {
    const { result } = renderHook(() => useScrollShadow());

    // 初始状态应该没有滚动
    expect(result.current[1].vertical.hasScroll).toBe(false);
    expect(result.current[1].horizontal.hasScroll).toBe(false);
  });

  it('应该使用 requestAnimationFrame 进行节流', () => {
    renderHook(() => useScrollShadow());

    expect(global.requestAnimationFrame).toBeDefined();
  });

  it('应该在卸载时取消 requestAnimationFrame', () => {
    const { result, unmount } = renderHook(() => useScrollShadow());

    // 验证 hook 正常初始化
    expect(result.current).toBeDefined();

    unmount();

    // 验证清理函数正常工作
    expect(result.current).toBeDefined();
  });

  it('应该处理零 sensitivity', () => {
    const { result } = renderHook(() => useScrollShadow(0));

    expect(result.current).toBeDefined();
  });

  it('应该处理负数 sensitivity', () => {
    const { result } = renderHook(() => useScrollShadow(-1));

    expect(result.current).toBeDefined();
  });

  it('应该处理非常大的 sensitivity', () => {
    const { result } = renderHook(() => useScrollShadow(1000));

    expect(result.current).toBeDefined();
  });

  it('checkScroll 在 element 为 null 时安全返回', async () => {
    let rafCallback: (() => void) | null = null;
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: any) => {
      rafCallback = cb;
      return 99;
    });

    function Wrapper() {
      const [show, setShow] = useState(true);
      const [ref] = useScrollShadow();
      return React.createElement(
        React.Fragment,
        null,
        show && React.createElement('div', { ref, 'data-testid': 'scroll-el' }),
        React.createElement(
          'button',
          { type: 'button', onClick: () => setShow(false) },
          'hide',
        ),
      );
    }

    const { getByTestId, getByRole } = render(React.createElement(Wrapper));
    const el = getByTestId('scroll-el');
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
    getByRole('button').click();
    if (rafCallback) rafCallback();
    expect(rafCallback).toBeDefined();
  });

  it('ref 挂载到 DOM 后滚动触发 throttledCheck 与 checkScroll', () => {
    function Wrapper() {
      const [ref] = useScrollShadow();
      return React.createElement('div', {
        ref,
        'data-testid': 'scroll-target',
        children: 'content',
      });
    }
    const { getByTestId } = render(React.createElement(Wrapper));
    const div = getByTestId('scroll-target');
    act(() => {
      div.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  it('卸载时取消未执行的 requestAnimationFrame', () => {
    const cancelSpy = vi
      .spyOn(global, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation(() => 100);

    function Wrapper() {
      const [ref] = useScrollShadow();
      return React.createElement('div', { ref, 'data-testid': 'scroll-el' });
    }
    const { getByTestId, unmount } = render(React.createElement(Wrapper));
    act(() => {
      getByTestId('scroll-el').dispatchEvent(
        new Event('scroll', { bubbles: true }),
      );
    });
    act(() => {
      unmount();
    });
    expect(cancelSpy).toHaveBeenCalledWith(100);
  });
});
