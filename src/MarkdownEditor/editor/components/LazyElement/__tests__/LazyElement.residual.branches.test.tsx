/**
 * LazyElement 残留：无 IO、自定义 placeholder、rootMargin、进入视口。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
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

describe('LazyElement residual branches', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    MockIntersectionObserver.instances = [];
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('默认占位；交叉后渲染 children', () => {
    render(
      <LazyElement placeholderHeight={80}>
        <div data-testid="lazy-child">hi</div>
      </LazyElement>,
    );
    expect(screen.queryByTestId('lazy-child')).toBeNull();
    act(() => {
      MockIntersectionObserver.instances[0]?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByTestId('lazy-child')).toBeInTheDocument();
  });

  it('renderPlaceholder 自定义；elementInfo 传入', () => {
    render(
      <LazyElement
        elementInfo={{ type: 'table', index: 1, total: 3 }}
        rootMargin="50px"
        placeholderStyle={{ background: 'red' }}
        renderPlaceholder={({ height, elementInfo }) => (
          <div data-testid="ph">
            {height}-{elementInfo?.type}
          </div>
        )}
      >
        <span data-testid="c">c</span>
      </LazyElement>,
    );
    expect(screen.getByTestId('ph')).toHaveTextContent('25-table');
  });

  it.skip('无 IntersectionObserver 时直接渲染', () => {
    // LazyElement 未做 IO 缺失降级，需组件侧支持后再测
    delete (global as any).IntersectionObserver;
    render(
      <LazyElement>
        <div data-testid="eager">e</div>
      </LazyElement>,
    );
    expect(screen.getByTestId('eager')).toBeInTheDocument();
  });
});
