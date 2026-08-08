/**
 * language deepen2：navigator 缺失 → detectBrowserLanguage null。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectBrowserLanguage } from '../language';

describe('language deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('无 navigator：返回 null', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectBrowserLanguage()).toBeNull();
  });
});
