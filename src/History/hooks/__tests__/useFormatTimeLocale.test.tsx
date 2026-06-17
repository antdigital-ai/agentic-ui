import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nProvide, enLabels } from '../../../I18n';
import { useFormatTimeLocale } from '../useFormatTimeLocale';

describe('useFormatTimeLocale', () => {
  it('应从 I18nContext 组装 formatTime 所需文案', () => {
    const { result } = renderHook(() => useFormatTimeLocale(), {
      wrapper: ({ children }) => (
        <I18nProvide locale={enLabels} defaultLanguage="en-US" autoDetect={false}>
          {children}
        </I18nProvide>
      ),
    });

    expect(result.current).toEqual({
      today: enLabels['chat.history.time.today'],
      yesterday: enLabels['chat.history.time.yesterday'],
      withinWeek: enLabels['chat.history.time.withinWeek'],
    });
  });

  it('locale 不变时引用应保持稳定', () => {
    const { result, rerender } = renderHook(() => useFormatTimeLocale(), {
      wrapper: ({ children }) => (
        <I18nProvide defaultLanguage="zh-CN" autoDetect={false}>
          {children}
        </I18nProvide>
      ),
    });

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
