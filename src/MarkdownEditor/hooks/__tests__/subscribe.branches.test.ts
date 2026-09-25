/**
 * useSubject：subject falsy 早退。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSubject } from '../subscribe';

describe('useSubject branches', () => {
  it('subject 为 falsy 时不订阅', () => {
    const fn = vi.fn();
    expect(() =>
      renderHook(() => useSubject(null as any, fn, [])),
    ).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
  });
});
