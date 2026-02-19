/**
 * useSkillModeState Hook 测试
 */
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSkillModeState } from '../../../../src/MarkdownInputField/SkillModeBar/hooks/useSkillModeState';

describe('useSkillModeState', () => {
  it('内部关闭时设置 skipNextCallback，下次 open 变化不重复触发外部回调', () => {
    const onSkillModeOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { open?: boolean }) =>
        useSkillModeState(
          { open: props.open },
          onSkillModeOpenChange,
        ),
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
});
