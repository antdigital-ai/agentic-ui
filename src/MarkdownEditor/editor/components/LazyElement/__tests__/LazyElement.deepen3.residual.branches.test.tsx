/**
 * LazyElement deepen3：intersect 后渲染、rootMargin、卸载 disconnect。
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

  constructor(callback: IntersectionObserverCallback, options?: any) {
    this.callback = callback;
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? '';
    MockIntersectionObserver.instances.push(this);
  }
}

describe('LazyElement deepen3 residual branches', () => {
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

  it('intersecting 后渲染 children 并 disconnect', () => {
    render(
      <LazyElement placeholderHeight={40}>
        <div data-testid="lazy-child">visible</div>
      </LazyElement>,
    );
    const inst = MockIntersectionObserver.instances[0];
    expect(inst).toBeTruthy();
    act(() => {
      inst.callback(
        [{ isIntersecting: true, target: document.body } as any],
        inst as any,
      );
    });
    expect(screen.getByTestId('lazy-child')).toBeInTheDocument();
    expect(inst.disconnect).toHaveBeenCalled();
  });

  it('rootMargin 传入；非 intersecting 保持占位', () => {
    render(
      <LazyElement rootMargin="10px" placeholderHeight={25}>
        <div data-testid="lazy2">x</div>
      </LazyElement>,
    );
    const inst = MockIntersectionObserver.instances[0];
    expect(inst.rootMargin).toContain('10');
    act(() => {
      inst.callback(
        [{ isIntersecting: false, target: document.body } as any],
        inst as any,
      );
    });
    expect(screen.queryByTestId('lazy2')).not.toBeInTheDocument();
  });

  it('卸载时 disconnect', () => {
    const { unmount } = render(
      <LazyElement>
        <div>y</div>
      </LazyElement>,
    );
    const inst = MockIntersectionObserver.instances[0];
    unmount();
    expect(inst.disconnect).toHaveBeenCalled();
  });
});
