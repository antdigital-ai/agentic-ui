/**
 * useElementSize deepen2：raf 去重路径。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useElementSize } from '../useElementSize';

describe('useElementSize deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('挂载测量', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 10, height: 10, top: 0, left: 0 }),
    });
    const ref = { current: el };
    expect(() => renderHook(() => useElementSize(ref as any))).not.toThrow();
  });
});
