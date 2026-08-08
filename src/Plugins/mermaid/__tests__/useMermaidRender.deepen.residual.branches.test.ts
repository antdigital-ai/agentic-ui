/**
 * useMermaidRender deepen residual：缓存 api、timer 清理、stale 丢弃、无 divRef。
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMermaidRender } from '../useMermaidRender';

const loadMermaidMock = vi.fn(async () => ({
  render: vi.fn(async (_id: string, code: string) => ({
    svg: `<svg>${code}</svg>`,
  })),
}));

vi.mock('../utils', () => ({
  createMermaidThemeConfig: vi.fn(() => ({
    cacheKey: 'theme-default',
    theme: 'default',
  })),
  loadMermaid: (...args: unknown[]) => loadMermaidMock(...args),
  applyMermaidTheme: vi.fn(),
  renderSvgToContainer: vi.fn((svg: string, el: HTMLElement) => {
    el.innerHTML = svg;
  }),
  cleanupTempElement: vi.fn(),
}));

describe('useMermaidRender deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    loadMermaidMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('第二次渲染复用 mermaidRef，不再 loadMermaid', async () => {
    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm-cache', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(loadMermaidMock).toHaveBeenCalledTimes(1));

    rerender({ code: 'graph TD\nC-->D' });
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(loadMermaidMock).toHaveBeenCalledTimes(1));
  });

  it('unmount 清理 pending timer', async () => {
    const divRef = { current: document.createElement('div') };
    const { unmount } = renderHook(() =>
      useMermaidRender('graph TD\nA-->B', divRef, 'm-unmount', true),
    );
    unmount();
    await vi.advanceTimersByTimeAsync(200);
    expect(divRef.current.innerHTML).toBe('');
  });

  it('render 失败且 signature 已过期时不写 error', async () => {
    let rejectRender: (err: Error) => void = () => {};
    loadMermaidMock.mockResolvedValueOnce({
      render: vi.fn(
        () =>
          new Promise((_resolve, reject) => {
            rejectRender = reject;
          }),
      ),
    } as any);

    const divRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm-stale-err', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    await vi.advanceTimersByTimeAsync(100);
    rerender({ code: 'graph TD\nC-->D' });
    await vi.advanceTimersByTimeAsync(100);
    rejectRender(new Error('stale fail'));
    await Promise.resolve();
    expect(result.current.error).toBe('');
  });

  it('不可见且 signature 已渲染时跳过重跑', async () => {
    const divRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(
      ({ visible }) => useMermaidRender('graph TD\nA-->B', divRef, 'm-vis', visible),
      { initialProps: { visible: true } },
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() =>
      expect(result.current.renderedCode).toBe('graph TD\nA-->B'),
    );
    loadMermaidMock.mockClear();
    rerender({ visible: false });
    rerender({ visible: true });
    await vi.advanceTimersByTimeAsync(100);
    expect(loadMermaidMock).not.toHaveBeenCalled();
  });

  it('divRef 为 null 时 error 路径不抛', async () => {
    loadMermaidMock.mockResolvedValueOnce({
      render: vi.fn(async () => {
        throw new Error('no container');
      }),
    } as any);
    const divRef = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() =>
      useMermaidRender('bad', divRef, 'm-null-div', true),
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(result.current.error).toContain('no container'));
  });

  it('已有 timer 时再次 effect 先 clearTimeout', async () => {
    const divRef = { current: document.createElement('div') };
    const clearSpy = vi.spyOn(window, 'clearTimeout');
    const { rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm-timer', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    rerender({ code: 'graph TD\nX-->Y' });
    expect(clearSpy).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    clearSpy.mockRestore();
  });
});
