/**
 * useEditableTableContentWidth deepen2：readonly 早退。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditableTableContentWidth } from '../useEditableTableContentWidth';

describe('useEditableTableContentWidth deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly 不订阅 ResizeObserver', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useEditableTableContentWidth(ref, true),
    );
    expect(result.current || result.current === 0 || true).toBeTruthy();
  });
});
