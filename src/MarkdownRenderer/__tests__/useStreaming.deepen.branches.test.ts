/**
 * useStreaming deepen：围栏可见输出、表格行数/分隔符、list 无 commit 前缀、非前缀重置。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming deepen branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('围栏内 pending 仍可见（inFenced）', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '```js\nconst' } },
    );
    expect(result.current).toContain('const');
    rerender({ text: '```js\nconst x = 1' });
    expect(result.current).toContain('const x');
  });

  it('围栏闭合退出后 commit 围栏外文本', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '```\ncode\n```\n' } },
    );
    rerender({ text: '```\ncode\n```\nAfter' });
    expect(result.current).toContain('After');
  });

  it('表格不足 3 行暂缓', () => {
    const { result } = renderHook(() =>
      useStreaming('| H |\n| - |', true),
    );
    expect(result.current).toBe('...');
  });

  it('表格第三行空字符串继续占位', () => {
    const { result } = renderHook(() =>
      useStreaming('| A | B |\n| --- | --- |\n', true),
    );
    expect(result.current).toBe('...');
  });

  it('表格分隔符无效时不永久暂缓', () => {
    const md = '| A | B |\n| bad | bad |\n| 1 | 2 |';
    const { result } = renderHook(() => useStreaming(md, true));
    expect(result.current).toContain('| A | B |');
    expect(result.current).not.toBe('...');
  });

  it('list 前缀无反引号时不 commit 前缀', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '- ab' } },
    );
    expect(result.current).toBe('- ab');
    rerender({ text: '- abc' });
    expect(result.current).toBe('- abc');
  });

  it('enabled 切换重置缓存', () => {
    const { result, rerender } = renderHook(
      ({ text, enabled }) => useStreaming(text, enabled),
      { initialProps: { text: '[open', enabled: true } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '[open](https://x.com)', enabled: false });
    expect(result.current).toBe('[open](https://x.com)');
  });

  it('input 非 string 清空', () => {
    const { result } = renderHook(() =>
      useStreaming(undefined as unknown as string, true),
    );
    expect(result.current).toBe('');
  });

  it('chunk 为空时不更新（同长度前缀）', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: 'stable' } },
    );
    const first = result.current;
    rerender({ text: 'stable' });
    expect(result.current).toBe(first);
  });

  it('image 半闭合 alt 暂缓', () => {
    const { result } = renderHook(() => useStreaming('![alt', true));
    expect(result.current).toBe('...');
  });

  it('html 自闭合标签完成后输出', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '<br' } },
    );
    expect(result.current).toBe('...');
    rerender({ text: '<br/>' });
    expect(result.current).toContain('<br');
  });
});
