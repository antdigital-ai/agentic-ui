import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectBrowserLanguage } from '../language';

describe('language 分支覆盖', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigator undefined 时 detectBrowserLanguage 返回 null', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectBrowserLanguage()).toBeNull();
  });
});

describe('language istanbul residual：navigator.language 真值', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('读取 navigator.language', () => {
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US'] });
    expect(detectBrowserLanguage()).toBeTruthy();
  });
});
