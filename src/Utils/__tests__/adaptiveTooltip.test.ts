import { afterEach, describe, expect, it, vi } from 'vitest';
import {
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

describe('adaptiveTooltip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('window 未定义时 getAdaptiveTooltipProps 返回空对象', () => {
    vi.stubGlobal('window', undefined);
    expect(getAdaptiveTooltipProps('informational')).toEqual({});
    expect(getAdaptiveTooltipProps('interactive')).toEqual({});
  });

  it('interactive 种类不附加 click trigger', () => {
    vi.stubGlobal('window', { innerWidth: 375 });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    expect(getAdaptiveTooltipProps('interactive')).toEqual({});
    expect(getAdaptiveTooltipProps('informational')).toEqual({
      trigger: ['hover', 'click'],
    });
  });

  it('shouldUseInformationalTooltipClickTrigger 在触摸能力下为 true', () => {
    vi.stubGlobal('window', {
      innerWidth: 1920,
      ontouchstart: null,
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 10,
    });
    expect(shouldUseInformationalTooltipClickTrigger()).toBe(true);
  });

  it('桌面 informational 场景返回空 trigger', () => {
    vi.stubGlobal('window', { innerWidth: 1920 });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    expect(getAdaptiveTooltipProps('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('server snapshot 恒为保守默认值', () => {
    expect(getAdaptiveEnvironmentServerSnapshot()).toBe(false);
    expect(
      getAdaptiveTooltipTriggerPropsServerSnapshot('informational'),
    ).toEqual(EMPTY_TOOLTIP_TRIGGER_PROPS);
    expect(getAdaptiveTooltipTriggerPropsServerSnapshot('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('getAdaptiveEnvironmentSnapshot 读取当前环境', () => {
    vi.stubGlobal('window', { innerWidth: 375 });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    expect(getAdaptiveEnvironmentSnapshot()).toBe(true);
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('subscribeAdaptiveTooltipEnvironment 在 resize 时通知订阅者', () => {
    const listeners: Record<string, EventListener> = {};
    const onChange = vi.fn();

    vi.stubGlobal('window', {
      innerWidth: 1920,
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        listeners[type] = listener;
      }),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });

    const unsubscribe = subscribeAdaptiveTooltipEnvironment(onChange);
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    // 首次 resize 会初始化 lastBroadcastActive 并广播一次
    listeners.resize?.(new Event('resize'));
    expect(onChange).toHaveBeenCalledTimes(1);

    // 环境未变时不重复通知
    listeners.resize?.(new Event('resize'));
    expect(onChange).toHaveBeenCalledTimes(1);

    vi.stubGlobal('window', {
      innerWidth: 375,
      addEventListener: window.addEventListener,
      removeEventListener: window.removeEventListener,
    });
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });

    listeners.resize?.(new Event('resize'));
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    expect(window.removeEventListener).toHaveBeenCalled();
  });

  it('多订阅者共享一对 window 监听，最后取消订阅才拆除', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal('window', {
      innerWidth: 1920,
      addEventListener,
      removeEventListener,
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });

    const first = subscribeAdaptiveTooltipEnvironment(vi.fn());
    expect(addEventListener).toHaveBeenCalledTimes(2);
    expect(addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(addEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function),
    );

    const second = subscribeAdaptiveTooltipEnvironment(vi.fn());
    expect(addEventListener).toHaveBeenCalledTimes(2);

    first();
    expect(removeEventListener).not.toHaveBeenCalled();

    second();
    expect(removeEventListener).toHaveBeenCalledTimes(2);
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function),
    );
  });

  it('window 未定义时 subscribe 返回空清理函数', () => {
    vi.stubGlobal('window', undefined);
    const cleanup = subscribeAdaptiveTooltipEnvironment(vi.fn());
    expect(cleanup()).toBeUndefined();
  });

  it('window 未定义时 snapshot 函数返回保守默认值', () => {
    vi.stubGlobal('window', undefined);
    expect(getAdaptiveEnvironmentSnapshot()).toBe(false);
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipTriggerPropsSnapshot('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('navigator 未定义时不视为触摸环境', () => {
    vi.stubGlobal('window', { innerWidth: 1920 });
    vi.stubGlobal('navigator', undefined);
    expect(shouldUseInformationalTooltipClickTrigger()).toBe(false);
  });
});
