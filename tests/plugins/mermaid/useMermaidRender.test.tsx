/**
 * useMermaidRender Hook 测试用例
 */

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMermaidRender } from '../../../src/Plugins/mermaid/useMermaidRender';

// Mock utils
vi.mock('../../../src/Plugins/mermaid/utils', async () => {
  const actual = await vi.importActual('../../../src/Plugins/mermaid/utils');
  return {
    ...actual,
    loadMermaid: vi.fn(),
    renderSvgToContainer: vi.fn(),
    cleanupTempElement: vi.fn(),
  };
});

describe('useMermaidRender', () => {
  let divRef: React.RefObject<HTMLDivElement>;
  let divElement: HTMLDivElement;
  let mockLoadMermaid: ReturnType<typeof vi.fn>;
  let mockRenderSvgToContainer: ReturnType<typeof vi.fn>;
  let mockCleanupTempElement: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    divElement = document.createElement('div');
    divRef = { current: divElement };

    const utils = await import('../../../src/Plugins/mermaid/utils');
    mockLoadMermaid = vi.mocked(utils.loadMermaid);
    mockRenderSvgToContainer = vi.mocked(utils.renderSvgToContainer);
    mockCleanupTempElement = vi.mocked(utils.cleanupTempElement);

    mockLoadMermaid.mockResolvedValue({
      render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    });
  });

  describe('基本功能', () => {
    it('应该在 code 为空时不渲染', async () => {
      const { result } = renderHook(() =>
        useMermaidRender('', divRef, 'test-id', true),
      );

      await waitFor(() => {
        expect(result.current.error).toBe('');
        expect(result.current.renderedCode).toBe('');
      });

      // 由于延迟执行，这里主要验证不会立即调用
      expect(mockLoadMermaid).not.toHaveBeenCalled();
    });

    it('应该在 isVisible 为 false 时不渲染', async () => {
      renderHook(() => useMermaidRender('graph TD', divRef, 'test-id', false));

      await waitFor(() => {
        expect(mockLoadMermaid).not.toHaveBeenCalled();
      });
    });

    it('应该在 code 相同时不重复渲染', async () => {
      const { rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      await waitFor(
        () => {
          expect(mockLoadMermaidFn).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      vi.clearAllMocks();

      // 使用相同的 code 重新渲染
      rerender({ code: 'graph TD' });

      await waitFor(
        () => {
          // 不应该再次调用 loadMermaid（因为 code 相同）
          expect(mockLoadMermaid).not.toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });
  });

  describe('渲染流程', () => {
    it('应该加载 Mermaid 并渲染 SVG', async () => {
      const mockRender = vi.fn().mockResolvedValue({ svg: '<svg>test</svg>' });
      mockLoadMermaid.mockResolvedValue({ render: mockRender });

      const { result } = renderHook(() =>
        useMermaidRender('graph TD', divRef, 'test-id', true),
      );

      await waitFor(
        () => {
          expect(mockLoadMermaidFn).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      await waitFor(
        () => {
          expect(mockRender).toHaveBeenCalledWith('test-id', 'graph TD');
          expect(mockRenderSvgToContainer).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );

      expect(result.current.error).toBe('');
      expect(result.current.renderedCode).toBe('graph TD');
    });

    it('应该处理空代码（trim 后为空）', async () => {
      const { result } = renderHook(() =>
        useMermaidRender('   ', divRef, 'test-id', true),
      );

      await waitFor(
        () => {
          expect(result.current.renderedCode).toBe('');
          expect(result.current.error).toBe('');
        },
        { timeout: 2000 },
      );

      expect(divElement.innerHTML).toBe('');
    });

    it('应该清理之前的定时器', async () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      const { rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      // 快速更改 code
      rerender({ code: 'graph LR' });
      rerender({ code: 'graph TB' });

      await waitFor(
        () => {
          expect(clearTimeoutSpy).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      clearTimeoutSpy.mockRestore();
    });

    it('应该在 code 变化时取消之前的渲染', async () => {
      const mockRender = vi.fn().mockResolvedValue({ svg: '<svg></svg>' });
      mockLoadMermaid.mockResolvedValue({ render: mockRender });

      const { rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      // 快速更改 code
      rerender({ code: 'graph LR' });

      await waitFor(
        () => {
          // 应该调用 render（最后一次）
          expect(mockRender).toHaveBeenCalledWith('test-id', 'graph LR');
        },
        { timeout: 2000 },
      );
    });
  });

  describe('错误处理', () => {
    it('应该捕获并设置渲染错误', async () => {
      const error = new Error('Mermaid 渲染失败');
      mockLoadMermaid.mockResolvedValue({
        render: vi.fn().mockRejectedValue(error),
      });

      const { result } = renderHook(() =>
        useMermaidRender('invalid code', divRef, 'test-id', true),
      );

      await waitFor(
        () => {
          expect(result.current.error).toBe('Error: Mermaid 渲染失败');
          expect(result.current.renderedCode).toBe('');
          expect(divElement.innerHTML).toBe('');
        },
        { timeout: 2000 },
      );
    });

    it('应该在 code 变化后忽略旧的错误', async () => {
      const error = new Error('Mermaid 渲染失败');
      mockLoadMermaid.mockResolvedValue({
        render: vi.fn().mockRejectedValue(error),
      });

      const { result, rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'invalid code' } },
      );

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy();
        },
        { timeout: 2000 },
      );

      // 更改 code
      mockLoadMermaid.mockResolvedValue({
        render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
      });

      rerender({ code: 'graph TD' });

      await waitFor(
        () => {
          expect(result.current.error).toBe('');
        },
        { timeout: 2000 },
      );
    });
  });

  describe('清理功能', () => {
    it('应该在渲染后清理临时元素', async () => {
      mockLoadMermaid.mockResolvedValue({
        render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
      });

      renderHook(() => useMermaidRender('graph TD', divRef, 'test-id', true));

      await waitFor(
        () => {
          expect(mockCleanupTempElement).toHaveBeenCalledWith('test-id');
        },
        { timeout: 2000 },
      );
    });

    it('应该在组件卸载时清理定时器', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      const { unmount } = renderHook(() =>
        useMermaidRender('graph TD', divRef, 'test-id', true),
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('边界情况', () => {
    it('应该处理 divRef.current 为 null 的情况', async () => {
      const nullRef = { current: null };

      const { result } = renderHook(() =>
        useMermaidRender('graph TD', nullRef, 'test-id', true),
      );

      await waitFor(
        () => {
          // 应该不会抛出错误
          expect(result.current).toBeDefined();
        },
        { timeout: 2000 },
      );
    });

    it('应该处理重复的 Mermaid API 实例', async () => {
      const mockApi = {
        render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
      };
      mockLoadMermaid.mockResolvedValue(mockApi);

      const { rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      await waitFor(
        () => {
          expect(mockLoadMermaidFn).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      // 第二次渲染应该重用 API 实例
      rerender({ code: 'graph LR' });

      await waitFor(
        () => {
          // 应该重用之前的 API 实例
          expect(mockApi.render).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );
    });
  });
});
