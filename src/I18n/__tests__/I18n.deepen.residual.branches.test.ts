/**
 * I18n deepen：navigator language 混入非法项；保存语言。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectUserLanguage, saveUserLanguage } from '../index';

describe('I18n deepen residual branches', () => {
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

  it('跳过空/非字符串 language；fr 不匹配后走 test 默认 en-US', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['' as any, null as any, 123 as any, 'fr-FR'],
    });
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('zh / en 前缀识别', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['zh-TW'],
    });
    expect(detectUserLanguage()).toBe('zh-CN');
    localStorage.removeItem('md-editor-language');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['en-GB'],
    });
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('saveUserLanguage 写入 localStorage', () => {
    saveUserLanguage('zh-CN');
    expect(localStorage.getItem('md-editor-language')).toBe('zh-CN');
  });
});
