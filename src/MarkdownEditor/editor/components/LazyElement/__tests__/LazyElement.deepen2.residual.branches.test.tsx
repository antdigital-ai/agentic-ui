/**
 * LazyElement deepen2：无 container 早退、observer 重连 disconnect、
 * 零尺寸跳过 fallback、window 尺寸回退 documentElement。
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

describe('LazyElement deepen2 residual branches', () => {
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

  it('零尺寸元素：100ms fallback 不强制可见', () => {
    const { container } = render(
      <LazyElement rootMargin="50px" placeholderHeight={30}>
        <div data-testid="zero">z</div>
      </LazyElement>,
    );
    const host = container.firstChild as HTMLElement;
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByTestId('zero')).toBeNull();
  });

  it('innerHeight/Width 为 0 时用 documentElement 尺寸', () => {
    const origH = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const origW = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      get: () => 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      get: () => 0,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      get: () => 800,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => 1000,
    });

    const { container } = render(
      <LazyElement rootMargin="10px">
        <div data-testid="doc-fb">d</div>
      </LazyElement>,
    );
    const host = container.firstChild as HTMLElement;
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 40,
      left: 10,
      right: 80,
      width: 70,
      height: 30,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('doc-fb')).toBeInTheDocument();

    if (origH) Object.defineProperty(window, 'innerHeight', origH);
    if (origW) Object.defineProperty(window, 'innerWidth', origW);
  });

  it('rootMargin 变化时 disconnect 旧 observer 再创建', () => {
    const { rerender } = render(
      <LazyElement rootMargin="20px">
        <div data-testid="rm">r</div>
      </LazyElement>,
    );
    const first = MockIntersectionObserver.instances[0];
    expect(first).toBeTruthy();

    rerender(
      <LazyElement rootMargin="120px">
        <div data-testid="rm">r</div>
      </LazyElement>,
    );
    expect(first?.disconnect).toHaveBeenCalled();
    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(1);
  });

  it('自定义 renderPlaceholder', () => {
    render(
      <LazyElement
        renderPlaceholder={() => <div data-testid="ph">ph</div>}
        placeholderStyle={{ opacity: 0.5 }}
      >
        <div data-testid="child-ph">c</div>
      </LazyElement>,
    );
    expect(screen.getByTestId('ph')).toBeInTheDocument();
    expect(screen.queryByTestId('child-ph')).toBeNull();
  });
});
