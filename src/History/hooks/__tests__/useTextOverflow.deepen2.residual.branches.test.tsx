/**
 * useTextOverflow deepen2：el 空早退。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTextOverflow } from '../useTextOverflow';

describe('useTextOverflow deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ref 空时安全', () => {
    const ref = { current: null };
    expect(() => renderHook(() => useTextOverflow(ref as any))).not.toThrow();
  });
});
