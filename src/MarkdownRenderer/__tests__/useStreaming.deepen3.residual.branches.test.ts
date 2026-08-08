/**
 * useStreaming deepen3：pipe 行边界、空 cells、同文 chunk 空、
 * 候选识别失败、围栏 visible。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('以 | 开头但未闭合：parsePipeRowCells null', () => {
    const { result } = renderHook(() =>
      useStreaming('| H\n| --- |\n| 1 |', true),
    );
    expect(typeof result.current).toBe('string');
  });

  it('空 cells 行 || 与 separator 不匹配提前完成', () => {
    const { result } = renderHook(() =>
      useStreaming('||\n| - |\n| x |', true),
    );
    expect(result.current).not.toBe('...');
  });

  it('第三行以 | 起但管道数不足继续暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n| a', true),
    );
    expect(result.current).toBe('...');
  });

  it('第三行非表格行：incomplete false 提交 header', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n| --- |\nplain', true),
    );
    expect(result.current).toContain('| H |');
  });

  it('同文本再处理：chunk 为空早退', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'hello' } },
    );
    expect(result.current).toBe('hello');
    rerender({ text: 'hello' });
    expect(result.current).toBe('hello');
  });

  it('图片 token 未闭合暂缓；闭合后输出', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '![alt' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '![alt](http://x)' });
    expect(result.current).toContain('![alt]');
  });

  it('html 未闭合暂缓', () => {
    const { result } = renderHook(() => useStreaming('<div', true));
    expect(result.current).toBe('...');
  });

  it('列表前缀无反引号：getCommitPrefix 不切分', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '- ' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '- done' });
    expect(result.current).toContain('- done');
  });

  it('围栏代码块 pending 仍可见', () => {
    const { result } = renderHook(() =>
      useStreaming('```js\nconst x = 1', true),
    );
    expect(result.current).toContain('```');
  });
});
