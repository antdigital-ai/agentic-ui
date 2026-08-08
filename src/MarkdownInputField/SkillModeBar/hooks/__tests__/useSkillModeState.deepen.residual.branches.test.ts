/**
 * useSkillModeState deepen：open 未变时跳过回调（if 的 else 臂）。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSkillModeState } from '../useSkillModeState';

describe('useSkillModeState deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('open 不变时不触发 onSkillModeOpenChange', () => {
    const onChange = vi.fn();
    const { rerender } = renderHook(
      ({ open }) =>
        useSkillModeState({ open } as any, onChange),
      { initialProps: { open: true } },
    );
    onChange.mockClear();
    rerender({ open: true });
    expect(onChange).not.toHaveBeenCalled();
  });
});
