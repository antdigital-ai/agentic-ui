import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useAutoScroll from '../../src/Hooks/useAutoScroll';

global.ResizeObserver = vi.fn(function MockResizeObserver() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

describe('useAutoScroll targeted coverage', () => {
  let mutationObserverDisconnect: ReturnType<typeof vi.fn>;
  let mutationObserverObserve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mutationObserverDisconnect = vi.fn();
    mutationObserverObserve = vi.fn();
    global.MutationObserver = vi.fn(function MockMutationObserver(_callback: MutationCallback) {
      return {
        observe: mutationObserverObserve,
        disconnect: mutationObserverDisconnect,
        takeRecords: () => [],
      };
    });
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
    global.MutationObserver = vi.fn(function MockMutationObserver(callback: MutationCallback) {
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

  it('does not scroll when user has scrolled up away from bottom', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollHeight', { value: 500, configurable: true, writable: true });
    Object.defineProperty(div, 'scrollTop', { value: 0, writable: true, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 100, configurable: true });
    div.scrollTo = vi.fn();

    const { result } = renderHook(() =>
      useAutoScroll({ timeout: 16, SCROLL_TOLERANCE: 20 }),
    );

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = div;
    });

    // Simulate user scrolling up (scrollTop = 0, far from bottom of 500)
    act(() => {
      div.dispatchEvent(new Event('scroll'));
    });

    // Now new content arrives (height grows) — should NOT auto-scroll because user scrolled up
    Object.defineProperty(div, 'scrollHeight', { value: 600, configurable: true, writable: true });

    // Since user is not near bottom (0 + 100 < 600 - 20), auto-scroll should be disengaged
    // and scrollTo should NOT be called automatically (only via scrollToBottom force)
    expect(div.scrollTo).not.toHaveBeenCalled();
  });

  it('re-engages auto-scroll when user scrolls back to bottom', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollHeight', { value: 500, configurable: true, writable: true });
    Object.defineProperty(div, 'scrollTop', { value: 380, writable: true, configurable: true });
    Object.defineProperty(div, 'clientHeight', { value: 100, configurable: true });
    div.scrollTo = vi.fn();

    let observerCallback: MutationCallback = () => {};
    global.MutationObserver = vi.fn(function MockMutationObserver(callback: MutationCallback) {
      observerCallback = callback;
      return {
        observe: mutationObserverObserve,
        disconnect: mutationObserverDisconnect,
        takeRecords: () => [],
      };
    });

    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ timeout: 16, SCROLL_TOLERANCE: 20 });
      return (
        <div
          ref={(el) => {
            if (el) {
              Object.defineProperty(el, 'scrollHeight', { value: 500, configurable: true, writable: true });
              Object.defineProperty(el, 'scrollTop', { value: 380, writable: true, configurable: true });
              Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
              el.scrollTo = div.scrollTo;
              (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          data-testid="scroll-container"
        />
      );
    };

    render(<Wrapper />);

    // User scrolls to bottom -> re-engages auto-scroll
    const container = document.querySelector('[data-testid="scroll-container"]') as HTMLDivElement;
    Object.defineProperty(container, 'scrollTop', { value: 400, writable: true, configurable: true });
    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    // New content arrives
    Object.defineProperty(container, 'scrollHeight', { value: 600, configurable: true, writable: true });
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

    expect(container.scrollTo).toHaveBeenCalled();
  });

  it('uses currentScrollHeight (not prevScrollHeight) for isNearBottom — smooth scroll mid-animation fix', () => {
    // Reproduce the "always a bit short" bug scenario:
    // scrollHeight = 500, scrollTop = 400 (near bottom), clientHeight = 100
    // Content grows to 600 while scrollTop is still 350 (mid smooth-scroll animation)
    // Old code: isNearBottom = 350+100 >= prevScrollHeight(500)-20=480 => 450>=480 => FALSE
    //           and isLocked was always false => missed scroll
    // New code: isAutoScrollEngaged stays true after scroll-to-bottom event =>
    //           shouldScroll = true => scrollTo({ top: 600 }) called
    let observerCallback: MutationCallback = () => {};
    global.MutationObserver = vi.fn(function MockMutationObserver(cb: MutationCallback) {
      observerCallback = cb;
      return { observe: mutationObserverObserve, disconnect: mutationObserverDisconnect, takeRecords: () => [] };
    });

    let mockScrollHeight = 500;
    const mockScrollTo = vi.fn();

    const Wrapper = () => {
      const { containerRef } = useAutoScroll({ timeout: 16, SCROLL_TOLERANCE: 20 });
      return (
        <div
          ref={(el) => {
            if (el) {
              Object.defineProperty(el, 'scrollHeight', { get: () => mockScrollHeight, configurable: true });
              Object.defineProperty(el, 'scrollTop', { value: 400, writable: true, configurable: true });
              Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
              el.scrollTo = mockScrollTo;
              (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }
          }}
          data-testid="scroll-container"
        />
      );
    };

    render(<Wrapper />);
    const container = document.querySelector('[data-testid="scroll-container"]') as HTMLDivElement;

    // Simulate user near bottom -> isAutoScrollEngaged = true
    act(() => {
      container.dispatchEvent(new Event('scroll'));
    });

    // Simulate mid smooth-scroll animation: scrollTop hasn't reached target yet
    Object.defineProperty(container, 'scrollTop', { value: 350, writable: true, configurable: true });
    // New content arrives while animation is in progress
    mockScrollHeight = 600;

    const addedNode = document.createElement('span');
    const mockNodeList = { length: 1, 0: addedNode } as NodeList;
    act(() => {
      observerCallback([{ addedNodes: mockNodeList } as MutationRecord], {} as MutationObserver);
    });
    act(() => { vi.advanceTimersByTime(50); });

    // With the fix, isAutoScrollEngaged=true ensures scrollTo is called even mid-animation
    expect(mockScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 600 }),
    );
  });
});
