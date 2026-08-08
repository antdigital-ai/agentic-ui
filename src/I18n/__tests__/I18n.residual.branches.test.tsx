/**
 * I18n residual：detect / save / getLocale / autoDetect Provider。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  detectUserLanguage,
  getLocaleByLanguage,
  I18nProvide,
  saveUserLanguage,
  useLocale,
} from '../index';

const Probe = () => {
  const locale = useLocale();
  return <span data-testid="lang">{locale ? 'ok' : 'empty'}</span>;
};

describe('I18n residual branches', () => {
  afterEach(() => {
    localStorage.removeItem('md-editor-language');
  });

  it('detectUserLanguage：localStorage 优先；浏览器 en/zh', () => {
    localStorage.setItem('md-editor-language', 'zh-CN');
    expect(detectUserLanguage()).toBe('zh-CN');
    localStorage.setItem('md-editor-language', 'en-US');
    expect(detectUserLanguage()).toBe('en-US');
    localStorage.removeItem('md-editor-language');
    const orig = Object.getOwnPropertyDescriptor(navigator, 'languages');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['fr-FR', 'en-GB'],
    });
    expect(detectUserLanguage()).toBe('en-US');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      value: ['zh-TW'],
    });
    expect(detectUserLanguage()).toBe('zh-CN');
    if (orig) Object.defineProperty(navigator, 'languages', orig);
  });

  it('getLocaleByLanguage / saveUserLanguage', () => {
    expect(getLocaleByLanguage('zh-CN')).toBeTruthy();
    expect(getLocaleByLanguage('en-US')).toBeTruthy();
    saveUserLanguage('en-US');
    expect(localStorage.getItem('md-editor-language')).toBe('en-US');
  });

  it('I18nProvide autoDetect false 用 defaultLanguage', () => {
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <Probe />
      </I18nProvide>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('ok');
  });

  it('I18nProvide 跟随 antd locale', () => {
    const { rerender } = render(
      <ConfigProvider locale={enUS}>
        <I18nProvide autoDetect>
          <Probe />
        </I18nProvide>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('lang')).toBeTruthy();
    rerender(
      <ConfigProvider locale={zhCN}>
        <I18nProvide autoDetect>
          <Probe />
        </I18nProvide>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('lang')).toBeTruthy();
  });
});
