/**
 * ChartMark Container deepen：!inView / 无 chart 早退、resize 阈值、clientWidth||0。
 */
import '@testing-library/jest-dom';
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

describe('ChartMark Container deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('mount 后 inView；无 chart 时 resize 不抛错', () => {
    const htmlRef = { current: null as HTMLDivElement | null };
    const { getByTestId } = render(
      <Container
        chartRef={{ current: undefined } as any}
        htmlRef={htmlRef}
        index={0}
      >
        chart
      </Container>,
    );
    expect(() => fireEvent.click(getByTestId('observer'))).not.toThrow();
  });

  it('宽度变化 >30 触发 chart.resize；<30 不触发', async () => {
    const resize = vi.fn();
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientWidth', {
      configurable: true,
      get: () => (el as any).__w ?? 100,
    });
    const htmlRef = { current: el };
    const chartRef = { current: { resize } as any };

    const { getByTestId, rerender } = render(
      <Container chartRef={chartRef} htmlRef={htmlRef} index={1}>
        chart
      </Container>,
    );
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    (el as any).__w = 200;
    fireEvent.click(getByTestId('observer'));
    expect(resize).toHaveBeenCalled();

    resize.mockClear();
    (el as any).__w = 210;
    fireEvent.click(getByTestId('observer'));
    expect(resize).not.toHaveBeenCalled();

    rerender(
      <Container chartRef={chartRef} htmlRef={htmlRef} index={1}>
        chart2
      </Container>,
    );
  });

  it('htmlRef.current 为空时 clientWidth 走 0', () => {
    const resize = vi.fn();
    const htmlRef = { current: null as HTMLDivElement | null };
    const { getByTestId } = render(
      <Container
        chartRef={{ current: { resize } } as any}
        htmlRef={htmlRef}
        index={2}
      >
        chart
      </Container>,
    );
    fireEvent.click(getByTestId('observer'));
    expect(resize).toHaveBeenCalled();
  });
});
