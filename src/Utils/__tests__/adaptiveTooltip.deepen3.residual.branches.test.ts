/**
 * adaptiveTooltip deepen3：重复订阅与 window 事件广播去重。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adaptiveTooltipEnvironment,
  subscribeAdaptiveTooltipEnvironment,
} from '../adaptiveTooltip';

describe('adaptiveTooltip deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('二次订阅与同值 resize 不重复广播', () => {
    const spy = vi
      .spyOn(adaptiveTooltipEnvironment, 'isInformationalClickContext')
      .mockReturnValue(false);
    const a = vi.fn();
    const b = vi.fn();
    const ua = subscribeAdaptiveTooltipEnvironment(a);
    const ub = subscribeAdaptiveTooltipEnvironment(b);
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    ua();
    ub();
    expect(spy).toHaveBeenCalled();
  });
});
