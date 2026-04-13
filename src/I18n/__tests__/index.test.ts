import { describe, expect, it, vi, beforeEach } from 'vitest';
import { detectUserLanguage } from '../index';

describe('detectUserLanguage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns saved language from localStorage zh-CN', () => {
    localStorage.setItem('md-editor-language', 'zh-CN');
    expect(detectUserLanguage()).toBe('zh-CN');
  });

  it('returns saved language from localStorage en-US', () => {
    localStorage.setItem('md-editor-language', 'en-US');
    expect(detectUserLanguage()).toBe('en-US');
  });

  it('falls back to browser language detection', () => {
    const result = detectUserLanguage();
    expect(['zh-CN', 'en-US']).toContain(result);
  });

  it('detects from antd locale data attribute', () => {
    const el = document.createElement('div');
    el.setAttribute('data-antd-locale', 'en_US');
    document.body.appendChild(el);
    const result = detectUserLanguage();
    document.body.removeChild(el);
    expect(['zh-CN', 'en-US']).toContain(result);
  });
});
