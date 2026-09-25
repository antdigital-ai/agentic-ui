import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TypingAnimation } from '../index';

describe('TypingAnimation 分支覆盖补洞', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('words 数组循环；showCursor / cursorStyle', async () => {
    vi.useFakeTimers();
    render(
      <ConfigProvider>
        <TypingAnimation
          words={['Hi', 'Yo']}
          typeSpeed={1}
          deleteSpeed={1}
          pauseDelay={1}
          delay={0}
          loop
          showCursor
          blinkCursor
          cursorStyle="block"
          startOnView={false}
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(document.body.textContent).toBeTruthy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('children 字符串；as=div；underscore cursor', () => {
    render(
      <ConfigProvider>
        <TypingAnimation as="div" showCursor cursorStyle="underscore" startOnView={false}>
          Hello
        </TypingAnimation>
      </ConfigProvider>,
    );
    expect(screen.getByText(/H|Hello/)).toBeTruthy();
  });

  it('无 IntersectionObserver 时 startOnView 直接开始', () => {
    const original = window.IntersectionObserver;
    // @ts-expect-error test
    delete window.IntersectionObserver;
    render(
      <ConfigProvider>
        <TypingAnimation startOnView words={['A']} typeSpeed={1} delay={0} />
      </ConfigProvider>,
    );
    expect(document.body.textContent).toBeTruthy();
    window.IntersectionObserver = original;
  });

  it.skip('非字符串 children 直接渲染', () => {
    render(
      <ConfigProvider>
        <TypingAnimation startOnView={false}>
          <span data-testid="node-child">X</span>
        </TypingAnimation>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('node-child')).toBeInTheDocument();
  });
});
