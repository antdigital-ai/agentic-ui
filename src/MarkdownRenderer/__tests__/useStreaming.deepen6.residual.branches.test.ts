/**
 * useStreaming deepen6：空 cells、无 | 匹配 length||0、listPrefix 无 backtick、
 * 非识别首字符、同文 chunk 空、列表前缀 rest 非 code。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('管道空 cells；未闭合；列不匹配', () => {
    expect(
      renderHook(() => useStreaming('|', true)).result.current,
    ).toBeTruthy();
    expect(
      renderHook(() =>
        useStreaming('| A | B |\n| --- | --- |\n| only', true),
      ).result.current,
    ).toBe('...');
    expect(
      renderHook(() =>
        useStreaming('| A | B |\n| --- | --- |\n| x |', true),
      ).result.current,
    ).toBe('...');
  });

  it('listPrefix：无 backtick → null 臂；有 backtick', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '- plain text' } },
    );
    expect(typeof result.current).toBe('string');
    rerender({ text: '- `code' });
    expect(typeof result.current).toBe('string');
    rerender({ text: '* item' });
    expect(typeof result.current).toBe('string');
  });

  it('非 token 首字符 continue；同文空 chunk；空串', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'hello' } },
    );
    expect(result.current).toBe('hello');
    rerender({ text: 'hello' });
    expect(result.current).toBe('hello');
    rerender({ text: '' });
    expect(result.current).toBe('');
    rerender({ text: 'zzz' });
    expect(result.current).toBe('zzz');
  });

  it('表格第三行无管道字符：match||0', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n| --- |\nnopipe', true),
    );
    expect(typeof result.current).toBe('string');
  });
});
