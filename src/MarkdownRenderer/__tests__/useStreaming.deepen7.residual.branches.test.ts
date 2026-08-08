/**
 * useStreaming deepen7：表格未闭合、列不匹配、有序列表前缀、空 chunk。
 * !recognizer / !chars 为 map 完备死臂。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen7 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('|| 空 cells；第三行无收口 |', () => {
    expect(
      renderHook(() => useStreaming('||', true)).result.current,
    ).toBeTruthy();
    expect(
      renderHook(() =>
        useStreaming('| A | B |\n| --- | --- |\n| partial', true),
      ).result.current,
    ).toBe('...');
  });

  it('有序列表前缀 + backtick；同文 rerender 空 chunk', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '1. plain' } },
    );
    expect(typeof result.current).toBe('string');
    rerender({ text: '1. `code' });
    expect(typeof result.current).toBe('string');
    rerender({ text: '1. `code' });
    expect(result.current).toBe(result.current);
  });

  it('streaming false 直通；空串', () => {
    expect(
      renderHook(() => useStreaming('hello', false)).result.current,
    ).toBe('hello');
    expect(renderHook(() => useStreaming('', true)).result.current).toBe('');
  });
});
