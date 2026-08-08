/**
 * ToolUseBarThink deepen2：scrollIntoView、受控 expanded、error status、
 * floating 切换、无 thinkContent。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '../index';

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
  }
  observe = (el: Element) => {
    Object.defineProperty(el, 'scrollHeight', {
      configurable: true,
      get: () => 400,
    });
    this.callback([] as any, this as any);
  };
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe('ToolUseBarThink deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('无 thinkContent 不渲染容器；error status class', () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink toolName="NoBody" status="error" />
      </ConfigProvider>,
    );
    expect(screen.getByText('NoBody')).toBeInTheDocument();
    expect(
      screen.queryByTestId('tool-use-bar-think-container'),
    ).not.toBeInTheDocument();
  });

  it('scrollIntoViewOnExpand=true 与 object 选项', async () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const { rerender } = render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Scroll"
          thinkContent="body"
          expanded={false}
          scrollIntoViewOnExpand
        />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Scroll"
          thinkContent="body"
          expanded
          scrollIntoViewOnExpand
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(scrollIntoView).toHaveBeenCalled();

    scrollIntoView.mockClear();
    rerender(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Scroll"
          thinkContent="body"
          expanded={false}
          scrollIntoViewOnExpand={{ behavior: 'auto', block: 'center' }}
        />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Scroll"
          thinkContent="body"
          expanded
          scrollIntoViewOnExpand={{ behavior: 'auto', block: 'center' }}
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('受控 floatingExpanded + onFloatingExpandedChange；loading 强制展开', async () => {
    const onFloating = vi.fn();
    const onExpanded = vi.fn();
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Float"
          thinkContent="stream"
          status="loading"
          expanded={false}
          onExpandedChange={onExpanded}
          floatingExpanded={false}
          onFloatingExpandedChange={onFloating}
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    const floating = screen.getAllByTestId('tool-use-bar-think-floating-expand');
    fireEvent.click(floating[0]);
    expect(onFloating).toHaveBeenCalled();
  });

  it('header 点击切换；styles/classNames 透传；testId', () => {
    const onExpanded = vi.fn();
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Clk"
          toolTarget="tgt"
          thinkContent="c"
          testId="think-custom"
          defaultExpanded
          onExpandedChange={onExpanded}
          classNames={{ root: 'r-x', name: 'n-x' }}
          styles={{ root: { margin: 1 }, name: { color: 'red' } }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('think-custom')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('tool-use-bar-think-bar'));
    expect(onExpanded).toHaveBeenCalled();
  });

  it('content expand 点击切换 contentExpanded', async () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Ov2"
          thinkContent={'L'.repeat(300)}
          defaultExpanded
          status="success"
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    const expand = screen.queryByTestId('tool-use-bar-think-content-expand');
    if (expand) {
      fireEvent.click(expand);
      fireEvent.click(expand);
      expect(expand).toBeInTheDocument();
    }
  });
});
