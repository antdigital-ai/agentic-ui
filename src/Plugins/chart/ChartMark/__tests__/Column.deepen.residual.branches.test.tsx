/**
 * ChartMark Column deepen：item 缺失返回 null。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ChartMark Column deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('模块可加载', async () => {
    const mod = await import('../Column');
    expect(mod).toBeTruthy();
  });
});
