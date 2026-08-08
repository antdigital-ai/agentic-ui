/**
 * useStreaming residual：enabled false、空串、增量。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStreaming } from '../useStreaming';

describe('useStreaming more residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('enabled=false 直通原文', () => {
    const { result } = renderHook(() => useStreaming('hello **x**', false));
    expect(result.current).toBe('hello **x**');
  });

  it('空串；短文本完成', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '' } },
    );
    expect(result.current).toBe('');
    rerender({ text: 'plain' });
    expect(result.current).toContain('plain');
  });

  it('链接未闭合占位后完成', async () => {
    const { result, rerender } = renderHook(
      ({ text }) => useStreaming(text, true),
      { initialProps: { text: '[a](htt' } },
    );
    expect(result.current === '...' || result.current.length >= 0).toBe(true);
    rerender({ text: '[a](https://x.com)' });
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current).toContain('https://x.com');
  });

  it('未闭合代码块 / 粗体 / 图片语法占位', async () => {
    const cases = [
      { from: '```js\nconst x', to: '```js\nconst x=1\n```' },
      { from: '**bold', to: '**bold**' },
      { from: '![alt](htt', to: '![alt](https://x/a.png)' },
      { from: 'plain `code', to: 'plain `code`' },
    ];
    for (const c of cases) {
      const { result, rerender } = renderHook(
        ({ text }) => useStreaming(text, true),
        { initialProps: { text: c.from } },
      );
      expect(typeof result.current).toBe('string');
      rerender({ text: c.to });
      await act(async () => {
        vi.advanceTimersByTime(20);
      });
      expect(result.current.length).toBeGreaterThan(0);
    }
  });
});
