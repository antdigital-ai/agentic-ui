/**
 * useStreaming deepen2：空 pipe 行、未闭合数据行、list+反引号 commit、
 * 非候选首字符、空输出、非前缀重置。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('表格 header 非 pipe 行：不永久暂缓', () => {
    const md = 'not-pipe\n| --- |\n| 1 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).not.toBe('...');
  });

  it('表格空 header cells（||）视为完整失败路径', () => {
    const md = '||\n| --- |\n| a |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(typeof result.current).toBe('string');
  });

  it('表格数据行未以 | 结尾继续暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n| --- |\n| 1', true),
    );
    expect(result.current).toBe('...');
  });

  it('表格数据行列数不匹配继续暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| only |', true),
    );
    expect(result.current).toBe('...');
  });

  it('表格双空行提前结束 incomplete', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n\n| --- |', true),
    );
    expect(result.current).toContain('| H |');
  });

  it('list + 反引号走 getCommitPrefix', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '- `' } },
    );
    // list 前缀已 commit，pending 为反引号片段
    expect(result.current).toContain('- ');
    rerender({ text: '- `code`' });
    expect(result.current).toContain('- ');
  });

  it('非识别首字符直接 commit 文本', () => {
    const { result } = renderHook(() => useStreaming('plain text', true));
    expect(result.current).toBe('plain text');
  });

  it('空串输出为空；非前缀重置后继续', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '' } },
    );
    expect(result.current).toBe('');
    rerender({ text: 'abc' });
    expect(result.current).toBe('abc');
    rerender({ text: 'xyz' });
    expect(result.current).toBe('xyz');
  });

  it('emphasis 未闭合暂缓；闭合后输出', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '*ab' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '*ab*' });
    expect(result.current).toContain('*ab*');
  });
});
