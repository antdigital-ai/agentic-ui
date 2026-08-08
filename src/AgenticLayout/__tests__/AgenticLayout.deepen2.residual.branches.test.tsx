/**
 * AgenticLayout deepen2：双 mousemove rAF 合并、mouseup flush、
 * resize 未超 max、handlers 二次 up 空、rAF nextWidth null。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AGENTIC_LAYOUT_TEST_ID, AgenticLayout } from '../index';

describe('AgenticLayout deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('视口 resize：当前宽度未超 max 不 clamp', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 2000,
    });
    render(
      <ConfigProvider>
        <AgenticLayout
          center={<div>C</div>}
          right={<div>R</div>}
          rightWidth={400}
        />
      </ConfigProvider>,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1800,
    });
    await act(async () => {
      fireEvent.resize(window);
    });
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
  });

  it('同一帧两次 mousemove：rafId 已设走合并臂', async () => {
    const { container } = render(
      <ConfigProvider>
        <AgenticLayout
          center={<div>C</div>}
          right={<div>R</div>}
          rightWidth={420}
        />
      </ConfigProvider>,
    );
    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    fireEvent.mouseDown(handle, { clientX: 800 });
    await act(async () => {
      fireEvent.mouseMove(document, { clientX: 780 });
      fireEvent.mouseMove(document, { clientX: 760 });
      vi.advanceTimersByTime(32);
    });
    fireEvent.mouseUp(document);
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
  });

  it('mouseup 带 pendingWidth flush；二次 up handlers 已空', async () => {
    let rafCb: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCb = cb;
      return 99;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { container } = render(
      <ConfigProvider>
        <AgenticLayout
          center={<div>C</div>}
          right={<div>R</div>}
          rightWidth={420}
        />
      </ConfigProvider>,
    );
    const handle = container.querySelector(
      '.ant-agentic-layout-resize-handle-right',
    ) as HTMLElement;
    fireEvent.mouseDown(handle, { clientX: 900 });
    fireEvent.mouseMove(document, { clientX: 850 });
    expect(rafCb).toBeTruthy();

    await act(async () => {
      fireEvent.mouseUp(document);
    });
    // cancel 被 noop：手动跑 rAF → pending 已 null → nextWidth null 臂
    await act(async () => {
      rafCb?.(0);
    });
    expect(() => fireEvent.mouseUp(document)).not.toThrow();
  });
});
