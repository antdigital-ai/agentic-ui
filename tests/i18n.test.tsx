import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cnLabels,
  compileTemplate,
  detectUserLanguage,
  enLabels,
  getLocaleByLanguage,
  I18nContext,
  I18nProvide,
  saveUserLanguage,
  useMergedLocale,
} from '../src/I18n';

describe('I18n Provider', () => {
  afterEach(() => {
    cleanup();
  });

  it('should provide Chinese labels by default', () => {
    const TestComponent = () => {
      return <div data-testid="test">{cnLabels.table}</div>;
    };

    render(
      <I18nProvide>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('表格');
  });

  it('should respect ConfigProvider locale', () => {
    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <ConfigProvider locale={{ locale: 'en-US' }}>
        <I18nProvide>
          <TestComponent />
        </I18nProvide>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');
  });

  it('should use browser language preference when available', () => {
    const originalNavigator = window.navigator;
    const mockNavigator = {
      ...originalNavigator,
      language: 'en-US',
    };
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <I18nProvide>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');

    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should allow locale override through props', () => {
    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <I18nProvide locale={enLabels}>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');
  });
});

describe('Template Compilation', () => {
  it('should compile template with provided variables', () => {
    const template = '${name} is ${status}';
    const variables = {
      name: 'Task',
      status: 'running',
    };
    const result = compileTemplate(template, variables);
    expect(result).toBe('Task is running');
  });

  it('should handle missing variables', () => {
    const template = '${name} is ${status}';
    const variables = {
      name: 'Task',
    };
    const result = compileTemplate(template, variables);
    expect(result).toBe('Task is [status]');
  });

  it('should handle template without variables', () => {
    const template = 'Simple text';
    const result = compileTemplate(template);
    expect(result).toBe('Simple text');
  });

  it('should handle empty template', () => {
    const result = compileTemplate('');
    expect(result).toBe('');
  });
});

describe('detectUserLanguage', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(() => {
    vi.restoreAllMocks();
    if (window.document.querySelector('[data-antd-locale]')) {
      window.document.querySelector('[data-antd-locale]')?.remove();
    }
  });

  it('应从 data-antd-locale 读取 zh 返回 zh-CN (40-41)', () => {
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    const el = document.createElement('div');
    el.setAttribute('data-antd-locale', 'zh-CN');
    document.body.appendChild(el);
    expect(detectUserLanguage()).toBe('zh-CN');
    el.remove();
  });

  it('应从 data-antd-locale 读取 en 返回 en-US (43-44)', () => {
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    const el = document.createElement('div');
    el.setAttribute('data-antd-locale', 'en-US');
    document.body.appendChild(el);
    expect(detectUserLanguage()).toBe('en-US');
    el.remove();
  });

  it('应从 navigator 语言 zh 返回 zh-CN (60-61)', () => {
    const originalNavigator = window.navigator;
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    Object.defineProperty(window, 'navigator', {
      value: { languages: ['zh-CN', 'zh', 'en-US'], language: 'zh-CN' },
      writable: true,
    });
    expect(detectUserLanguage()).toBe('zh-CN');
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('应从 navigator 语言 en 返回 en-US (67-68)', () => {
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    const origQuery = document.querySelector.bind(document);
    const querySelector = vi
      .spyOn(document, 'querySelector')
      .mockImplementation((sel: string) => {
        if (sel === '[data-antd-locale]') return null;
        return origQuery(sel);
      });
    const mockNav = { languages: ['en-US', 'en'], language: 'en-US' };
    vi.stubGlobal('navigator', mockNav);
    expect(detectUserLanguage()).toBe('en-US');
    querySelector.mockRestore();
    vi.unstubAllGlobals();
  });

  it('测试环境且前序未命中时应返回 en-US', () => {
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    const origQuery = document.querySelector.bind(document);
    const querySpy = vi
      .spyOn(document, 'querySelector')
      .mockImplementation((sel: string) => {
        if (sel === '[data-antd-locale]') return null;
        return origQuery(sel);
      });
    vi.stubGlobal('navigator', { languages: ['fr-FR'], language: 'fr' });
    expect(detectUserLanguage()).toBe('en-US');
    querySpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('非测试环境且前序未命中时应返回 zh-CN', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    vi.spyOn(originalLocalStorage, 'getItem').mockReturnValue(null);
    const origQuery = document.querySelector.bind(document);
    vi.spyOn(document, 'querySelector').mockImplementation((sel: string) => {
      if (sel === '[data-antd-locale]') return null;
      return origQuery(sel);
    });
    vi.stubGlobal('navigator', { languages: ['fr-FR'], language: 'fr' });
    expect(detectUserLanguage()).toBe('zh-CN');
    process.env.NODE_ENV = origEnv;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});

describe('getLocaleByLanguage', () => {
  it('zh-CN 应返回 cnLabels', () => {
    expect(getLocaleByLanguage('zh-CN')).toBe(cnLabels);
  });
  it('en-US 应返回 enLabels', () => {
    expect(getLocaleByLanguage('en-US')).toBe(enLabels);
  });
});

describe('saveUserLanguage', () => {
  it('应在 window 存在时写入 localStorage', () => {
    saveUserLanguage('en-US');
    expect(window.localStorage.getItem('md-editor-language')).toBe('en-US');
    saveUserLanguage('zh-CN');
    expect(window.localStorage.getItem('md-editor-language')).toBe('zh-CN');
  });
});

describe('useMergedLocale', () => {
  it('有 override 时应合并返回 (120-122)', () => {
    const TestComponent = () => {
      const merged = useMergedLocale({ table: 'OverriddenTable' });
      return <div data-testid="merged">{merged.table}</div>;
    };
    render(
      <I18nProvide>
        <TestComponent />
      </I18nProvide>,
    );
    expect(screen.getByTestId('merged')).toHaveTextContent('OverriddenTable');
  });
});

describe('I18nProvide setLocale', () => {
  it('setLocale(cnLabels) 应切换为 zh-CN (213)', () => {
    const TestComponent = () => {
      const { setLocale, language } = React.useContext(I18nContext);
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <button
            type="button"
            data-testid="set-cn"
            onClick={() => setLocale?.(cnLabels)}
          >
            Set CN
          </button>
        </div>
      );
    };
    render(
      <I18nProvide defaultLanguage="en-US" autoDetect={false}>
        <TestComponent />
      </I18nProvide>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('en-US');
    fireEvent.click(screen.getByTestId('set-cn'));
    expect(screen.getByTestId('lang')).toHaveTextContent('zh-CN');
  });

  it('setLocale(enLabels) 应切换为 en-US (214)', () => {
    const TestComponent = () => {
      const { setLocale, language } = React.useContext(I18nContext);
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <button
            type="button"
            data-testid="set-en"
            onClick={() => setLocale?.(enLabels)}
          >
            Set EN
          </button>
        </div>
      );
    };
    render(
      <I18nProvide defaultLanguage="zh-CN" autoDetect={false}>
        <TestComponent />
      </I18nProvide>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('zh-CN');
    fireEvent.click(screen.getByTestId('set-en'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en-US');
  });
});

describe('Labels Consistency', () => {
  it('should have matching keys in Chinese and English labels', () => {
    const cnKeys = Object.keys(cnLabels).sort();
    const enKeys = Object.keys(enLabels).sort();
    expect(cnKeys).toEqual(enKeys);
  });

  it('should not have empty translations except for "other"', () => {
    Object.entries(cnLabels).forEach(([key, value]) => {
      if (key !== 'other') {
        expect(value).not.toBe('');
      }
    });

    Object.entries(enLabels).forEach(([key, value]) => {
      if (key !== 'other') {
        expect(value).not.toBe('');
      }
    });
  });
});
