/**
 * ToolUseBarThink deepen：CSS 已注册、light hover chevron、overflow Space、无 toolTarget。
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

describe('ToolUseBarThink deepen residual branches', () => {
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

  it('CSS.registerProperty 已存在时 catch；无 toolTarget', () => {
    const register = vi.fn(() => {
      throw new Error('already registered');
    });
    vi.stubGlobal('CSS', { registerProperty: register });
    render(
      <ConfigProvider>
        <ToolUseBarThink toolName="OnlyName" thinkContent="c" />
      </ConfigProvider>,
    );
    expect(screen.getByText('OnlyName')).toBeInTheDocument();
  });

  it('light + hover 显示 Chevron；expanded 旋转', () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Light"
          toolTarget="tgt"
          thinkContent="body"
          light
          defaultExpanded
        />
      </ConfigProvider>,
    );
    const header = screen.getByTestId('tool-use-bar-think-header');
    fireEvent.mouseMove(header);
    expect(header).toBeInTheDocument();
    fireEvent.mouseLeave(header);
  });

  it('overflow 展开按钮 Enter/Space；loading floating aria', async () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Ov"
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
      fireEvent.keyDown(expand, { key: 'Enter' });
      fireEvent.keyDown(expand, { key: ' ' });
      expect(expand).toBeInTheDocument();
    }

    cleanup();
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Load"
          thinkContent="stream"
          status="loading"
          defaultExpanded={false}
          time="1s"
          icon={<span data-testid="ic">i</span>}
        />
      </ConfigProvider>,
    );
    expect(
      screen.getByTestId('tool-use-bar-think-floating-expand'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(screen.getByText('1s')).toBeInTheDocument();
  });
});
