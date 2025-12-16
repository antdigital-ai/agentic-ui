/**
 * useMermaidRender Hook 测试用例
 */

import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.useFakeTimers();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基本功能', () => {
    it('应该在 code 为空时不渲染', async () => {
      const { result } = renderHook(() =>
        useMermaidRender('', divRef, 'test-id', true),
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.error).toBe('');
      expect(result.current.renderedCode).toBe('');
      // 由于延迟执行，这里主要验证不会立即调用
      expect(mockLoadMermaid).not.toHaveBeenCalled();
    });

    it('应该在 isVisible 为 false 时不渲染', async () => {
      renderHook(() => useMermaidRender('graph TD', divRef, 'test-id', false));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(mockLoadMermaid).not.toHaveBeenCalled();
    });

    it('应该在 code 相同时不重复渲染', async () => {
      const { rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      // 推进时间以触发 setTimeout
      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      expect(mockLoadMermaid).toHaveBeenCalled();

      vi.clearAllMocks();

      // 使用相同的 code 重新渲染
      rerender({ code: 'graph TD' });

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      // 不应该再次调用 loadMermaid（因为 code 相同）
      expect(mockLoadMermaid).not.toHaveBeenCalled();
    });
  });

  describe('渲染流程', () => {
    it('应该加载 Mermaid 并渲染 SVG', async () => {
      const mockRender = vi.fn().mockResolvedValue({ svg: '<svg>test</svg>' });
      mockLoadMermaid.mockResolvedValue({ render: mockRender });

      const { result, rerender } = renderHook(
        ({ code }) => useMermaidRender(code, divRef, 'test-id', true),
        { initialProps: { code: 'graph TD' } },
      );

      // 推进时间以触发 setTimeout
      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      // 强制重新渲染以获取最新的 renderedCode（因为它是从 ref 读取的）
      rerender({ code: 'graph TD' });

      // 直接断言，不等待
      expect(mockLoadMermaid).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalledWith('test-id', 'graph TD');
      expect(mockRenderSvgToContainer).toHaveBeenCalled();
      expect(result.current.error).toBe('');
      expect(result.current.renderedCode).toBe('graph TD');
    });

    it('应该处理空代码（trim 后为空）', async () => {
      const { result } = renderHook(() =>
        useMermaidRender('   ', divRef, 'test-id', true),
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      expect(result.current.renderedCode).toBe('');
      expect(result.current.error).toBe('');
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

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

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

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      // 应该调用 render（最后一次）
      expect(mockRender).toHaveBeenCalledWith('test-id', 'graph LR');
    });
  });

  describe('错误处理', () => {
    it('应该捕获并设置渲染错误', async () => {
      const error = new Error('Mermaid 渲染失败');
      const mockRender = vi.fn().mockRejectedValue(error);
      mockLoadMermaid.mockResolvedValue({
        render: mockRender,
      });

      const { result } = renderHook(() =>
        useMermaidRender('invalid code', divRef, 'test-id', true),
      );

      await act(async () => {
        // 推进时间以触发 setTimeout（延迟 100ms）
        vi.advanceTimersByTime(200);
        // 等待所有异步操作完成
        await vi.runAllTimersAsync();
      });

      // 根据实现，错误时 renderedCode 会被设置为当前的 code
      expect(result.current.error).toBe('Error: Mermaid 渲染失败');
      expect(result.current.renderedCode).toBe('invalid code');
      expect(divElement.innerHTML).toBe('');
      expect(mockRender).toHaveBeenCalledWith('test-id', 'invalid code');
    });
  });

  describe('清理功能', () => {
    it('应该在渲染后清理临时元素', async () => {
      mockLoadMermaid.mockResolvedValue({
        render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
      });

      renderHook(() => useMermaidRender('graph TD', divRef, 'test-id', true));

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      expect(mockCleanupTempElement).toHaveBeenCalledWith('test-id');
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

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      // 应该不会抛出错误
      expect(result.current).toBeDefined();
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

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      expect(mockLoadMermaid).toHaveBeenCalled();

      // 第二次渲染应该重用 API 实例
      rerender({ code: 'graph LR' });

      await act(async () => {
        vi.advanceTimersByTime(500);
        // 运行所有待处理的定时器
        await vi.runAllTimersAsync();
      });

      // 应该重用之前的 API 实例
      expect(mockApi.render).toHaveBeenCalled();
    });
  });
});
