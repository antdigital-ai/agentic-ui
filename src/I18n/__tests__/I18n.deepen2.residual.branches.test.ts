/**
 * I18n deepen2：localStorage 已有语言；navigator.language 单值；非法 JSON 忽略。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectUserLanguage, saveUserLanguage } from '../index';

describe('I18n deepen2 residual branches', () => {
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

  it('localStorage 已存 zh-CN 直接返回', () => {
    saveUserLanguage('zh-CN');
    expect(detectUserLanguage()).toBe('zh-CN');
  });

  it('languages 缺失时回退 navigator.language', () => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => undefined,
    });
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => 'zh-CN',
    });
    expect(detectUserLanguage()).toBe('zh-CN');
  });

  it('非法 localStorage 值忽略并重检', () => {
    localStorage.setItem('md-editor-language', 'xx-YY');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['en-US'],
    });
    expect(detectUserLanguage()).toBe('en-US');
  });
});
