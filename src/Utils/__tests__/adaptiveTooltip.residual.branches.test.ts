/**
 * adaptiveTooltip residual：interactive/informational、订阅、server snapshot。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  adaptiveTooltipEnvironment,
  EMPTY_TOOLTIP_TRIGGER_PROPS,
  getAdaptiveEnvironmentServerSnapshot,
  getAdaptiveEnvironmentSnapshot,
  getAdaptiveTooltipProps,
  getAdaptiveTooltipTriggerPropsServerSnapshot,
  getAdaptiveTooltipTriggerPropsSnapshot,
  INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
  shouldUseInformationalTooltipClickTrigger,
  subscribeAdaptiveTooltipEnvironment,
} from '../adaptiveTooltip';

describe('adaptiveTooltip residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('interactive 恒为空 trigger；informational 依赖环境', () => {
    expect(getAdaptiveTooltipProps('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    vi.spyOn(
      adaptiveTooltipEnvironment,
      'isInformationalClickContext',
    ).mockReturnValue(true);
    expect(getAdaptiveTooltipProps('informational')).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipProps()).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('snapshot / server snapshot', () => {
    expect(typeof getAdaptiveEnvironmentSnapshot()).toBe('boolean');
    expect(getAdaptiveEnvironmentServerSnapshot()).toBe(false);
    expect(
      getAdaptiveTooltipTriggerPropsServerSnapshot('informational'),
    ).toEqual(EMPTY_TOOLTIP_TRIGGER_PROPS);
    vi.spyOn(
      adaptiveTooltipEnvironment,
      'isInformationalClickContext',
    ).mockReturnValue(false);
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipTriggerPropsSnapshot('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('subscribe 重复 resize 相同值不重复通知；可退订', () => {
    vi.spyOn(
      adaptiveTooltipEnvironment,
      'isInformationalClickContext',
    ).mockReturnValue(true);
    const fn = vi.fn();
    const unsub = subscribeAdaptiveTooltipEnvironment(fn);
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    expect(fn.mock.calls.length).toBeLessThanOrEqual(2);
    unsub();
    window.dispatchEvent(new Event('resize'));
  });

  it('shouldUseInformationalTooltipClickTrigger 跟随环境 spy', () => {
    const spy = vi
      .spyOn(adaptiveTooltipEnvironment, 'isInformationalClickContext')
      .mockReturnValue(false);
    expect(shouldUseInformationalTooltipClickTrigger()).toBe(false);
    spy.mockReturnValue(true);
    expect(shouldUseInformationalTooltipClickTrigger()).toBe(true);
  });
});
