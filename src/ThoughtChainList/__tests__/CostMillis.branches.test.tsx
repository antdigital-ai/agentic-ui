/**
 * CostMillis / msToTimes 分支覆盖：null/0/ms/s/m/H/D 与组件空值。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { CostMillis, msToTimes } from '../CostMillis';

vi.mock('../../Hooks/useAdaptiveTooltipProps', () => ({
  useAdaptiveTooltipProps: () => ({}),
}));

const locale = {
  seconds: 's',
  minutes: 'm',
  hours: 'H',
  days: 'D',
} as any;

describe('msToTimes 分支覆盖', () => {
  it('undefined / null 返回空串', () => {
    expect(msToTimes(undefined, locale)).toBe('');
    expect(msToTimes(null, locale)).toBe('');
  });

  it('0 返回 0ms', () => {
    expect(msToTimes(0, locale)).toBe('0ms');
  });

  it('小于 1000ms 显示 ms', () => {
    expect(msToTimes(250, locale)).toBe('250ms');
  });

  it('小于 60s 显示小数秒', () => {
    expect(msToTimes(1500, locale)).toBe('1.5s');
  });

  it('小于 60 分钟显示分秒', () => {
    expect(msToTimes(65000, locale)).toBe('1m 5s');
  });

  it('小于 24 小时显示时分秒', () => {
    expect(msToTimes(3665000, locale)).toBe('1H 1m 5s');
  });

  it('大于等于 24 小时显示天时分秒', () => {
    expect(msToTimes(90061000, locale)).toBe('1D 1H 1m 1s');
  });

  it('locale 单位缺失时使用默认英文缩写', () => {
    expect(msToTimes(1500, {} as any)).toBe('1.5s');
    expect(msToTimes(65000, {} as any)).toBe('1m 5s');
  });
});

describe('CostMillis 组件分支', () => {
  it('costMillis 缺失时返回 null', () => {
    const { container } = render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <CostMillis />
      </I18nContext.Provider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('costMillis 为 null 时返回 null', () => {
    const { container } = render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <CostMillis costMillis={null as any} />
      </I18nContext.Provider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('有 costMillis 时渲染格式化文案', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <CostMillis costMillis={1500} />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('1.5s')).toBeInTheDocument();
  });
});
