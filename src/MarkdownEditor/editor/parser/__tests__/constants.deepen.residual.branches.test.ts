/**
 * constants deepen：行内反引号更长闭合串 continue。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { preprocessProtectTimeFromDirective } from '../constants';

describe('constants deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('双反引号开、三反引号伪闭合时继续扫描', () => {
    const md = 'before ``inner``` after:20';
    const out = preprocessProtectTimeFromDirective(md);
    expect(out).toContain('\\:20');
    expect(out).toContain('``inner```');
  });

  it('三反引号开遇双反引号时 k!==openCount 继续', () => {
    const md = 'x ```a`` b:1';
    const out = preprocessProtectTimeFromDirective(md);
    expect(out).toBe(md);
  });
});
