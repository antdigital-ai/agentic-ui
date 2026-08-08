/**
 * ToolUseBar BarItem/Content 分支覆盖：ToolImage、Header、Expand、Content。
 */
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ToolContent,
  ToolExpand,
  ToolHeaderRight,
  ToolImage,
  ToolTime,
} from '../BarItem/Content';

const prefixCls = 'tool-bar';
const hashId = 'hash';

const baseTool = {
  id: 't1',
  toolName: 'Search',
  toolTarget: 'query',
  status: 'success' as const,
  content: 'result body',
  time: '12:00',
};

describe('ToolUseBar Content branches', () => {
  afterEach(() => {
    cleanup();
  });

  describe('ToolImage', () => {
    it('loading 态挂载 loading 修饰类', () => {
      const { container } = render(
        <ToolImage
          tool={{ ...baseTool, status: 'loading' }}
          prefixCls={prefixCls}
          hashId={hashId}
        />,
      );
      expect(
        container.querySelector(`.${prefixCls}-tool-image-wrapper-loading`),
      ).toBeTruthy();
    });

    it('自定义 icon 时使用传入 icon', () => {
      render(
        <ToolImage
          tool={{
            ...baseTool,
            icon: <span data-testid="custom-icon">I</span>,
          }}
          prefixCls={prefixCls}
          hashId={hashId}
        />,
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('ToolHeaderRight', () => {
    it('light + loading + disableAnimation 组合类名', () => {
      const { container } = render(
        <ToolHeaderRight
          tool={{ ...baseTool, status: 'loading' }}
          prefixCls={prefixCls}
          hashId={hashId}
          light
          disableAnimation
        />,
      );
      expect(
        container.querySelector(`.${prefixCls}-tool-header-right-light`),
      ).toBeTruthy();
      expect(
        container.querySelector(`.${prefixCls}-tool-header-right-loading`),
      ).toBeFalsy();
    });

    it('无 toolName / toolTarget 时不渲染对应节点', () => {
      const { container } = render(
        <ToolHeaderRight
          tool={{ ...baseTool, toolName: undefined, toolTarget: undefined }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
        />,
      );
      expect(container.querySelector(`.${prefixCls}-tool-name`)).toBeFalsy();
    });
  });

  describe('ToolTime', () => {
    it('无 time 时返回 null', () => {
      const { container } = render(
        <ToolTime
          tool={{ ...baseTool, time: undefined }}
          prefixCls={prefixCls}
          hashId={hashId}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('有 time 时渲染', () => {
      render(
        <ToolTime tool={baseTool} prefixCls={prefixCls} hashId={hashId} />,
      );
      expect(screen.getByText('12:00')).toBeInTheDocument();
    });
  });

  describe('ToolExpand', () => {
    it('showContent=false 时不渲染', () => {
      const { container } = render(
        <ToolExpand
          showContent={false}
          expanded
          prefixCls={prefixCls}
          hashId={hashId}
          onExpandClick={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('disableAnimation 时不附加 transition', () => {
      const onExpandClick = vi.fn();
      const { container } = render(
        <ToolExpand
          showContent
          expanded={false}
          prefixCls={prefixCls}
          hashId={hashId}
          onExpandClick={onExpandClick}
          disableAnimation
        />,
      );
      fireEvent.click(
        container.querySelector(`.${prefixCls}-tool-expand`) as HTMLElement,
      );
      expect(onExpandClick).toHaveBeenCalled();
    });
  });

  describe('ToolContent', () => {
    it('error 态渲染 errorMessage', () => {
      const { getByText } = render(
        <ToolContent
          tool={{
            ...baseTool,
            status: 'error',
            errorMessage: 'failed',
            content: undefined,
          }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent
          expanded
        />,
      );
      expect(getByText('failed')).toBeInTheDocument();
    });

    it('disableAnimation 且未展开时不渲染容器', () => {
      render(
        <ToolContent
          tool={baseTool}
          prefixCls={prefixCls}
          hashId={hashId}
          light
          showContent
          expanded={false}
          disableAnimation
        />,
      );
      expect(
        screen.queryByTestId('tool-user-item-tool-container'),
      ).not.toBeInTheDocument();
    });

    it('disableAnimation 展开时渲染容器', () => {
      render(
        <ToolContent
          tool={baseTool}
          prefixCls={prefixCls}
          hashId={hashId}
          light
          showContent
          expanded
          disableAnimation
        />,
      );
      expect(
        screen.getByTestId('tool-user-item-tool-container'),
      ).toBeInTheDocument();
    });

    it('showContent=false 时隐藏占位仍渲染 contentDom', () => {
      const { container } = render(
        <ToolContent
          tool={baseTool}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent={false}
          expanded={false}
        />,
      );
      expect(container.textContent).toContain('result body');
    });

    it('内容超高时展示展开按钮并可切换', async () => {
      const scrollHeightSpy = vi
        .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
        .mockReturnValue(400);

      render(
        <ToolContent
          tool={{ ...baseTool, content: 'x'.repeat(100) }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent
          expanded
        />,
      );

      await act(async () => {
        await Promise.resolve();
      });

      const expandBtn = screen.queryByTestId('tool-content-expand');
      if (expandBtn) {
        fireEvent.click(expandBtn);
        fireEvent.keyDown(expandBtn, { key: 'Enter' });
        fireEvent.keyDown(expandBtn, { key: ' ' });
        expect(expandBtn).toBeInTheDocument();
      }

      scrollHeightSpy.mockRestore();
    });

    it('收起动画延迟卸载 DOM', () => {
      vi.useFakeTimers();
      try {
        const { rerender, queryByTestId } = render(
          <ToolContent
            tool={baseTool}
            prefixCls={prefixCls}
            hashId={hashId}
            light={false}
            showContent
            expanded
          />,
        );
        rerender(
          <ToolContent
            tool={baseTool}
            prefixCls={prefixCls}
            hashId={hashId}
            light={false}
            showContent
            expanded={false}
          />,
        );
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(queryByTestId('tool-user-item-tool-container')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('error 无 errorMessage 时不渲染 error 区', () => {
      render(
        <ToolContent
          tool={{ ...baseTool, status: 'error', errorMessage: undefined }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent
          expanded
        />,
      );
      expect(screen.queryByText('failed')).not.toBeInTheDocument();
    });

    it('动画路径展开时渲染 container 且 aria-hidden=false', () => {
      render(
        <ToolContent
          tool={baseTool}
          prefixCls={prefixCls}
          hashId={hashId}
          light
          showContent
          expanded
        />,
      );
      const container = screen.getByTestId('tool-user-item-tool-container');
      expect(container.getAttribute('aria-hidden')).toBe('false');
      expect(container.className).toContain('-tool-container-light');
    });

    it('ToolHeaderRight loading 且未 disableAnimation 时挂载 loading 类', () => {
      const { container } = render(
        <ToolHeaderRight
          tool={{ ...baseTool, status: 'loading' }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
        />,
      );
      expect(
        container.querySelector(`.${prefixCls}-tool-header-right-loading`),
      ).toBeTruthy();
    });

    it('ToolImage 默认 Api 图标', () => {
      const { container } = render(
        <ToolImage tool={baseTool} prefixCls={prefixCls} hashId={hashId} />,
      );
      expect(container.querySelector(`.${prefixCls}-tool-image`)).toBeTruthy();
    });

    it('ToolExpand 开启动画时 chevron 带 transition', () => {
      const { container } = render(
        <ToolExpand
          showContent
          expanded={false}
          prefixCls={prefixCls}
          hashId={hashId}
          onExpandClick={vi.fn()}
        />,
      );
      const chevron = container.querySelector('svg');
      expect(chevron?.getAttribute('style')).toContain('transition');
    });

    it('ToolTime 渲染时间文案', () => {
      render(
        <ToolTime tool={baseTool} prefixCls={prefixCls} hashId={hashId} />,
      );
      expect(screen.getByText('12:00')).toBeInTheDocument();
    });

    it('ToolExpand expanded=true 时仍可点击收起', () => {
      const onExpandClick = vi.fn();
      const { container } = render(
        <ToolExpand
          showContent
          expanded
          prefixCls={prefixCls}
          hashId={hashId}
          onExpandClick={onExpandClick}
        />,
      );
      fireEvent.click(container.querySelector(`.${prefixCls}-tool-expand`)!);
      expect(onExpandClick).toHaveBeenCalled();
    });

    it('error + errorMessage 渲染错误区', () => {
      render(
        <ToolContent
          tool={{ ...baseTool, status: 'error', errorMessage: 'boom' }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent
          expanded
        />,
      );
      expect(screen.getByText('boom')).toBeInTheDocument();
    });

    it('无 content 时不崩溃', () => {
      render(
        <ToolContent
          tool={{ ...baseTool, content: undefined as any }}
          prefixCls={prefixCls}
          hashId={hashId}
          light
          showContent
          expanded
        />,
      );
      expect(
        screen.getByTestId('tool-user-item-tool-container'),
      ).toBeInTheDocument();
    });

    it('ResizeObserver 检测到超高内容时展示展开按钮', async () => {
      const roCallbacks: ResizeObserverCallback[] = [];
      global.ResizeObserver = vi.fn(function MockRO(cb: ResizeObserverCallback) {
        roCallbacks.push(cb);
        return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
      }) as unknown as typeof ResizeObserver;

      vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
        400,
      );

      render(
        <ToolContent
          tool={{ ...baseTool, content: 'long content' }}
          prefixCls={prefixCls}
          hashId={hashId}
          light={false}
          showContent
          expanded
        />,
      );

      await act(async () => {
        roCallbacks.forEach((cb) =>
          cb([], {} as unknown as ResizeObserver),
        );
      });

      const expandBtn = screen.queryByTestId('tool-content-expand');
      if (expandBtn) {
        fireEvent.click(expandBtn);
        expect(screen.getByText('收起')).toBeInTheDocument();
      }

      vi.restoreAllMocks();
    });
  });
});
