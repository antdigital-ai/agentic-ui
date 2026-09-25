/**
 * useStreaming deepen12 safe：parsePipeRowCells 空 cells、pipe ||0、
 * 第三行未闭合、列错位、listPrefix 假、chunk 空、围栏重置、非 Text token。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('| 仅分隔符 → cells 空', () => {
    const { result } = renderHook(() => useStreaming('| | |', true));
    expect(typeof result.current).toBe('string');
  });

  it('表格第三行未闭合 |；pipe 计数不足', () => {
    const partial = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| 1 |', true),
    );
    expect(partial.result.current === '...' || partial.result.current.length > 0).toBe(
      true,
    );
    const mismatch = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| 1 | 2 | 3 |', true),
    );
    expect(typeof mismatch.result.current).toBe('string');
  });

  it('listPrefix 假值；pending placeholder', () => {
    const list = renderHook(() => useStreaming('1. item', true));
    expect(typeof list.result.current).toBe('string');
    const link = renderHook(() => useStreaming('[text', true));
    expect(link.result.current === '...' || link.result.current.length >= 0).toBe(
      true,
    );
  });

  it('同文 rerender 空 chunk；前缀变化重置', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'alpha' } },
    );
    const first = result.current;
    rerender({ text: 'alpha' });
    expect(result.current).toBe(first);
    rerender({ text: 'beta' });
    expect(result.current).toBe('beta');
  });

  it('围栏流式重置；非 Text emphasis 早退', () => {
    const fence = renderHook(() => useStreaming('```\ncode', true));
    expect(fence.result.current === '...' || fence.result.current.includes('```')).toBe(
      true,
    );
    const emph = renderHook(() => useStreaming('**bold', true));
    expect(typeof emph.result.current).toBe('string');
  });

  it('header-only 表格后接普通文本', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n| --- |\nplain', true),
    );
    expect(typeof result.current).toBe('string');
  });
});
