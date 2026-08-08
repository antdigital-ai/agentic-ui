/**
 * normalizeTaskContent deepen4：boolean fallback 走 isContentEmpty number/boolean 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasNormalizedTaskContent,
  normalizeTaskContent,
} from '../normalizeTaskContent';

describe('normalizeTaskContent deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空正文 + boolean fallback', () => {
    expect(hasNormalizedTaskContent('', true)).toBe(true);
    expect(hasNormalizedTaskContent('', false)).toBe(true);
    expect(normalizeTaskContent(null, true)).toBe(true);
    expect(normalizeTaskContent(undefined, false)).toBe(false);
  });
});
