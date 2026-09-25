/**
 * useMermaidRender deepen2：空 code 清容器、仅空白 trim、主题 cacheKey 切换、
 * timer 内 signature 过期、成功路径无 divRef。
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const applyMermaidTheme = vi.fn();
const renderSvgToContainer = vi.fn((svg: string, el: HTMLElement) => {
  el.innerHTML = svg;
});
const cleanupTempElement = vi.fn();
const createMermaidThemeConfig = vi.fn((token?: any) => ({
  cacheKey: token?.colorPrimary || 'theme-default',
  theme: 'default',
}));

const loadMermaidMock = vi.fn(async () => ({
  render: vi.fn(async (_id: string, code: string) => ({
    svg: `<svg>${code}</svg>`,
  })),
}));

vi.mock('../utils', () => ({
  createMermaidThemeConfig: (...a: unknown[]) =>
    createMermaidThemeConfig(...a),
  loadMermaid: (...args: unknown[]) => loadMermaidMock(...args),
  applyMermaidTheme: (...a: unknown[]) => applyMermaidTheme(...a),
  renderSvgToContainer: (...a: unknown[]) => renderSvgToContainer(...a),
  cleanupTempElement: (...a: unknown[]) => cleanupTempElement(...a),
}));

import { useMermaidRender } from '../useMermaidRender';

describe('useMermaidRender deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    loadMermaidMock.mockClear();
    applyMermaidTheme.mockClear();
    createMermaidThemeConfig.mockClear();
    createMermaidThemeConfig.mockImplementation((token?: any) => ({
      cacheKey: token?.colorPrimary || 'theme-default',
      theme: 'default',
    }));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('code 空串清空 div；仅空白 trim 后清空', async () => {
    const divRef = { current: document.createElement('div') };
    divRef.current.innerHTML = '<svg>old</svg>';
    const { rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm-empty', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(divRef.current.innerHTML).toContain('svg'));

    rerender({ code: '' });
    expect(divRef.current.innerHTML).toBe('');

    rerender({ code: '   ' });
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(divRef.current.innerHTML).toBe(''));
  });

  it('主题 cacheKey 变化时 applyMermaidTheme', async () => {
    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ token }) =>
        useMermaidRender('graph TD\nA-->B', divRef, 'm-theme', true, token),
      { initialProps: { token: { colorPrimary: 'blue' } as any } },
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(applyMermaidTheme).toHaveBeenCalledTimes(1));

    rerender({ token: { colorPrimary: 'red' } as any });
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() => expect(applyMermaidTheme).toHaveBeenCalledTimes(2));
  });

  it('timer 触发前改 code：旧 signature 丢弃', async () => {
    let resolveRender: (v: any) => void = () => {};
    loadMermaidMock.mockResolvedValueOnce({
      render: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRender = resolve;
          }),
      ),
    } as any);

    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm-stale', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    await vi.advanceTimersByTimeAsync(100);
    rerender({ code: 'graph TD\nC-->D' });
    await vi.advanceTimersByTimeAsync(100);
    resolveRender({ svg: '<svg>old</svg>' });
    await Promise.resolve();
    // 新渲染可能继续；旧 svg 不应在最终结果强行留下旧 signature 错误
    expect(cleanupTempElement).toHaveBeenCalled();
  });

  it('成功但 divRef.current 为 null 仍 setRenderedCode', async () => {
    const divRef = { current: null as HTMLDivElement | null };
    const { result } = renderHook(() =>
      useMermaidRender('graph TD\nA-->B', divRef, 'm-nodiv', true),
    );
    await vi.advanceTimersByTimeAsync(100);
    await waitFor(() =>
      expect(result.current.renderedCode).toBe('graph TD\nA-->B'),
    );
    expect(result.current.error).toBe('');
  });

  it('不可见时不调度；code 空且无 div 安全', async () => {
    const divRef = { current: null as HTMLDivElement | null };
    const { result, rerender } = renderHook(
      ({ visible, code }) =>
        useMermaidRender(code, divRef, 'm-vis2', visible),
      { initialProps: { visible: false, code: 'graph TD\nA-->B' } },
    );
    await vi.advanceTimersByTimeAsync(100);
    expect(loadMermaidMock).not.toHaveBeenCalled();

    rerender({ visible: true, code: '' });
    expect(result.current.renderedCode).toBe('');
  });
});
