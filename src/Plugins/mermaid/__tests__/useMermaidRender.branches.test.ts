import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMermaidRender } from '../useMermaidRender';

vi.mock('../utils', () => ({
  createMermaidThemeConfig: vi.fn(() => ({
    cacheKey: 'theme-default',
    theme: 'default',
  })),
  loadMermaid: vi.fn(async () => ({
    render: vi.fn(async (_id: string, code: string) => ({
      svg: `<svg>${code}</svg>`,
    })),
  })),
  applyMermaidTheme: vi.fn(),
  renderSvgToContainer: vi.fn((svg: string, el: HTMLElement) => {
    el.innerHTML = svg;
  }),
  cleanupTempElement: vi.fn(),
}));

describe('useMermaidRender 分支覆盖', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('不可见时不渲染', () => {
    const divRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useMermaidRender('graph TD\nA-->B', divRef, 'm1', false),
    );
    expect(result.current.error).toBe('');
    expect(result.current.renderedCode).toBe('');
  });

  it('空 code 清空容器', async () => {
    const div = document.createElement('div');
    div.innerHTML = 'old';
    const divRef = { current: div };
    renderHook(() => useMermaidRender('', divRef, 'm2', true));
    await waitFor(() => {
      expect(div.innerHTML).toBe('');
    });
  });

  it('可见且有效 code 渲染 SVG', async () => {
    const divRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useMermaidRender('graph TD\nA-->B', divRef, 'm3', true),
    );
    await waitFor(() => {
      expect(result.current.renderedCode).toBe('graph TD\nA-->B');
    });
    expect(divRef.current?.innerHTML).toContain('svg');
  });

  it('render 失败设置 error', async () => {
    const { loadMermaid } = await import('../utils');
    vi.mocked(loadMermaid).mockResolvedValueOnce({
      render: vi.fn(async () => {
        throw new Error('parse fail');
      }),
    } as any);
    const divRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useMermaidRender('bad graph', divRef, 'm4', true),
    );
    await waitFor(() => {
      expect(result.current.error).toContain('parse fail');
    });
  });

  it('相同 signature 跳过重复渲染', async () => {
    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ visible }) => useMermaidRender('x', divRef, 'm5', visible),
      { initialProps: { visible: true } },
    );
    await waitFor(() => expect(divRef.current?.innerHTML).toContain('svg'));
    rerender({ visible: false });
    rerender({ visible: true });
    expect(divRef.current?.innerHTML).toContain('svg');
  });

  it('仅空白 code 清空', async () => {
    const div = document.createElement('div');
    const divRef = { current: div };
    renderHook(() => useMermaidRender('   ', divRef, 'm6', true));
    await waitFor(() => {
      expect(div.innerHTML).toBe('');
    });
  });

  it('themeToken 变化触发 themeConfig', async () => {
    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ token }) =>
        useMermaidRender('graph TD\nA-->B', divRef, 'm7', true, token),
      {
        initialProps: {
          token: { colorPrimary: '#111' } as any,
        },
      },
    );
    await waitFor(() => expect(divRef.current?.innerHTML).toContain('svg'));
    rerender({ token: { colorPrimary: '#222' } as any });
    await waitFor(() => expect(divRef.current?.innerHTML).toContain('svg'));
  });

  it('相同 signature 跳过；仅空白 code；结尾 ``` 修剪', async () => {
    const div = document.createElement('div');
    const divRef = { current: div };
    const { rerender } = renderHook(
      ({ code }) => useMermaidRender(code, divRef, 'm8', true),
      { initialProps: { code: 'graph TD\nA-->B' } },
    );
    await waitFor(() => expect(div.innerHTML).toContain('svg'));
    rerender({ code: 'graph TD\nA-->B' });
    rerender({ code: '   ' });
    await waitFor(() => expect(div.innerHTML).toBe(''));
    rerender({ code: 'graph TD\nA-->B\n```' });
    await waitFor(() => expect(div.innerHTML).toContain('svg'));
  });
});
