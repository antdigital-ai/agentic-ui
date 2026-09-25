import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EMPTY_TOOLTIP_TRIGGER_PROPS,
  INFORMATIONAL_TOOLTIP_TRIGGER_PROPS,
} from '../../Utils/adaptiveTooltip';
import { useAdaptiveTooltipProps } from '../useAdaptiveTooltipProps';

describe('useAdaptiveTooltipProps', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('桌面 informational 返回空 trigger', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1920,
    });

    const { result } = renderHook(() =>
      useAdaptiveTooltipProps('informational'),
    );
    expect(result.current).toEqual(EMPTY_TOOLTIP_TRIGGER_PROPS);
  });

  it('移动 informational 返回 hover+click trigger', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() =>
      useAdaptiveTooltipProps('informational'),
    );
    expect(result.current).toEqual(INFORMATIONAL_TOOLTIP_TRIGGER_PROPS);
  });

  it('interactive 种类始终返回空 trigger', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useAdaptiveTooltipProps('interactive'));
    expect(result.current).toEqual(EMPTY_TOOLTIP_TRIGGER_PROPS);
  });
});
