/**
 * style deepen：addGlowBorderOffset 空串防御。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addGlowBorderOffset } from '../style';

describe('style deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空字符串返回仅偏移', () => {
    expect(addGlowBorderOffset('')).toMatch(/px$/);
    expect(addGlowBorderOffset('   ')).toMatch(/px$/);
  });
});
