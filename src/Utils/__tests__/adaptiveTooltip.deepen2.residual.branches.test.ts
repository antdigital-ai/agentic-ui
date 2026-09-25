/**
 * adaptiveTooltip deepen2：环境探测与 trigger props。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAdaptiveTooltipProps,
  getAdaptiveTooltipTriggerPropsSnapshot,
  shouldUseInformationalTooltipClickTrigger,
  subscribeAdaptiveTooltipEnvironment,
} from '../adaptiveTooltip';

describe('adaptiveTooltip deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('订阅环境并读取 informational/interactive props', () => {
    const unsub = subscribeAdaptiveTooltipEnvironment(() => undefined);
    expect(typeof shouldUseInformationalTooltipClickTrigger()).toBe('boolean');
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toBeTruthy();
    expect(getAdaptiveTooltipProps('interactive')).toBeTruthy();
    unsub();
  });
});
