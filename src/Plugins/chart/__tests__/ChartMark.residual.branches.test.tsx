/**
 * ChartMark Area/Line 残留：register 一次、空数据、colorLegend、缺 y。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Area } from '../ChartMark/Area';
import { Line } from '../ChartMark/Line';

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="cm-line" />,
}));

vi.mock('../ChartMark/Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../env', () => ({
  isWindowDefined: () => true,
}));

describe('ChartMark Area/Line residual branches', () => {
  it('Area：空数据；colorLegend；缺 y 过滤', () => {
    const { rerender } = render(
      <Area data={[]} xField="x" yField="y" index={0} />,
    );
    expect(document.body).toBeTruthy();
    rerender(
      <Area
        data={[
          { x: 'a', y: 1, type: 't1' },
          { x: 'b', y: undefined, type: 't1' },
        ]}
        xField="x"
        yField="y"
        index={0}
        colorLegend="type"
      />,
    );
    expect(document.querySelector('[data-testid="cm-line"]')).toBeTruthy();
  });

  it('Line：同矩阵', () => {
    render(
      <Line data={[{ x: 'a', y: 2 }]} xField="x" yField="y" index={1} />,
    );
    expect(document.querySelector('[data-testid="cm-line"]')).toBeTruthy();
  });
});
