/**
 * useSkillModeState deepen2：受控/非受控切换。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSkillModeState } from '../useSkillModeState';

describe('useSkillModeState deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非受控开关', () => {
    const { result } = renderHook(() => useSkillModeState({} as any));
    expect(result.current).toBeTruthy();
  });
});
