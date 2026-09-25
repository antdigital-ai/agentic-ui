import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useShallowMemo } from '../useShallowMemo';

describe('useShallowMemo', () => {
  it('键值浅相等时应保持同一引用', () => {
    const first = { a: 1, b: 'x' };
    const { result, rerender } = renderHook(
      ({ value }) => useShallowMemo(value),
      { initialProps: { value: first } },
    );

    expect(result.current).toBe(first);

    rerender({ value: { a: 1, b: 'x' } });
    expect(result.current).toBe(first);
  });

  it('值变化或键增减时应更新引用', () => {
    const first = { a: 1 };
    const { result, rerender } = renderHook(
      ({ value }) => useShallowMemo(value),
      { initialProps: { value: first } },
    );

    const nextValue = { a: 2 };
    rerender({ value: nextValue });
    expect(result.current).toBe(nextValue);

    const withExtraKey = { a: 2, b: true };
    rerender({ value: withExtraKey });
    expect(result.current).toBe(withExtraKey);
  });

  it('undefined 与对象不应视为相等', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: Record<string, unknown> | undefined }) =>
        useShallowMemo(value),
      {
        initialProps: {
          value: undefined as Record<string, unknown> | undefined,
        },
      },
    );

    expect(result.current).toBeUndefined();

    const obj = { ready: true };
    rerender({ value: obj });
    expect(result.current).toBe(obj);

    rerender({ value: undefined });
    expect(result.current).toBeUndefined();
  });
});
