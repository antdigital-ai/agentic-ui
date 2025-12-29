import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyElement } from '../../../MarkdownEditor/editor/components/LazyElement';

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

describe('LazyElement', () => {
  beforeEach(() => {
    // @ts-ignore
    global.IntersectionObserver = MockIntersectionObserver;
  });

  it('应该渲染占位符当元素不在视口内', () => {
    render(
      <LazyElement placeholderHeight={200}>
        <div data-testid="content">实际内容</div>
      </LazyElement>,
    );

    // 占位符应该存在
    const placeholder = document.querySelector('[aria-hidden="true"]');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.getAttribute('style')).toContain('min-height: 200');

    // 实际内容不应该渲染
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('应该使用默认的占位符高度', () => {
    render(
      <LazyElement>
        <div>内容</div>
      </LazyElement>,
    );

    const placeholder = document.querySelector('[aria-hidden="true"]');
    expect(placeholder?.getAttribute('style')).toContain('min-height: 25');
  });

  it('应该渲染内容当元素进入视口', async () => {
    let observerCallback: IntersectionObserverCallback;

    // Mock IntersectionObserver 来捕获回调
    global.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    } as any;

    render(
      <LazyElement>
        <div data-testid="content">实际内容</div>
      </LazyElement>,
    );

    // 模拟元素进入视口
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: document.createElement('div'),
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    };

    // 触发 IntersectionObserver 回调
    await waitFor(() => {
      if (observerCallback!) {
        observerCallback!(
          [mockEntry as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    });

    // 内容应该被渲染
    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeTruthy();
      expect(screen.getByTestId('content').textContent).toBe('实际内容');
    });
  });

  it('应该使用自定义的 rootMargin', () => {
    const observeSpy = vi.fn();

    global.IntersectionObserver = class {
      constructor(
        callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit,
      ) {}
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    } as any;

    render(
      <LazyElement rootMargin="300px">
        <div>内容</div>
      </LazyElement>,
    );

    expect(observeSpy).toHaveBeenCalled();
  });

  it('应该在卸载时断开 observer', () => {
    const disconnectSpy = vi.fn();

    global.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    } as any;

    const { unmount } = render(
      <LazyElement>
        <div>内容</div>
      </LazyElement>,
    );

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('应该应用自定义占位符样式', () => {
    const customStyle = {
      backgroundColor: 'red',
      border: '1px solid blue',
    };

    render(
      <LazyElement placeholderStyle={customStyle}>
        <div>内容</div>
      </LazyElement>,
    );

    const placeholder = document.querySelector('[aria-hidden="true"]');
    const style = placeholder?.getAttribute('style');
    expect(style).toContain('background-color: red');
    expect(style).toContain('border: 1px solid blue');
  });
});
