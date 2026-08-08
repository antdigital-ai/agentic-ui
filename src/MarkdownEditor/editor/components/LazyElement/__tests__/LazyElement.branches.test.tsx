import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyElement } from '../index';

describe('LazyElement 分支覆盖', () => {
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let ObserverCtor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();
    ObserverCtor = vi.fn(function (this: any, cb: IntersectionObserverCallback) {
      this.cb = cb;
      this.observe = observe;
      this.disconnect = disconnect;
      this.unobserve = vi.fn();
      (ObserverCtor as any).last = this;
    });
    vi.stubGlobal('IntersectionObserver', ObserverCtor);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('默认占位符使用 placeholderHeight / placeholderStyle', () => {
    const { container } = render(
      <LazyElement placeholderHeight={40} placeholderStyle={{ opacity: 0.5 }}>
        <span>content</span>
      </LazyElement>,
    );
    const placeholder = container.querySelector('[aria-hidden="true"]');
    expect(placeholder).toHaveStyle({ minHeight: '40px', opacity: '0.5' });
  });

  it('renderPlaceholder 透传 elementInfo 与 isIntersecting', () => {
    render(
      <LazyElement
        elementInfo={{ type: 'paragraph', index: 1, total: 3 }}
        renderPlaceholder={({ height, elementInfo, isIntersecting }) => (
          <div data-testid="ph">
            {height}:{elementInfo?.type}:{String(isIntersecting)}
          </div>
        )}
      >
        <span>x</span>
      </LazyElement>,
    );
    expect(screen.getByTestId('ph').textContent).toContain('paragraph');
  });

  it('IntersectionObserver 相交后渲染 children 并 disconnect', () => {
    render(
      <LazyElement>
        <span data-testid="lazy-child">ready</span>
      </LazyElement>,
    );
    expect(screen.queryByTestId('lazy-child')).toBeNull();

    const inst = (ObserverCtor as any).last;
    act(() => {
      inst.cb([{ isIntersecting: true }]);
    });
    expect(screen.getByTestId('lazy-child')).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
  });

  it('非相交保持占位；rootMargin 解析失败回退 200', () => {
    const { container } = render(
      <LazyElement rootMargin="not-a-number">
        <span>hidden</span>
      </LazyElement>,
    );
    const inst = (ObserverCtor as any).last;
    act(() => {
      inst.cb([{ isIntersecting: false }]);
    });
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('初始在视口内时 setTimeout 路径直接渲染', async () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top: 10,
        bottom: 50,
        left: 10,
        right: 50,
        height: 40,
        width: 40,
      }),
    });
    render(
      <LazyElement>
        <span data-testid="viewport-child">in-view</span>
      </LazyElement>,
      { container: document.body.appendChild(el) },
    );
    await act(async () => {
      vi.advanceTimersByTime(120);
    });
    expect(screen.getByTestId('viewport-child')).toBeInTheDocument();
    vi.clearAllTimers();
    // 仅在本用例末尾恢复，避免 afterEach 里 useRealTimers 触发负 duration
    vi.useRealTimers();
  });
});
