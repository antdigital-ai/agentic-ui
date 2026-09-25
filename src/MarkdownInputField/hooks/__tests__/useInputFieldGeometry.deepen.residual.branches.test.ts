/**
 * useInputFieldGeometry deepen：窄屏初始 collapse；resize 回调。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInputFieldGeometry } from '../useInputFieldGeometry';

const base = {
  isEnlarged: false,
  hasEnlargeAction: false,
  hasRefineAction: false,
  totalActionCount: 1,
  isMultiRowLayout: false,
  maxHeight: 200,
  style: undefined,
  attachment: undefined,
};

describe('useInputFieldGeometry deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('窄视口初始 collapseSendActions', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(320);
    const { result } = renderHook(() => useInputFieldGeometry(base as any));
    expect(result.current.collapseSendActions).toBe(true);
  });

  it('onSendActionsResize / onQuickActionsResize 更新 computedRightPadding', () => {
    const { result } = renderHook(() => useInputFieldGeometry(base as any));
    act(() => {
      result.current.onSendActionsResize(40);
      result.current.onQuickActionsResize(10, 5);
    });
    expect(result.current.computedRightPadding).toBeGreaterThanOrEqual(40);
  });
});
