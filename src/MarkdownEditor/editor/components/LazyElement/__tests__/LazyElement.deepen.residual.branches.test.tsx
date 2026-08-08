/**
 * LazyElement deepen residual：rootMargin 解析、视口 fallback、hasRendered
 * 短路、disconnect 清理、非交叉不渲染。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyElement } from '../index';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  takeRecords = () => [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
}

describe('LazyElement deepen residual branches', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    MockIntersectionObserver.instances = [];
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非交叉保持占位；交叉后 disconnect', () => {
    render(
      <LazyElement placeholderHeight={40} rootMargin="80px">
        <div data-testid="lazy-child">hi</div>
      </LazyElement>,
    );
    act(() => {
      MockIntersectionObserver.instances[0]?.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.queryByTestId('lazy-child')).toBeNull();

    act(() => {
      MockIntersectionObserver.instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('lazy-child')).toBeInTheDocument();
    expect(MockIntersectionObserver.instances[0]?.disconnect).toHaveBeenCalled();
  });

  it('100ms 视口 fallback：有尺寸时强制可见', () => {
    const { container } = render(
      <LazyElement rootMargin="bad-margin" placeholderHeight={50}>
        <div data-testid="fb">fb</div>
      </LazyElement>,
    );
    const host = container.firstChild as HTMLElement;
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 60,
      left: 10,
      right: 100,
      width: 90,
      height: 50,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('fb')).toBeInTheDocument();
  });

  it('已渲染后 rootMargin 变化不重建观察（hasRendered 短路）', () => {
    const { rerender } = render(
      <LazyElement rootMargin="10px">
        <div data-testid="c">c</div>
      </LazyElement>,
    );
    act(() => {
      MockIntersectionObserver.instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    const countAfter = MockIntersectionObserver.instances.length;
    rerender(
      <LazyElement rootMargin="300px">
        <div data-testid="c">c</div>
      </LazyElement>,
    );
    expect(MockIntersectionObserver.instances.length).toBe(countAfter);
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('renderPlaceholder 在 isIntersecting 时仍可显示占位直至真正交叉', () => {
    render(
      <LazyElement
        renderPlaceholder={({ isIntersecting }) => (
          <div data-testid="ph">{isIntersecting ? 'near' : 'far'}</div>
        )}
      >
        <span data-testid="real">r</span>
      </LazyElement>,
    );
    expect(screen.getByTestId('ph')).toHaveTextContent('far');
    act(() => {
      MockIntersectionObserver.instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('real')).toBeInTheDocument();
  });
});
