import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useShallowMemo } from '../useShallowMemo';

describe('useShallowMemo residual branches', () => {
  it('retains a shallowly equal object reference', () => {
    const first = { value: 1 };
    const { result, rerender } = renderHook(
      ({ value }) => useShallowMemo(value),
      { initialProps: { value: first } },
    );
    rerender({ value: { value: 1 } });
    expect(result.current).toBe(first);
  });

  it('replaces missing and changed values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useShallowMemo(value),
      { initialProps: { value: undefined as { value: number } | undefined } },
    );
    const next = { value: 2 };
    rerender({ value: next });
    expect(result.current).toBe(next);
  });
});
