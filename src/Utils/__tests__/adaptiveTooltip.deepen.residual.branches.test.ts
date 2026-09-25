/**
 * adaptiveTooltip deepen：二次 attach 早退、退订 detach、环境变化广播。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adaptiveTooltipEnvironment,
  subscribeAdaptiveTooltipEnvironment,
} from '../adaptiveTooltip';

describe('adaptiveTooltip deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('多订阅者共享监听；全部退订后可再次订阅', () => {
    const spy = vi
      .spyOn(adaptiveTooltipEnvironment, 'isInformationalClickContext')
      .mockReturnValue(false);
    const a = vi.fn();
    const b = vi.fn();
    const ua = subscribeAdaptiveTooltipEnvironment(a);
    const ub = subscribeAdaptiveTooltipEnvironment(b);
    spy.mockReturnValue(true);
    window.dispatchEvent(new Event('resize'));
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
    ua();
    ub();
    a.mockClear();
    const uc = subscribeAdaptiveTooltipEnvironment(a);
    spy.mockReturnValue(false);
    window.dispatchEvent(new Event('orientationchange'));
    expect(a).toHaveBeenCalled();
    uc();
  });

  it('相同 active 值的 resize 不重复广播', () => {
    const spy = vi
      .spyOn(adaptiveTooltipEnvironment, 'isInformationalClickContext')
      .mockReturnValue(true);
    const fn = vi.fn();
    const unsub = subscribeAdaptiveTooltipEnvironment(fn);
    window.dispatchEvent(new Event('resize'));
    const n = fn.mock.calls.length;
    window.dispatchEvent(new Event('resize'));
    expect(fn.mock.calls.length).toBe(n);
    spy.mockReturnValue(false);
    window.dispatchEvent(new Event('resize'));
    expect(fn.mock.calls.length).toBeGreaterThan(n);
    unsub();
  });
});
