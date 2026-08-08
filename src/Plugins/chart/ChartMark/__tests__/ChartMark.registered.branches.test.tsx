/**
 * ChartMark Pie/Bar：二次挂载命中 already registered 分支。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../env', () => ({
  isWindowDefined: vi.fn(() => true),
}));

const { register } = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock('chart.js', () => ({
  Chart: { register },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="doughnut-chart">pie</div>,
  Bar: () => <div data-testid="bar-chart">bar</div>,
}));

vi.mock('../../ChartMark/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import { Bar } from '../../ChartMark/Bar';
import { Pie } from '../../ChartMark/Pie';

const props = {
  data: [{ name: 'A', value: 1 }],
  xField: 'name',
  yField: 'value',
  index: 0,
} as any;

describe('ChartMark registered branches', () => {
  it('第二次渲染 Pie 时跳过重复 register', () => {
    register.mockClear();
    const { unmount } = render(<Pie {...props} />);
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(register).toHaveBeenCalled();
    register.mockClear();
    unmount();
    render(<Pie {...props} />);
    expect(register).not.toHaveBeenCalled();
  });

  it('第二次渲染 Bar 时跳过重复 register', () => {
    register.mockClear();
    const { unmount } = render(<Bar {...props} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    register.mockClear();
    unmount();
    render(<Bar {...props} />);
    expect(register).not.toHaveBeenCalled();
  });
});
