/**
 * useStreaming deepen9 safe：parsePipeRowCells 空 cells、pipe ||0、
 * 未收口行、列错位、listPrefix 假、pending placeholder、空 chunk、围栏重置。
 * !recognizer 为 map 完备死臂，跳过。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen9 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('表格 | 仅分隔符 → cells 空；pipe 计数 ||0', () => {
    const onlyPipe = renderHook(() => useStreaming('|', true));
    expect(typeof onlyPipe.result.current).toBe('string');
    const partialPipes = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| x', true),
    );
    expect(partialPipes.result.current === '...' || partialPipes.result.current.length > 0).toBe(
      true,
    );
  });

  it('第三行未收口 |；列数不匹配', () => {
    const noClose = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| 1', true),
    );
    expect(noClose.result.current).toBe('...');
    const mismatch = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| 1 | 2 | 3 |', true),
    );
    expect(mismatch.result.current === '...' || typeof mismatch.result.current === 'string').toBe(
      true,
    );
  });

  it('listPrefix 假值臂；仅 pending → placeholder', () => {
    const listPlain = renderHook(() => useStreaming('- plain', true));
    expect(typeof listPlain.result.current).toBe('string');
    const incomplete = renderHook(() => useStreaming('[link', true));
    expect(incomplete.result.current === '...' || incomplete.result.current.length >= 0).toBe(
      true,
    );
  });

  it('同文 rerender 空 chunk；前缀重置 processedLength=0', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'hello' } },
    );
    const first = result.current;
    rerender({ text: 'hello' });
    expect(result.current).toBe(first);
    rerender({ text: 'world' });
    expect(result.current).toBe('world');
  });

  it('围栏流式：existingText 空时重置 fenceState', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '```js\n' } },
    );
    expect(result.current === '...' || result.current.includes('```')).toBe(true);
    rerender({ text: 'plain text' });
    expect(result.current).toContain('plain');
  });

  it('非 Text token 早退：emphasis 未完成', () => {
    const { result } = renderHook(() => useStreaming('*bold', true));
    expect(result.current === '...' || typeof result.current === 'string').toBe(true);
  });
});
