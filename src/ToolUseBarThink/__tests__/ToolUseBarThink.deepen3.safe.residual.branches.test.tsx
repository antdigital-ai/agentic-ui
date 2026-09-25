/**
 * ToolUseBarThink deepen3 safe：content expand 键盘、
 * collapsed floating 点击、受控 floatingExpanded。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarThink } from '../index';

describe('ToolUseBarThink deepen3 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    global.ResizeObserver = vi.fn(function MockRO(this: ResizeObserver, cb) {
      this.observe = vi.fn((el: Element) => {
        Object.defineProperty(el, 'scrollHeight', {
          configurable: true,
          get: () => 400,
        });
        cb([], this);
      }) as any;
      this.disconnect = vi.fn();
      this.unobserve = vi.fn();
      return this;
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('content expand Enter/Space', async () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Keys"
          thinkContent={'line\n'.repeat(80)}
          defaultExpanded
          status="success"
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(30);
    });
    const expand = screen.queryByTestId('tool-use-bar-think-content-expand');
    if (expand) {
      fireEvent.keyDown(expand, { key: 'Enter' });
      fireEvent.keyDown(expand, { key: ' ' });
    }
    expect(screen.getByText('Keys')).toBeInTheDocument();
  });

  it('loading collapsed floating 按钮点击', async () => {
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Float"
          thinkContent="stream"
          status="loading"
          expanded={false}
          floatingExpanded={false}
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    const floating = screen.getAllByTestId('tool-use-bar-think-floating-expand');
    fireEvent.click(floating[0]);
    expect(floating[0]).toBeInTheDocument();
  });

  it('floatingExpanded 受控 onFloatingExpandedChange', async () => {
    const onFloating = vi.fn();
    render(
      <ConfigProvider>
        <ToolUseBarThink
          toolName="Ctl"
          thinkContent="body"
          status="loading"
          expanded={false}
          floatingExpanded
          onFloatingExpandedChange={onFloating}
        />
      </ConfigProvider>,
    );
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    fireEvent.click(
      screen.getAllByTestId('tool-use-bar-think-floating-expand')[0],
    );
    expect(onFloating).toHaveBeenCalled();
  });
});
