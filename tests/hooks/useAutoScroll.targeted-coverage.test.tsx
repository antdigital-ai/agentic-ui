import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../../src/Hooks/useAutoScroll';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useAutoScroll targeted coverage', () => {
  let mutationObserverDisconnect: ReturnType<typeof vi.fn>;
  let mutationObserverObserve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mutationObserverDisconnect = vi.fn();
    mutationObserverObserve = vi.fn();
    global.MutationObserver = vi.fn().mockImplementation((callback: MutationCallback) => ({
      observe: mutationObserverObserve,
      disconnect: mutationObserverDisconnect,
      takeRecords: () => [],
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('calls onResize when containerRef is attached and _checkScroll runs', () => {
    const onResize = vi.fn();
    const { result } = renderHook(() =>
      useAutoScroll({ onResize, timeout: 16, SCROLL_TOLERANCE: 20 }),
    );

    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollHeight', { value: 100, configurable: true });
    Object.defineProperty(div, 'scrollTop', { value: 0, writable: true, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 50, configurable: true });
    div.scrollTo = vi.fn();

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = div;
    });

    act(() => {
      result.current.scrollToBottom();
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(onResize).toHaveBeenCalled();
    expect(div.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 100, behavior: 'auto' }),
    );
  });

  it('uses scrollBehavior from props when not forcing', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollHeight', { value: 200, configurable: true });
    Object.defineProperty(div, 'scrollTop', { value: 180, writable: true, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 50, configurable: true });
    div.scrollTo = vi.fn();

    const { result } = renderHook(() =>
      useAutoScroll({ scrollBehavior: 'auto', timeout: 16 }),
    );

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = div;
    });

    act(() => {
      result.current.scrollToBottom();
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(div.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 200, behavior: 'auto' }),
    );
  });

  it('MutationObserver invokes checkScroll when addedNodes exist', () => {
    let observerCallback: MutationCallback = () => {};
    global.MutationObserver = vi.fn().mockImplementation((callback: MutationCallback) => {
      observerCallback = callback;
      return {
        observe: mutationObserverObserve,
        disconnect: mutationObserverDisconnect,
        takeRecords: () => [],
      };
    });

    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ timeout: 16 });
      return (
        <div
          ref={containerRef as React.RefObject<HTMLDivElement>}
          data-testid="scroll-container"
          style={{ height: 50, overflow: 'auto' }}
        />
      );
    };
    const { container } = render(<Wrapper />);
    const div = container.querySelector('[data-testid="scroll-container"]') as HTMLDivElement;
    Object.defineProperty(div, 'scrollHeight', { value: 100, configurable: true });
    Object.defineProperty(div, 'scrollTop', { value: 80, writable: true, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 50, configurable: true });
    div.scrollTo = vi.fn();

    expect(mutationObserverObserve).toHaveBeenCalled();

    const addedNode = document.createElement('span');
    const mockNodeList = { length: 1, 0: addedNode } as NodeList;
    act(() => {
      observerCallback(
        [{ addedNodes: mockNodeList } as MutationRecord],
        {} as MutationObserver,
      );
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(div.scrollTo).toHaveBeenCalled();
  });

  it('disconnect called on unmount', () => {
    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ timeout: 16 });
      return <div ref={containerRef as React.RefObject<HTMLDivElement>} data-testid="c" />;
    };
    const { unmount } = render(<Wrapper />);
    expect(mutationObserverObserve).toHaveBeenCalled();
    unmount();
    expect(mutationObserverDisconnect).toHaveBeenCalled();
  });

  it('uses deps for useEffect re-run', () => {
    const Wrapper = ({ deps }: { deps: any[] }) => {
      const { containerRef } = useAutoScroll({ deps, timeout: 16 });
      return <div ref={containerRef as React.RefObject<HTMLDivElement>} data-testid="c" />;
    };
    const { rerender } = render(<Wrapper deps={[1]} />);
    expect(mutationObserverObserve).toHaveBeenCalled();
    rerender(<Wrapper deps={[2]} />);
    expect(mutationObserverDisconnect).toHaveBeenCalled();
    expect(mutationObserverObserve).toHaveBeenCalledTimes(2);
  });
});
