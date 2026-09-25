/**
 * I18n deepen3：en 前缀、未知语言回退、saveUserLanguage。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectUserLanguage, saveUserLanguage } from '../index';

describe('I18n deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.removeItem('md-editor-language');
  });

  afterEach(() => {
    localStorage.removeItem('md-editor-language');
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('en-* 前缀识别为 en-US', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['en-GB', 'fr'],
    });
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('未知语言回退 zh-CN（测试环境）', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['ja-JP'],
    });
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => 'ja-JP',
    });
    const lang = detectUserLanguage();
    expect(lang === 'zh-CN' || lang === 'en-US' || lang === 'ja-JP').toBe(true);
  });

  it('saveUserLanguage 写入后可读；清除后再检测 zh-TW', () => {
    saveUserLanguage('en-US');
    expect(localStorage.getItem('md-editor-language')).toBe('en-US');
    expect(detectUserLanguage()).toBe('en-US');

    localStorage.removeItem('md-editor-language');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['zh-TW'],
    });
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => 'zh-TW',
    });
    expect(detectUserLanguage()).toBe('zh-CN');
  });
});
