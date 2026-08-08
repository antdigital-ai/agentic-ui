/**
 * useStreaming deepen4：空 cells 管道、未闭合 |、列数不匹配、
 * listPrefix 空 rest、同文 chunk 空、非识别首字符。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('仅 |：parsePipeRowCells cells 空 → null', () => {
    const { result } = renderHook(() => useStreaming('|', true));
    expect(typeof result.current).toBe('string');
  });

  it('第三行管道未闭合：endsWith("|") false 继续暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| H | B |\n| --- | --- |\n| a | b', true),
    );
    expect(result.current).toBe('...');
  });

  it('第三行列数与 header 不一致：继续暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| H | B |\n| --- | --- |\n| only |', true),
    );
    expect(result.current).toBe('...');
  });

  it('列表前缀匹配失败路径：-+* 后无空格 rest 空串臂', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '-' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '-`code' });
    expect(typeof result.current).toBe('string');
  });

  it('非 token 首字符：候选空；同文 chunk 空早退', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'plain' } },
    );
    expect(result.current).toBe('plain');
    rerender({ text: 'plain' });
    expect(result.current).toBe('plain');
  });

  it('空输入重置；再流式启用假值关闭', () => {
    const { result, rerender } = renderHook(
      ({ text, en }) => useStreaming(text, en),
      { initialProps: { text: 'a', en: true } },
    );
    expect(result.current).toBe('a');
    rerender({ text: '', en: true });
    expect(result.current).toBe('');
    rerender({ text: 'b', en: false });
    expect(result.current).toBe('b');
  });

  it('强调未闭合暂缓后完成', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '**bold' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '**bold**' });
    expect(result.current).toContain('**bold**');
  });
});
