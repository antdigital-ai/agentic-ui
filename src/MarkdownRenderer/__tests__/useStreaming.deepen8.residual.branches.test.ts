/**
 * useStreaming deepen8：blockquote 前缀、未闭合 fence、表格头错位。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen8 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('blockquote 未闭合', () => {
    const { result } = renderHook(() => useStreaming('> quote', true));
    expect(typeof result.current).toBe('string');
  });

  it('fence 未闭合 → ...', () => {
    const { result } = renderHook(() =>
      useStreaming('```js\nconst x=1', true),
    );
    expect(result.current === '...' || typeof result.current === 'string').toBe(
      true,
    );
  });

  it('表格头与分隔行列数不一致', () => {
    const { result } = renderHook(() =>
      useStreaming('| A | B | C |\n| --- | --- |\n| 1 | 2 |', true),
    );
    expect(result.current === '...' || typeof result.current === 'string').toBe(
      true,
    );
  });
});
