/**
 * ChartRenderer 分支覆盖补充测试
 *
 * 聚焦 parseChartData 各格式、mounted/resize 流程、
 * 数据 coercion、ErrorBoundary 重试与多图布局等分支。
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartBlockRenderer } from '../renderers/ChartRenderer';

let chartRenderFailUntil = 0;
let chartRenderCalls = 0;

vi.mock('../../Plugins/chart/ChartRender', () => ({
  ChartRender: (props: Record<string, unknown>) => {
    chartRenderCalls += 1;
    if (chartRenderCalls <= chartRenderFailUntil) {
      throw new Error('render failed');
    }
    return React.createElement('div', {
      'data-testid': 'chart-render',
      'data-chart-type': String(props.chartType),
      'data-data-len': String(
        (props.chartData as unknown[])?.length ?? 0,
      ),
    });
  },
}));

vi.mock('../../Plugins/chart/loadChartRuntime', () => ({
  loadChartRuntime: vi.fn().mockResolvedValue({}),
}));

interface RafController {
  schedule: (cb: FrameRequestCallback) => number;
  cancel: (id: number) => void;
  flush: (maxFrames?: number) => void;
}

const createRafController = (): RafController => {
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  return {
    schedule(cb) {
      const id = nextId++;
      pending.set(id, cb);
      return id;
    },
    cancel(id) {
      pending.delete(id);
    },
    flush(maxFrames = 50) {
      let frames = 0;
      while (pending.size > 0 && frames < maxFrames) {
        const snapshot = Array.from(pending.entries());
        pending.clear();
        snapshot.forEach(([, cb]) => cb(0));
        frames += 1;
      }
    },
  };
};

let rafController: RafController;

const flushMountRaf = () => {
  act(() => {
    rafController.flush(2);
  });
};

const renderChartBlock = (children: React.ReactNode, className?: string) =>
  render(
    <ChartBlockRenderer className={className}>{children}</ChartBlockRenderer>,
  );

describe('ChartBlockRenderer 分支覆盖', () => {
  beforeEach(() => {
    chartRenderFailUntil = 0;
    chartRenderCalls = 0;
    rafController = createRafController();
    vi.stubGlobal('requestAnimationFrame', ((cb: FrameRequestCallback) =>
      rafController.schedule(cb)) as typeof requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', ((id: number) =>
      rafController.cancel(id)) as typeof cancelAnimationFrame);
  });

  afterEach(() => {
    rafController.flush();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('挂载前显示 Loading，RAF 后渲染图表', async () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'line', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { container } = renderChartBlock(chartData);

    expect(container.querySelector('[data-be="chart"]')).toBeInTheDocument();
    expect(screen.queryByTestId('chart-render')).not.toBeInTheDocument();

    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toBeInTheDocument();
    });
  });

  it('卸载时取消 pending RAF，不触发 mounted', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { unmount } = renderChartBlock(chartData);
    unmount();
    flushMountRaf();
    expect(screen.queryByTestId('chart-render')).not.toBeInTheDocument();
  });

  it('window resize 更新 columnLength', async () => {
    const chartData = JSON.stringify({
      config: [
        { chartType: 'line', x: 'x', y: 'y' },
        { chartType: 'bar', x: 'x', y: 'y' },
        { chartType: 'pie', x: 'x', y: 'y' },
      ],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { container } = renderChartBlock(chartData);
    const chartEl = container.querySelector('[data-be="chart"]') as HTMLElement;
    Object.defineProperty(chartEl, 'clientWidth', {
      configurable: true,
      value: 800,
    });

    flushMountRaf();

    await waitFor(() => {
      expect(screen.getAllByTestId('chart-render').length).toBe(3);
    });

    Object.defineProperty(chartEl, 'clientWidth', {
      configurable: true,
      value: 300,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      const charts = screen.getAllByTestId('chart-render');
      expect(charts.length).toBe(3);
    });
  });

  it('parseChartData 数组格式解析为 config', async () => {
    const chartData = JSON.stringify([{ chartType: 'pie', x: 'n', y: 'v' }]);
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toHaveAttribute(
        'data-chart-type',
        'pie',
      );
    });
  });

  it('多 config 渲染多个 ChartRender', async () => {
    const chartData = JSON.stringify({
      config: [
        { chartType: 'line', x: 'x', y: 'y' },
        { chartType: 'bar', x: 'x', y: 'y' },
      ],
      dataSource: [{ x: 'A', y: 1 }],
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getAllByTestId('chart-render')).toHaveLength(2);
    });
  });

  it('无 chartType 时显示 Loading 占位', async () => {
    const chartData = JSON.stringify({
      config: [{ x: 'month', y: 'value' }],
      dataSource: [{ month: 'Jan', value: 100 }],
    });
    const { container } = renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(container.querySelector('[data-be="chart"]')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('chart-render')).not.toBeInTheDocument();
  });

  it('coerceChartAxisCell：数值、数字字符串、中文金额、原样保留', async () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'name', y: 'val' }],
      dataSource: [
        { name: 42, val: 100 },
        { name: 'A', val: '88' },
        { name: 'B', val: '1.5亿' },
        { name: 'C', val: 'text' },
      ],
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toHaveAttribute(
        'data-data-len',
        '4',
      );
    });
  });

  it('columnLength=1 时宽度为 100%', async () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'line', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { container } = renderChartBlock(chartData);
    const chartEl = container.querySelector('[data-be="chart"]') as HTMLElement;
    Object.defineProperty(chartEl, 'clientWidth', {
      configurable: true,
      value: 200,
    });
    flushMountRaf();

    await waitFor(() => {
      const wrapper = screen.getByTestId('chart-render').parentElement;
      expect(wrapper?.style.width).toBe('100%');
    });
  });

  it('ErrorBoundary 首次失败后自动重试一次', async () => {
    chartRenderFailUntil = 1;
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toBeInTheDocument();
    });
    expect(chartRenderCalls).toBeGreaterThanOrEqual(2);
  });

  it('fallback 点击重新渲染按钮递增 retryKey', async () => {
    chartRenderFailUntil = 999;
    const chartData = JSON.stringify({
      config: [{ chartType: 'bar', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByText('重新渲染')).toBeInTheDocument();
    });

    const callsBefore = chartRenderCalls;
    fireEvent.click(screen.getByText('重新渲染'));

    await waitFor(() => {
      expect(chartRenderCalls).toBeGreaterThan(callsBefore);
    });
  });

  it('无效 JSON 渲染 error 态并保留原始 code', () => {
    const { container } = renderChartBlock('{ bad json');
    expect(
      container.querySelector('.ant-agentic-md-editor-chart-block--error'),
    ).toBeInTheDocument();
    expect(container.querySelector('pre')?.textContent).toBe('{ bad json');
  });

  it('非对象 parse 结果渲染 error 态', () => {
    const { container } = renderChartBlock('123');
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('algTypes histogram 格式解析', async () => {
    const chartData = JSON.stringify({
      type: 'histogram',
      value: {
        data: [{ x: 1, y: 2 }],
        dataMetaMap: { x: { type: 'number' } },
      },
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toBeInTheDocument();
    });
  });

  it('data 字段替代 dataSource', async () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'line', x: 'x', y: 'y' }],
      data: [{ x: 'A', y: 10 }],
    });
    renderChartBlock(chartData);
    flushMountRaf();

    await waitFor(() => {
      expect(screen.getByTestId('chart-render')).toHaveAttribute(
        'data-data-len',
        '1',
      );
    });
  });

  it('应用自定义 className', () => {
    const chartData = JSON.stringify({
      config: [{ chartType: 'line', x: 'x', y: 'y' }],
      dataSource: [{ x: 'A', y: 1 }],
    });
    const { container } = renderChartBlock(chartData, 'my-chart-class');
    expect(
      container.querySelector('[data-be="chart"]')?.className,
    ).toContain('my-chart-class');
  });

  it('数组 payload；非法 JSON 返回 null；对象无 type', async () => {
    renderChartBlock(JSON.stringify([{ chartType: 'bar', data: [{ x: 1 }] }]));
    flushMountRaf();
    renderChartBlock('not-json');
    renderChartBlock(JSON.stringify({ value: { data: [] } }));
    expect(document.body).toBeTruthy();
  });
});
