import { describe, expect, it } from 'vitest';
import {
  compileTemplate,
  detectUserLanguage,
  getLocaleByLanguage,
} from '../index';
import { cnLabels, enLabels } from '../locales';

describe('I18n 额外分支', () => {
  it('detectUserLanguage 无匹配语言：测试环境回退 en-US', () => {
    localStorage.removeItem('md-editor-language');
    const original = navigator.languages;
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['fr-FR', 'de-DE'],
    });
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => 'fr-FR',
    });
    expect(detectUserLanguage()).toBe('en-US');
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => original,
    });
  });

  it('detectUserLanguage 无效 localStorage 忽略', () => {
    localStorage.setItem('md-editor-language', 'ja-JP');
    expect(['zh-CN', 'en-US']).toContain(detectUserLanguage());
    localStorage.removeItem('md-editor-language');
  });

  it('compileTemplate 空变量表', () => {
    expect(compileTemplate('static')).toBe('static');
    expect(compileTemplate('a ${x} b', {})).toBe('a [x] b');
  });

  it('getLocaleByLanguage 中英文', () => {
    expect(getLocaleByLanguage('zh-CN')).toBe(cnLabels);
    expect(getLocaleByLanguage('en-US')).toBe(enLabels);
  });
});
