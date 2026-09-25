/**
 * useSkillModeState Hook 测试
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSkillModeState } from '../../../SkillModeBar/hooks/useSkillModeState';

describe('useSkillModeState', () => {
  it('内部关闭时设置 skipNextCallback，下次 open 变化不重复触发外部回调', () => {
    const onSkillModeOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { open?: boolean }) =>
        useSkillModeState({ open: props.open }, onSkillModeOpenChange),
      { initialProps: { open: false } },
    );

    act(() => {
      result.current(true);
    });
    expect(onSkillModeOpenChange).toHaveBeenCalledWith(true);

    onSkillModeOpenChange.mockClear();
    rerender({ open: true });

    expect(onSkillModeOpenChange).not.toHaveBeenCalled();
  });

  it('无回调时内部变更不抛错', () => {
    const { result } = renderHook(() =>
      useSkillModeState({ open: false }),
    );
    expect(() => {
      act(() => {
        result.current(true);
      });
    }).not.toThrow();
  });

  it('外部 open 变化会通知回调', () => {
    const onSkillModeOpenChange = vi.fn();
    const { rerender } = renderHook(
      (props: { open?: boolean }) =>
        useSkillModeState({ open: props.open }, onSkillModeOpenChange),
      { initialProps: { open: false } },
    );
    onSkillModeOpenChange.mockClear();
    rerender({ open: true });
    expect(onSkillModeOpenChange).toHaveBeenCalledWith(true);
  });

  it('open 不变时不重复回调', () => {
    const onSkillModeOpenChange = vi.fn();
    const { rerender } = renderHook(
      (props: { open?: boolean }) =>
        useSkillModeState({ open: props.open }, onSkillModeOpenChange),
      { initialProps: { open: true } },
    );
    onSkillModeOpenChange.mockClear();
    rerender({ open: true });
    expect(onSkillModeOpenChange).not.toHaveBeenCalled();
  });

  it('skillMode 缺省时仍可调用内部 handler', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSkillModeState(undefined, onChange),
    );
    act(() => {
      result.current(false);
    });
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
