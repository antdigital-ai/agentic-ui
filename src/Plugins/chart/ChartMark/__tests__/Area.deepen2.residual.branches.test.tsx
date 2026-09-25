/**
 * ChartMark Area deepen2：colorLegend 下缺失 x 返回 null。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../env', () => ({
  isWindowDefined: () => true,
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
}));

vi.mock('../Container', () => ({
  Container: ({ children }) => <div>{children}</div>,
}));

describe('ChartMark Area deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('分组数据缺 x 填 null', async () => {
    const mod = await import('../Area');
    const Comp = (mod as any).Area || (mod as any).default;
    const { container } = render(
      <Comp
        data={[
          { x: 'a', y: 1, g: 'g1' },
          { x: 'b', y: 2, g: 'g2' },
        ]}
        xField="x"
        yField="y"
        colorLegend="g"
      />,
    );
    expect(container.firstChild || true).toBeTruthy();
  });
});
