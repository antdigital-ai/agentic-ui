/**
 * FunnelChart index deepen6 safe：空 data / null；height 字符串。
 * 与 FunnelChart.more.residual 隔离，勿复活 quarantine 文件名。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart from '../index';

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: { generateLabels: vi.fn(() => []) },
          onClick: vi.fn(),
        },
      },
    },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: any) => {
    (globalThis as any).__funnelIdx6 = data;
    return <div data-testid="funnel-idx6" />;
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'fi6' }),
}));

vi.mock('../../ChartStatistic', () => ({
  default: () => null,
}));

vi.mock('../../components', () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartToolBar: ({ title }: any) => <div data-testid="tb-i6">{title}</div>,
  ChartFilter: () => null,
  downloadChart: vi.fn(),
}));

describe('FunnelChart index deepen6 safe residual', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 data / null 不抛', () => {
    expect(() => render(<FunnelChart data={[]} />)).not.toThrow();
    cleanup();
    expect(() => render(<FunnelChart data={null as any} />)).not.toThrow();
  });

  it('height 字符串 px；title', () => {
    render(
      <FunnelChart
        data={[
          { x: 'A', y: 10 },
          { x: 'B', y: 5 },
        ]}
        height={'120px' as any}
        title="idx6"
      />,
    );
    expect(screen.getByTestId('tb-i6')).toHaveTextContent('idx6');
    expect((globalThis as any).__funnelIdx6).toBeTruthy();
  });
});
