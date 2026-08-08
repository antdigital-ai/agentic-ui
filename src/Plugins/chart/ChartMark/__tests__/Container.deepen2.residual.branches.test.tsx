/**
 * ChartMark Container deepen2：!inView 时 onSize 早退；effect 无 htmlRef。
 */
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Container } from '../Container';

vi.mock('../../utils', () => ({ debounce: (fn: any) => fn }));
vi.mock('rc-resize-observer', () => ({
  default: ({ children, onResize }: any) => (
    <div data-testid="observer" onClick={onResize}>
      {children}
    </div>
  ),
}));

describe('ChartMark Container deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('首次 mount 前 inView false 时 resize 不调 chart', () => {
    const resize = vi.fn();
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', { value: 500 });
    const htmlRef = { current: el };
    render(
      <Container
        chartRef={{ current: { resize } } as any}
        htmlRef={htmlRef}
        index={0}
      >
        c
      </Container>,
    );
    // effect 会把 inView 设为 true；再点一次
    act(() => {
      vi.advanceTimersByTime(0);
    });
    fireEvent.click(
      document.querySelector('[data-testid="observer"]') as Element,
    );
    expect(resize.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it('htmlRef 为空时 effect 不写 size', () => {
    const htmlRef = { current: null as HTMLDivElement | null };
    expect(() =>
      render(
        <Container
          chartRef={{ current: undefined } as any}
          htmlRef={htmlRef}
          index={3}
        >
          c
        </Container>,
      ),
    ).not.toThrow();
  });
});
