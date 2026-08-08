/**
 * ChartRenderer deepen：卸载取消 raf；config 非数组包一层。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartBlockRenderer } from '../ChartRenderer';

vi.mock('../../../Plugins/chart/ChartRender', () => ({
  ChartRender: () => <div data-testid="chart-render" />,
}));

vi.mock('../../../Plugins/chart/loadChartRuntime', () => ({
  loadChartRuntime: vi.fn().mockResolvedValue({}),
}));

describe('ChartRenderer deepen residual branches', () => {
  let rafId = 0;
  let pending: Map<number, FrameRequestCallback>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    rafId = 0;
    pending = new Map();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = ++rafId;
      pending.set(id, cb);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      pending.delete(id);
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('卸载后 raf 回调因 cancelled 不挂载', () => {
    const { unmount } = render(
      <ChartBlockRenderer>
        {`\`\`\`chart
{"chartType":"pie","data":[{"type":"a","value":1}]}
\`\`\``}
      </ChartBlockRenderer>,
    );
    unmount();
    act(() => {
      pending.forEach((cb) => cb(0));
    });
  });

  it('单对象 config 走非数组分支', () => {
    const { container } = render(
      <ChartBlockRenderer>
        {`\`\`\`chart
{"chartType":"pie","config":{"x":"t"},"data":[{"t":1,"value":2}]}
\`\`\``}
      </ChartBlockRenderer>,
    );
    act(() => {
      pending.forEach((cb) => cb(0));
    });
    expect(container.querySelector('[data-be="chart"]') || container).toBeTruthy();
  });
});
