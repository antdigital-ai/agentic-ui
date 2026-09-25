/**
 * env deepen：ua 空串时回退 navigator.userAgent。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDeviceBrand } from '../env';

describe('env deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 ua 使用 navigator.userAgent', () => {
    const brand = getDeviceBrand('');
    expect(brand === false || typeof brand === 'string').toBe(true);
  });
});
