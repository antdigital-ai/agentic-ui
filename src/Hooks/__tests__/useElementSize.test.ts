/**
 * useElementSize 覆盖 ResizeObserver 回调、首帧同步测量与 RAF 合并
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useElementSize } from '../useElementSize';

const createResizeObserverMock = () => {
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  let observerCallback: (entries: ResizeObserverEntry[]) => void = () => {};

  const ResizeObserverMock = vi.fn(function (
    this: unknown,
    cb: (entries: ResizeObserverEntry[]) => void,
  ) {
    observerCallback = cb;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
    };
  });

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  return {
    mockObserve,
    mockDisconnect,
    triggerResize: (entry: ResizeObserverEntry) => {
      observerCallback([entry]);
    },
  };
};

const mockRect = (width: number, height: number) => ({
  width,
  height,
  top: 0,
  left: 0,
  right: width,
  bottom: height,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

describe('useElementSize', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('应在 ResizeObserver 回调中更新 size', async () => {
    const div = document.createElement('div');
    const { mockObserve, triggerResize } = createResizeObserverMock();

    const { result } = renderHook(() => useElementSize());

    act(() => {
      result.current.ref(div);
    });

    expect(mockObserve).toHaveBeenCalledWith(div);

    act(() => {
      triggerResize({
        borderBoxSize: [{ inlineSize: 100, blockSize: 50 }],
      } as unknown as ResizeObserverEntry);
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ width: 100, height: 50 });
    });
  });

  it('应在 observe 后立即同步测量首帧尺寸', async () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = vi.fn(() => mockRect(320, 88));
    createResizeObserverMock();

    const { result } = renderHook(() => useElementSize());

    act(() => {
      result.current.ref(div);
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ width: 320, height: 88 });
    });
  });

  it('应在 ref 首次挂载后立即感知目标元素', async () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = vi.fn(() => mockRect(200, 64));
    createResizeObserverMock();

    const { result } = renderHook(() => useElementSize());

    expect(result.current).toMatchObject({ width: 0, height: 0 });

    act(() => {
      result.current.ref(div);
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ width: 200, height: 64 });
    });
  });

  it('同一帧内多次 ResizeObserver 回调只应用最后一次尺寸', async () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = vi.fn(() => mockRect(100, 40));
    const { triggerResize } = createResizeObserverMock();

    const { result } = renderHook(() => useElementSize());

    act(() => {
      result.current.ref(div);
    });

    await waitFor(() => {
      expect(result.current.height).toBe(40);
    });

    act(() => {
      triggerResize({
        borderBoxSize: [{ inlineSize: 100, blockSize: 50 }],
      } as unknown as ResizeObserverEntry);
      triggerResize({
        borderBoxSize: [{ inlineSize: 100, blockSize: 80 }],
      } as unknown as ResizeObserverEntry);
    });

    expect(result.current.height).toBe(40);

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(result.current).toMatchObject({ width: 100, height: 80 });
  });
});
