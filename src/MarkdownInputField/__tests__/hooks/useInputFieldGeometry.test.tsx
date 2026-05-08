/**
 * useInputFieldGeometry Hook 测试
 *
 * 该 hook 由原 useMarkdownInputFieldLayout（容器尺寸/折叠状态/setter）
 * 与 useMarkdownInputFieldStyles（基于上述状态的派生样式）合并而来。
 * 本文件覆盖两侧行为：
 *  - Layout：window.innerWidth 初始化、setter、ResizeObserver 折叠
 *  - Styles：computedRightPadding / computedMinHeight / enlargedStyle / collapsedHeightPx
 */

import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInputFieldGeometry } from '../../hooks/useInputFieldGeometry';

const baseParams = {
  isEnlarged: false,
  hasTools: false,
  hasEnlargeAction: false,
  hasRefineAction: false,
  totalActionCount: 0,
  isMultiRowLayout: false,
  maxHeight: undefined,
  style: {} as React.CSSProperties,
  attachment: undefined as { enable?: boolean } | undefined,
};

describe('useInputFieldGeometry', () => {
  /* ====== Layout 侧 ====== */

  describe('collapseSendActions 初始化（基于 window.innerWidth）', () => {
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true,
        configurable: true,
      });
    });

    it('window.innerWidth < 460 时 collapseSendActions 初始为 true', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current.collapseSendActions).toBe(true);
    });

    it('window.innerWidth >= 460 时 collapseSendActions 初始为 false', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current.collapseSendActions).toBe(false);
    });
  });

  describe('返回值结构与稳定回调', () => {
    it('暴露 inputRef、collapseSendActions、2 个稳定回调与样式派生值', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current).toHaveProperty('inputRef');
      expect(result.current).toHaveProperty('collapseSendActions');
      // 由原 3 个内部 setter 合并为 2 个稳定回调，直接传给子组件 onResize。
      expect(result.current).toHaveProperty('onSendActionsResize');
      expect(result.current).toHaveProperty('onQuickActionsResize');
      expect(typeof result.current.onSendActionsResize).toBe('function');
      expect(typeof result.current.onQuickActionsResize).toBe('function');
      expect(result.current).toHaveProperty('computedRightPadding');
      expect(result.current).toHaveProperty('collapsedHeightPx');
      expect(result.current).toHaveProperty('computedMinHeight');
      expect(result.current).toHaveProperty('enlargedStyle');
    });

    it('onSendActionsResize 更新后 computedRightPadding 同步变化', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      act(() => {
        result.current.onSendActionsResize(100);
      });

      // hasTools=false 时 bottomOverlay = rightPadding(100)，topOverlay = 0
      expect(result.current.computedRightPadding).toBe(100);
    });

    it('onSendActionsResize + onQuickActionsResize 累加进入 topOverlay', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      act(() => {
        result.current.onSendActionsResize(20);
        result.current.onQuickActionsResize(40, 30);
      });

      // bottomOverlay=20, topOverlay=70 → 取较大值
      expect(result.current.computedRightPadding).toBe(70);
    });

    it('hasTools=true 时 bottomOverlay 强制为 0，仅 topOverlay 生效', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, hasTools: true }),
      );

      act(() => {
        result.current.onSendActionsResize(200);
        result.current.onQuickActionsResize(35, 0);
      });

      expect(result.current.computedRightPadding).toBe(35);
    });

    it('rightPadding 为 0 且 hasTools=false 时退化为默认 52', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      act(() => {
        result.current.onSendActionsResize(0);
      });

      // bottomOverlay = rightPadding || 52 → 52，topOverlay 默认 0
      expect(result.current.computedRightPadding).toBe(52);
    });
  });

  describe('ResizeObserver 折叠逻辑', () => {
    let resizeCallback: ((entries: any[]) => void) | null = null;
    let observeSpy: ReturnType<typeof vi.fn>;
    let disconnectSpy: ReturnType<typeof vi.fn>;
    let originalResizeObserver: typeof ResizeObserver;
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      observeSpy = vi.fn();
      disconnectSpy = vi.fn();
      resizeCallback = null;
      originalResizeObserver = globalThis.ResizeObserver;

      (globalThis as any).ResizeObserver = vi.fn(function MockResizeObserver(
        cb: any,
      ) {
        resizeCallback = cb;
        return {
          observe: observeSpy,
          unobserve: vi.fn(),
          disconnect: disconnectSpy,
        };
      });

      // hook 内有 process.env.NODE_ENV === 'test' 守卫，需绕过
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      (globalThis as any).ResizeObserver = originalResizeObserver;
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('inputRef 绑定到 DOM 后 observe 被调用', () => {
      function TestWrapper() {
        const geometry = useInputFieldGeometry(baseParams);
        return <div ref={geometry.inputRef} data-testid="container" />;
      }

      const { unmount } = render(<TestWrapper />);

      expect(observeSpy).toHaveBeenCalled();

      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('clientWidth < 481 时 collapseSendActions 被设置为 true', () => {
      function TestWrapper() {
        const geometry = useInputFieldGeometry(baseParams);
        return (
          <div ref={geometry.inputRef} data-testid="container">
            {String(geometry.collapseSendActions)}
          </div>
        );
      }

      const { getByTestId } = render(<TestWrapper />);
      const container = getByTestId('container');
      Object.defineProperty(container, 'clientWidth', {
        value: 400,
        configurable: true,
      });

      act(() => {
        resizeCallback?.([{ contentRect: { width: 400, height: 200 } }]);
      });

      expect(getByTestId('container').textContent).toBe('true');
    });

    it('clientWidth >= 481 时 collapseSendActions 被设置为 false', () => {
      // 先把初始值置为 true，验证 resize 能改回 false
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true,
        configurable: true,
      });

      function TestWrapper() {
        const geometry = useInputFieldGeometry(baseParams);
        return (
          <div ref={geometry.inputRef} data-testid="container">
            {String(geometry.collapseSendActions)}
          </div>
        );
      }

      const { getByTestId } = render(<TestWrapper />);
      const container = getByTestId('container');
      Object.defineProperty(container, 'clientWidth', {
        value: 600,
        configurable: true,
      });

      act(() => {
        resizeCallback?.([{ contentRect: { width: 600, height: 300 } }]);
      });

      expect(getByTestId('container').textContent).toBe('false');
    });
  });

  /* ====== Styles 侧 ====== */

  describe('computedMinHeight 决策表', () => {
    it('isEnlarged=true 时返回 "auto"，无视其他条件', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({
          ...baseParams,
          isEnlarged: true,
          hasEnlargeAction: true,
          hasRefineAction: true,
          totalActionCount: 2,
          isMultiRowLayout: true,
        }),
      );

      expect(result.current.computedMinHeight).toBe('auto');
    });

    it('style.minHeight 显式给值时优先返回该值', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({
          ...baseParams,
          style: { minHeight: 200 },
          totalActionCount: 1,
        }),
      );

      expect(result.current.computedMinHeight).toBe(200);
    });

    it('hasEnlargeAction + hasRefineAction 同时存在时返回 140', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({
          ...baseParams,
          hasEnlargeAction: true,
          hasRefineAction: true,
          totalActionCount: 2,
          isMultiRowLayout: true,
        }),
      );

      expect(result.current.computedMinHeight).toBe(140);
    });

    it('totalActionCount === 1 时返回 90', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({
          ...baseParams,
          hasEnlargeAction: true,
          totalActionCount: 1,
          isMultiRowLayout: true,
        }),
      );

      expect(result.current.computedMinHeight).toBe(90);
    });

    it('其他多行布局返回 106', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({
          ...baseParams,
          totalActionCount: 3,
          isMultiRowLayout: true,
        }),
      );

      expect(result.current.computedMinHeight).toBe(106);
    });

    it('无任何按钮、非多行布局时返回 0', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current.computedMinHeight).toBe(0);
    });
  });

  describe('collapsedHeightPx', () => {
    it('默认值为 114', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current.collapsedHeightPx).toBe(114);
    });

    it('attachment.enable=true 时额外加 90', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, attachment: { enable: true } }),
      );

      expect(result.current.collapsedHeightPx).toBe(114 + 90);
    });

    it('maxHeight 数值优先于默认值', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, maxHeight: 300 }),
      );

      expect(result.current.collapsedHeightPx).toBe(300);
    });

    it('maxHeight 字符串可解析为数字', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, maxHeight: '250px' }),
      );

      expect(result.current.collapsedHeightPx).toBe(250);
    });

    it('style.maxHeight 在 props.maxHeight 缺省时生效', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, style: { maxHeight: 180 } }),
      );

      expect(result.current.collapsedHeightPx).toBe(180);
    });
  });

  describe('enlargedStyle', () => {
    it('isEnlarged=false 时为空对象', () => {
      const { result } = renderHook(() => useInputFieldGeometry(baseParams));

      expect(result.current.enlargedStyle).toEqual({});
    });

    it('isEnlarged=true 时返回固定的 max/minHeight', () => {
      const { result } = renderHook(() =>
        useInputFieldGeometry({ ...baseParams, isEnlarged: true }),
      );

      expect(result.current.enlargedStyle).toEqual({
        maxHeight: '980px',
        minHeight: '280px',
      });
    });
  });
});
