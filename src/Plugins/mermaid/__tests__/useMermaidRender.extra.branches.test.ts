import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMermaidRender } from '../useMermaidRender';

vi.mock('../utils', () => ({
  createMermaidThemeConfig: vi.fn((token?: any) => ({
    cacheKey: token?.colorPrimary ? `theme-${token.colorPrimary}` : 'theme-default',
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

describe('useMermaidRender 额外分支', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('仅空格 code 清空容器', async () => {
    const div = document.createElement('div');
    div.innerHTML = 'old';
    const divRef = { current: div };
    renderHook(() => useMermaidRender('   ', divRef, 'm-space', true));
    await waitFor(() => {
      expect(div.innerHTML).toBe('');
    });
  });

  it('themeToken 变化触发重新应用主题', async () => {
    const { applyMermaidTheme } = await import('../utils');
    const divRef = { current: document.createElement('div') };
    const { rerender } = renderHook(
      ({ token }) =>
        useMermaidRender('graph TD\nA-->B', divRef, 'm-theme', true, token),
      {
        initialProps: {
          token: { colorPrimary: '#111' } as any,
        },
      },
    );
    await waitFor(() => {
      expect(applyMermaidTheme).toHaveBeenCalled();
    });
    rerender({ token: { colorPrimary: '#222' } as any });
    await waitFor(() => {
      expect(vi.mocked(applyMermaidTheme).mock.calls.length).toBeGreaterThan(1);
    });
  });

  it('code 末尾 ``` 仍渲染', async () => {
    const divRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useMermaidRender('graph TD\nA-->B\n```', divRef, 'm-fence', true),
    );
    await waitFor(() => {
      expect(result.current.renderedCode).toContain('graph TD');
    });
  });

  it('签名过期时丢弃过时 render 结果', async () => {
    const { loadMermaid } = await import('../utils');
    let resolveRender: (v: { svg: string }) => void = () => {};
    vi.mocked(loadMermaid).mockResolvedValueOnce({
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
    rerender({ code: 'graph TD\nC-->D' });
    resolveRender({ svg: '<svg>stale</svg>' });
    await waitFor(() => {
      expect(divRef.current?.innerHTML).not.toContain('stale');
    });
  });
});
