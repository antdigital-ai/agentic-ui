import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAdaptiveTooltipProps,
  shouldUseInformationalTooltipClickTrigger,
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
});
