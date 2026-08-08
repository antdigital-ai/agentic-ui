import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  compileTemplate,
  detectUserLanguage,
  getLocaleByLanguage,
  I18nContext,
  I18nProvide,
  saveUserLanguage,
  useLocale,
  useMergedLocale,
} from '../index';
import { cnLabels, enLabels } from '../locales';

describe('I18n 分支覆盖', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('detectUserLanguage localStorage 优先', () => {
    localStorage.setItem('md-editor-language', 'en-US');
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('detectUserLanguage 浏览器 zh 前缀', () => {
    vi.stubGlobal('navigator', {
      languages: ['zh-CN', 'en'],
      language: 'zh-CN',
    });
    expect(detectUserLanguage()).toBe('zh-CN');
  });

  it('detectUserLanguage 浏览器 en 前缀', () => {
    localStorage.removeItem('md-editor-language');
    vi.stubGlobal('navigator', {
      languages: ['en-GB'],
      language: 'en-GB',
    });
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('getLocaleByLanguage 中英文', () => {
    expect(getLocaleByLanguage('zh-CN')).toBe(cnLabels);
    expect(getLocaleByLanguage('en-US')).toBe(enLabels);
  });

  it('saveUserLanguage 写入 localStorage', () => {
    saveUserLanguage('en-US');
    expect(localStorage.getItem('md-editor-language')).toBe('en-US');
  });

  it('compileTemplate 替换变量', () => {
    expect(compileTemplate('Hi ${name}!', { name: 'World' })).toBe('Hi World!');
  });

  it('compileTemplate 缺失变量显示占位', () => {
    expect(compileTemplate('Hi ${missing}!')).toBe('Hi [missing]!');
  });

  it('useLocale 读取 context', () => {
    const Probe = () => {
      const locale = useLocale();
      return <span>{locale['markdown.copy'] || 'copy-key'}</span>;
    };
    render(
      <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
        <Probe />
      </I18nContext.Provider>,
    );
    expect(screen.getByText(/copy/i)).toBeInTheDocument();
  });

  it('useMergedLocale 无 override 返回原 locale', () => {
    const Probe = () => {
      const locale = useMergedLocale();
      return <span data-testid="loc">{locale === cnLabels ? 'cn' : 'other'}</span>;
    };
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <Probe />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('loc')).toHaveTextContent('cn');
  });

  it('useMergedLocale override 合并', () => {
    const Probe = () => {
      const locale = useMergedLocale({ 'markdown.copy': 'COPY' } as any);
      return <span>{locale['markdown.copy']}</span>;
    };
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <Probe />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('COPY')).toBeInTheDocument();
  });

  it('I18nProvide autoDetect=false 使用 defaultLanguage', () => {
    render(
      <I18nProvide autoDetect={false} defaultLanguage="en-US">
        <I18nContext.Consumer>
          {(v) => <span data-testid="lang">{v?.language}</span>}
        </I18nContext.Consumer>
      </I18nProvide>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('en-US');
  });

  it('I18nProvide setLanguage 切换语言', () => {
    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return (
        <button type="button" onClick={() => ctx.setLanguage?.('en-US')}>
          {ctx.language}
        </button>
      );
    };
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <Probe />
      </I18nProvide>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('md-editor-language')).toBe('en-US');
  });

  it('I18nProvide props.locale 覆盖 computed locale', () => {
    render(
      <I18nProvide locale={enLabels} autoDetect={false}>
        <I18nContext.Consumer>
          {(v) => (
            <span data-testid="loc">
              {v?.locale === enLabels ? 'en' : 'other'}
            </span>
          )}
        </I18nContext.Consumer>
      </I18nProvide>,
    );
    expect(screen.getByTestId('loc')).toHaveTextContent('en');
  });

  it('I18nProvide 同步 antd locale zh', () => {
    render(
      <ConfigProvider locale={{ locale: 'zh-cn' } as any}>
        <I18nProvide autoDetect={true}>
          <I18nContext.Consumer>
            {(v) => <span data-testid="lang">{v?.language}</span>}
          </I18nContext.Consumer>
        </I18nProvide>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('zh-CN');
  });

  it('setLocale 兼容旧接口', () => {
    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return (
        <button type="button" onClick={() => ctx.setLocale?.(enLabels)}>
          switch
        </button>
      );
    };
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <Probe />
      </I18nProvide>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('md-editor-language')).toBe('en-US');
  });
});
