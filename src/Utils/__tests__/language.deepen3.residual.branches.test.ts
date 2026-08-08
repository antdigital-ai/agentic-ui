/**
 * language deepen3：fr 不识别返回 null；normalize/isValid。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectBrowserLanguage,
  isValidLanguage,
  normalizeLanguage,
} from '../language';

describe('language deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('不支持语言返回 null；normalize 边角', () => {
    vi.stubGlobal('navigator', {
      languages: ['fr-FR'],
      language: 'fr-FR',
    });
    expect(detectBrowserLanguage()).toBeNull();
    expect(isValidLanguage('nope')).toBe(false);
    expect(normalizeLanguage('zh')).toBeTruthy();
  });
});
