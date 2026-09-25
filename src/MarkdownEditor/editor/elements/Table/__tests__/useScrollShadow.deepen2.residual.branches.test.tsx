/**
 * useScrollShadow deepen2：sensitivity 参数；无 el 早退。
 */
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useSmartScrollShadow from '../useScrollShadow';

describe('useScrollShadow deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('自定义 sensitivity 初始无 el', () => {
    const { result } = renderHook(() => useSmartScrollShadow(2));
    const [, state] = result.current;
    expect(state.vertical.isAtStart).toBe(true);
  });
});
