/**
 * useIntersectionOnce 覆盖率测试
 * 覆盖 useLayoutEffect 视口/root 检查、useEffect IntersectionObserver 及清理逻辑
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useIntersectionOnce,
  UseIntersectionOnceOptions,
} from '../../src/Hooks/useIntersectionOnce';

describe('useIntersectionOnce', () => {
  let targetEl: HTMLDivElement;
  let targetRef: RefObject<HTMLDivElement>;
  let observerCallback: (entries: IntersectionObserverEntry[]) => void;
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    targetEl = document.createElement('div');
    document.body.appendChild(targetEl);
    targetRef = { current: targetEl };
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (
        this: any,
        cb: (entries: IntersectionObserverEntry[]) => void,
      ) {
        observerCallback = cb;
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
      }),
    );
  });

  afterEach(() => {
    document.body.removeChild(targetEl);
    vi.unstubAllGlobals();
  });

  it('ref.current 为 null 时返回 false 且不抛错', () => {
    const nullRef = { current: null } as RefObject<HTMLDivElement>;
    const { result } = renderHook(() => useIntersectionOnce(nullRef));
    expect(result.current).toBe(false);
  });

  it('元素已在视口内时 useLayoutEffect 将 isIntersecting 设为 true', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10,
      bottom: 50,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    }));
    // rootElement 为 document.documentElement 时需 mock，否则走 root 包含检查
    document.documentElement.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 600,
      left: 0,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    const { result } = renderHook(() => useIntersectionOnce(targetRef));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('元素不在视口内时初始为 false，由 observer 回调设为 true', () => {
    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10000,
      bottom: 10050,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10000,
      toJSON: () => ({}),
    }));

    const { result } = renderHook(() => useIntersectionOnce(targetRef));

    expect(result.current).toBe(false);

    act(() => {
      observerCallback([
        {
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: targetEl,
          time: 0,
        } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current).toBe(true);
  });

  it('observer 回调中 intersectionRatio > 0 且 isIntersecting 为 false 时仍设为 true', () => {
    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10000,
      bottom: 10050,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10000,
      toJSON: () => ({}),
    }));

    const { result } = renderHook(() => useIntersectionOnce(targetRef));

    act(() => {
      observerCallback([
        {
          isIntersecting: false,
          intersectionRatio: 0.5,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: targetEl,
          time: 0,
        } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current).toBe(true);
  });

  it('传入 root 为 RefObject 时使用 root.current 做包含检查', () => {
    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    const rootRef = { current: rootEl };

    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 50,
      bottom: 90,
      left: 50,
      right: 150,
      width: 100,
      height: 40,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    }));
    rootEl.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 200,
      left: 0,
      right: 300,
      width: 300,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    const options: UseIntersectionOnceOptions = { root: rootRef };
    const { result } = renderHook(() =>
      useIntersectionOnce(targetRef, options),
    );

    act(() => {});

    expect(result.current).toBe(true);
    document.body.removeChild(rootEl);
  });

  it('传入 root 为 Element 时使用该元素做包含检查', () => {
    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);

    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 50,
      bottom: 90,
      left: 50,
      right: 150,
      width: 100,
      height: 40,
      x: 50,
      y: 50,
      toJSON: () => ({}),
    }));
    rootEl.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 200,
      left: 0,
      right: 300,
      width: 300,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    const options: UseIntersectionOnceOptions = { root: rootEl };
    const { result } = renderHook(() =>
      useIntersectionOnce(targetRef, options),
    );

    act(() => {});

    expect(result.current).toBe(true);
    document.body.removeChild(rootEl);
  });

  it('元素不在 root 内时初始为 false', () => {
    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    const rootRef = { current: rootEl };

    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10000,
      bottom: 10050,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10000,
      toJSON: () => ({}),
    }));
    rootEl.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 100,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));

    const { result } = renderHook(() =>
      useIntersectionOnce(targetRef, { root: rootRef }),
    );

    act(() => {});

    expect(result.current).toBe(false);
    document.body.removeChild(rootEl);
  });

  it('卸载时调用 observer.disconnect 并置空', () => {
    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10000,
      bottom: 10050,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10000,
      toJSON: () => ({}),
    }));

    const { unmount } = renderHook(() => useIntersectionOnce(targetRef));

    expect(mockObserve).toHaveBeenCalledWith(targetEl);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('传入 rootMargin 和 threshold 时传给 IntersectionObserver', () => {
    targetEl.getBoundingClientRect = vi.fn(() => ({
      top: 10000,
      bottom: 10050,
      left: 10,
      right: 100,
      width: 90,
      height: 40,
      x: 10,
      y: 10000,
      toJSON: () => ({}),
    }));

    const options: UseIntersectionOnceOptions = {
      rootMargin: '10px',
      threshold: 0.5,
    };
    renderHook(() => useIntersectionOnce(targetRef, options));

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '10px',
        threshold: 0.5,
        root: null,
      }),
    );
  });

  describe('无 IntersectionObserver', () => {
    it('IntersectionObserver 未定义时直接设为 true', () => {
      targetEl.getBoundingClientRect = vi.fn(() => ({
        top: 10000,
        bottom: 10050,
        left: 10,
        right: 100,
        width: 90,
        height: 40,
        x: 10,
        y: 10000,
        toJSON: () => ({}),
      }));

      const origIO = globalThis.IntersectionObserver;
      (globalThis as any).IntersectionObserver = undefined;

      const { result } = renderHook(() => useIntersectionOnce(targetRef));

      act(() => {});

      expect(result.current).toBe(true);

      (globalThis as any).IntersectionObserver = origIO;
    });
  });

  describe('无 root 时的 viewport 边界', () => {
    it('rect 超出视口右侧时 shouldSetIntersecting 为 false', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
      targetEl.getBoundingClientRect = vi.fn(() => ({
        top: 10,
        bottom: 50,
        left: 900,
        right: 1000,
        width: 100,
        height: 40,
        x: 900,
        y: 10,
        toJSON: () => ({}),
      }));

      const { result } = renderHook(() => useIntersectionOnce(targetRef));

      act(() => {});

      expect(result.current).toBe(false);
    });

    it('rect 在视口内时 shouldSetIntersecting 为 true', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
      targetEl.getBoundingClientRect = vi.fn(() => ({
        top: 10,
        bottom: 50,
        left: 10,
        right: 100,
        width: 90,
        height: 40,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }));
      document.documentElement.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        bottom: 600,
        left: 0,
        right: 800,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const { result } = renderHook(() => useIntersectionOnce(targetRef));

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });
  });
});
