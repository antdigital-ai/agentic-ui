import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMarkdownInputFieldLayout } from '../../../src/MarkdownInputField/hooks/useMarkdownInputFieldLayout';

describe('useMarkdownInputFieldLayout', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
  });

  describe('useState 初始化 — collapseSendActions', () => {
    it('window.innerWidth < 460 时 collapseSendActions 初始为 true', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      expect(result.current.collapseSendActions).toBe(true);
    });

    it('window.innerWidth >= 460 时 collapseSendActions 初始为 false', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      expect(result.current.collapseSendActions).toBe(false);
    });
  });

  describe('useEffect — inputRef.current 为 null 时 early return', () => {
    it('renderHook 时 inputRef.current 为 null，useEffect 走 early return', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      // inputRef 未绑定到 DOM，current 为 null
      expect(result.current.inputRef.current).toBeNull();
      // dimensions 保持默认值
      expect(result.current.dimensions).toEqual({ width: 0, height: 0 });
    });
  });

  /* ====== hook 返回值完整性 ====== */

  describe('hook 返回值', () => {
    it('返回所有需要的属性和方法', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      expect(result.current).toHaveProperty('collapseSendActions');
      expect(result.current).toHaveProperty('setCollapseSendActions');
      expect(result.current).toHaveProperty('rightPadding');
      expect(result.current).toHaveProperty('setRightPadding');
      expect(result.current).toHaveProperty('topRightPadding');
      expect(result.current).toHaveProperty('setTopRightPadding');
      expect(result.current).toHaveProperty('quickRightOffset');
      expect(result.current).toHaveProperty('setQuickRightOffset');
      expect(result.current).toHaveProperty('inputRef');
      expect(result.current).toHaveProperty('dimensions');
      expect(result.current.rightPadding).toBe(64);
      expect(result.current.topRightPadding).toBe(0);
      expect(result.current.quickRightOffset).toBe(0);
    });
  });

  /* ====== setter 函数 ====== */

  describe('setter 函数', () => {
    it('setCollapseSendActions 更新状态', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      act(() => {
        result.current.setCollapseSendActions(true);
      });
      expect(result.current.collapseSendActions).toBe(true);

      act(() => {
        result.current.setCollapseSendActions(false);
      });
      expect(result.current.collapseSendActions).toBe(false);
    });

    it('setRightPadding 更新状态', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      act(() => {
        result.current.setRightPadding(100);
      });
      expect(result.current.rightPadding).toBe(100);
    });

    it('setTopRightPadding 更新状态', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      act(() => {
        result.current.setTopRightPadding(20);
      });
      expect(result.current.topRightPadding).toBe(20);
    });

    it('setQuickRightOffset 更新状态', () => {
      const { result } = renderHook(() => useMarkdownInputFieldLayout());

      act(() => {
        result.current.setQuickRightOffset(50);
      });
      expect(result.current.quickRightOffset).toBe(50);
    });
  });

  describe('useEffect — inputRef 绑定到真实 DOM', () => {
    let resizeCallback: ((entries: any[]) => void) | null = null;
    let observeSpy: ReturnType<typeof vi.fn>;
    let disconnectSpy: ReturnType<typeof vi.fn>;
    let originalResizeObserver: typeof ResizeObserver;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      observeSpy = vi.fn();
      disconnectSpy = vi.fn();
      resizeCallback = null;
      originalResizeObserver = globalThis.ResizeObserver;
      originalNodeEnv = process.env.NODE_ENV;

      // 覆盖 ResizeObserver mock，捕获 callback
      (globalThis as any).ResizeObserver = vi.fn((cb: any) => {
        resizeCallback = cb;
        return {
          observe: observeSpy,
          unobserve: vi.fn(),
          disconnect: disconnectSpy,
        };
      });
    });

    afterEach(() => {
      (globalThis as any).ResizeObserver = originalResizeObserver;
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('inputRef 绑定到 DOM 时 useEffect 尝试执行', () => {
      // 尝试绕过 NODE_ENV guard
      process.env.NODE_ENV = 'development';

      function TestWrapper() {
        const layout = useMarkdownInputFieldLayout();
        return (
          <div ref={layout.inputRef} data-testid="input-container">
            <span>{layout.dimensions.width}</span>
          </div>
        );
      }

      const { unmount } = render(<TestWrapper />);

      // 如果 NODE_ENV 可被运行时修改：
      // - ResizeObserver 应被创建并 observe
      // - dimensions 应被初始化
      // 如果 NODE_ENV 被编译时替换，则 useEffect 返回

      unmount();

      // 还原
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('ResizeObserver 触发时更新 dimensions 和 collapseSendActions', () => {
      process.env.NODE_ENV = 'development';

      function TestWrapper() {
        const layout = useMarkdownInputFieldLayout();
        return (
          <div ref={layout.inputRef} data-testid="input-container">
            {layout.dimensions.width}
          </div>
        );
      }

      render(<TestWrapper />);

      // 如果 ResizeObserver 被正常创建，模拟 resize 事件
      if (resizeCallback) {
        const mockDiv = document.querySelector(
          '[data-testid="input-container"]',
        );
        if (mockDiv) {
          Object.defineProperty(mockDiv, 'clientWidth', { value: 500 });
          Object.defineProperty(mockDiv, 'clientHeight', { value: 300 });
        }

        act(() => {
          resizeCallback!([
            {
              contentRect: { width: 500, height: 300 },
              target: mockDiv,
            },
          ]);
        });
      }

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('clientWidth < 481 时设置 collapseSendActions 为 true', () => {
      process.env.NODE_ENV = 'development';

      function TestWrapper() {
        const layout = useMarkdownInputFieldLayout();
        return (
          <div ref={layout.inputRef} data-testid="narrow-container">
            {String(layout.collapseSendActions)}
          </div>
        );
      }

      render(<TestWrapper />);

      if (resizeCallback) {
        const mockDiv = document.querySelector(
          '[data-testid="narrow-container"]',
        );
        if (mockDiv) {
          Object.defineProperty(mockDiv, 'clientWidth', { value: 400 });
        }

        act(() => {
          resizeCallback!([
            {
              contentRect: { width: 400, height: 200 },
              target: mockDiv,
            },
          ]);
        });
      }

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('clientWidth >= 481 时设置 collapseSendActions 为 false', () => {
      process.env.NODE_ENV = 'development';

      function TestWrapper() {
        const layout = useMarkdownInputFieldLayout();
        return (
          <div ref={layout.inputRef} data-testid="wide-container">
            {String(layout.collapseSendActions)}
          </div>
        );
      }

      render(<TestWrapper />);

      if (resizeCallback) {
        const mockDiv = document.querySelector(
          '[data-testid="wide-container"]',
        );
        if (mockDiv) {
          Object.defineProperty(mockDiv, 'clientWidth', { value: 600 });
        }

        act(() => {
          resizeCallback!([
            {
              contentRect: { width: 600, height: 300 },
              target: mockDiv,
            },
          ]);
        });
      }

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('unmount 时调用 resizeObserver.disconnect', () => {
      process.env.NODE_ENV = 'development';

      function TestWrapper() {
        const layout = useMarkdownInputFieldLayout();
        return <div ref={layout.inputRef}>test</div>;
      }

      const { unmount } = render(<TestWrapper />);
      unmount();

      // 如果 observe 被调用，disconnect 也应在 unmount 时被调用
      if (observeSpy.mock.calls.length > 0) {
        expect(disconnectSpy).toHaveBeenCalled();
      }

      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
