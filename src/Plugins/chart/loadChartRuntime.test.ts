import { afterEach, describe, expect, it, vi } from 'vitest';

describe('loadChartRuntime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('在 window 未定义时抛出错误', async () => {
    const origWindow = (global as any).window;
    (global as any).window = undefined;

    const { loadChartRuntime } = await import('./loadChartRuntime');
    await expect(loadChartRuntime()).rejects.toThrow(
      '图表运行时仅在浏览器环境中可用',
    );

    (global as any).window = origWindow;
  });

  it('成功加载时返回包含各图表组件的运行时', async () => {
    const { loadChartRuntime } = await import('./loadChartRuntime');
    const runtime = await loadChartRuntime();

    expect(runtime).toHaveProperty('AreaChart');
    expect(runtime).toHaveProperty('BarChart');
    expect(runtime).toHaveProperty('DonutChart');
    expect(runtime).toHaveProperty('FunnelChart');
    expect(runtime).toHaveProperty('LineChart');
    expect(runtime).toHaveProperty('RadarChart');
    expect(runtime).toHaveProperty('ScatterChart');
    expect(typeof runtime.AreaChart).toBe('function');
    expect(typeof runtime.LineChart).toBe('function');
  });

  it('多次调用返回的运行时对象一致（缓存）', async () => {
    const { loadChartRuntime } = await import('./loadChartRuntime');
    const r1 = await loadChartRuntime();
    const r2 = await loadChartRuntime();
    expect(r1).toBe(r2);
  });

  it('import 失败时 catch 中重置 runtimeLoader 并抛出', async () => {
    vi.resetModules();
    vi.spyOn(Promise, 'all').mockRejectedValueOnce(new Error('chart load fail'));
    const { loadChartRuntime } = await import('./loadChartRuntime');
    await expect(loadChartRuntime()).rejects.toThrow('chart load fail');
    vi.restoreAllMocks();
  });
});
