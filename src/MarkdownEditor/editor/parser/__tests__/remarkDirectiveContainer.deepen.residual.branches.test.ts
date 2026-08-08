/**
 * remarkDirectiveContainer deepen：options 缺省 {}。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { remarkDirectiveContainer } from '../remarkDirectiveContainer';

describe('remarkDirectiveContainer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无参调用返回 transformer', () => {
    const plugin = remarkDirectiveContainer();
    expect(typeof plugin).toBe('function');
  });
});
