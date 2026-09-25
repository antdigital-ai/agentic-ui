/**
 * useScrollShadow deepen：默认导出 hook，无 el 早退与绑定后检测。
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useSmartScrollShadow from '../useScrollShadow';

describe('useScrollShadow deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('初始无 el；绑定后触发 scroll 检测', () => {
    const { result } = renderHook(() => useSmartScrollShadow());
    const [ref, state] = result.current;
    expect(state.vertical.isAtStart).toBe(true);
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollHeight', { value: 200 });
    Object.defineProperty(el, 'clientHeight', { value: 100 });
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true });
    Object.defineProperty(el, 'scrollWidth', { value: 200 });
    Object.defineProperty(el, 'clientWidth', { value: 100 });
    Object.defineProperty(el, 'scrollLeft', { value: 0, writable: true });
    act(() => {
      (ref as any).current = el;
    });
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });
  });
});
