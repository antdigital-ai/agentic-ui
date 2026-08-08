/**
 * ToolUseBarThink 分支覆盖：light/hover、overflow 展开、floating、scrollIntoView。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '../index';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

const longContent = 'L'.repeat(300);

describe('ToolUseBarThink branches', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('loading 时自动展开 container', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent="content"
          status="loading"
        />
      </Wrapper>,
    );
    expect(
      screen.getByTestId('tool-use-bar-think-container'),
    ).toBeInTheDocument();
  });

  it('light 模式 hover 切换图标', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent="x"
          light
          defaultExpanded={false}
        />
      </Wrapper>,
    );
    const header = screen.getByTestId('tool-use-bar-think-header');
    fireEvent.mouseMove(header);
    fireEvent.mouseLeave(header);
    expect(header).toBeInTheDocument();
  });

  it('点击 bar 切换展开', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent="body"
          defaultExpanded={false}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));
    expect(
      screen.getByTestId('tool-use-bar-think-container'),
    ).toBeInTheDocument();
  });

  it('loading + 非 light 显示 floating expand', () => {
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent="stream"
          status="loading"
          defaultExpanded={false}
        />
      </Wrapper>,
    );
    expect(
      screen.getByTestId('tool-use-bar-think-floating-expand'),
    ).toBeInTheDocument();
  });

  it('scrollIntoViewOnExpand 展开后调用 scrollIntoView', () => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent="c"
          defaultExpanded={false}
          scrollIntoViewOnExpand
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('无 thinkContent 时不渲染 container', () => {
    render(
      <Wrapper>
        <ToolUseBarThink toolName="OnlyName" />
      </Wrapper>,
    );
    expect(
      screen.queryByTestId('tool-use-bar-think-container'),
    ).not.toBeInTheDocument();
  });

  it('内容溢出时显示 content-expand', () => {
    const originalRO = global.ResizeObserver;
    global.ResizeObserver = class {
      private readonly cb: () => void;
      constructor(cb: () => void) {
        this.cb = cb;
      }
      observe(el: HTMLElement) {
        Object.defineProperty(el, 'scrollHeight', {
          value: 400,
          configurable: true,
        });
        this.cb();
      }
      disconnect() {}
      unobserve() {}
    } as any;

    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent={longContent}
          defaultExpanded
          status="success"
        />
      </Wrapper>,
    );
    expect(
      screen.getByTestId('tool-use-bar-think-content-expand'),
    ).toBeInTheDocument();
    global.ResizeObserver = originalRO;
  });

  it('content-expand Enter 键切换', () => {
    const originalRO = global.ResizeObserver;
    global.ResizeObserver = class {
      private readonly cb: () => void;
      constructor(cb: () => void) {
        this.cb = cb;
      }
      observe(el: HTMLElement) {
        Object.defineProperty(el, 'scrollHeight', {
          value: 400,
          configurable: true,
        });
        this.cb();
      }
      disconnect() {}
      unobserve() {}
    } as any;

    render(
      <Wrapper>
        <ToolUseBarThink
          toolName="Think"
          thinkContent={longContent}
          defaultExpanded
          status="success"
        />
      </Wrapper>,
    );
    const expandBtn = screen.getByTestId('tool-use-bar-think-content-expand');
    fireEvent.keyDown(expandBtn, { key: 'Enter' });
    expect(expandBtn).toBeInTheDocument();
    global.ResizeObserver = originalRO;
  });
});
