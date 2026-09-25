/**
 * adaptiveTooltip 分支覆盖：订阅、快照、SSR 与触摸环境。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adaptiveTooltipEnvironment,
  EMPTY_TOOLTIP_TRIGGER_PROPS,
  getAdaptiveEnvironmentServerSnapshot,
  getAdaptiveEnvironmentSnapshot,
  getAdaptiveTooltipProps,
  getAdaptiveTooltipTriggerPropsServerSnapshot,
  getAdaptiveTooltipTriggerPropsSnapshot,
  INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
  subscribeAdaptiveTooltipEnvironment,
} from '../adaptiveTooltip';

describe('adaptiveTooltip branches', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('navigator 未定义时 isInformationalClickContext 为 false', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('navigator', undefined);
    expect(adaptiveTooltipEnvironment.isInformationalClickContext()).toBe(false);
  });

  it('桌面无触摸时 informational 不附加 click trigger', () => {
    vi.stubGlobal('window', { innerWidth: 1920 });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    expect(getAdaptiveTooltipProps('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('getAdaptiveTooltipTriggerPropsSnapshot interactive 返回空', () => {
    vi.stubGlobal('window', { innerWidth: 375, ontouchstart: null });
    vi.stubGlobal('navigator', { maxTouchPoints: 5, userAgent: 'iPhone' });
    expect(getAdaptiveTooltipTriggerPropsSnapshot('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('window 未定义时 snapshot 函数返回 SSR 默认值', () => {
    vi.stubGlobal('window', undefined);
    expect(getAdaptiveEnvironmentSnapshot()).toBe(false);
    expect(getAdaptiveTooltipTriggerPropsSnapshot('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('ontouchstart 存在且 maxTouchPoints 非数字时仍判触摸', () => {
    vi.stubGlobal('window', { innerWidth: 1200, ontouchstart: null });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      maxTouchPoints: 'x' as any,
    });
    expect(getAdaptiveTooltipProps('informational')).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipProps()).toEqual(
      INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipProps('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  it('server snapshot 恒为 false / 空 trigger', () => {
    expect(getAdaptiveEnvironmentServerSnapshot()).toBe(false);
    expect(getAdaptiveTooltipTriggerPropsServerSnapshot('informational')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
    expect(getAdaptiveTooltipTriggerPropsServerSnapshot('interactive')).toEqual(
      EMPTY_TOOLTIP_TRIGGER_PROPS,
    );
  });

  describe('subscribeAdaptiveTooltipEnvironment', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        innerWidth: 1920,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      vi.stubGlobal('navigator', { maxTouchPoints: 0, userAgent: 'desktop' });
    });

    it('window 未定义时 subscribe 返回空 cleanup', () => {
      vi.stubGlobal('window', undefined);
      const cleanup = subscribeAdaptiveTooltipEnvironment(vi.fn());
      expect(cleanup()).toBeUndefined();
    });

    it('首个订阅者挂载 resize/orientation 监听', () => {
      const listener = vi.fn();
      const remove = subscribeAdaptiveTooltipEnvironment(listener);
      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'orientationchange',
        expect.any(Function),
      );
      remove();
    });

    it('最后一个订阅者移除后 detach 监听', () => {
      const remove = subscribeAdaptiveTooltipEnvironment(vi.fn());
      remove();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'orientationchange',
        expect.any(Function),
      );
    });

    it('resize 环境未变时不重复广播', () => {
      const listener = vi.fn();
      subscribeAdaptiveTooltipEnvironment(listener);
      const resizeHandler = (window.addEventListener as ReturnType<typeof vi.fn>)
        .mock.calls.find(([event]) => event === 'resize')?.[1] as () => void;
      listener.mockClear();
      resizeHandler?.();
      listener.mockClear();
      resizeHandler?.();
      expect(listener).not.toHaveBeenCalled();
    });

    it('getAdaptiveEnvironmentSnapshot 读取当前环境', () => {
      vi.stubGlobal('window', { innerWidth: 375, ontouchstart: null });
      vi.stubGlobal('navigator', { maxTouchPoints: 5, userAgent: 'iPhone' });
      expect(getAdaptiveEnvironmentSnapshot()).toBe(true);
    });
  });
});
