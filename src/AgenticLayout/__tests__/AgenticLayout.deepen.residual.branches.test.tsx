/**
 * AgenticLayout deepen：mousemove 未拖拽早退、RTL 拖拽、视口 resize clamp。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AGENTIC_LAYOUT_TEST_ID, AgenticLayout } from '../index';

describe('AgenticLayout deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('mousemove 未开始拖拽时 onMove 早退', () => {
    render(
      <ConfigProvider>
        <AgenticLayout
          center={<div>C</div>}
          right={<div>R</div>}
          rightWidth={420}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
    expect(() =>
      fireEvent.mouseMove(document, { clientX: 100 }),
    ).not.toThrow();
  });

  it('拖拽 mouseup 后再 mousemove 早退；RTL 拖拽可调宽', async () => {
    const { container } = render(
      <ConfigProvider direction="rtl">
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
    expect(handle).toBeTruthy();

    fireEvent.mouseDown(handle, { clientX: 800 });
    await act(async () => {
      fireEvent.mouseMove(document, { clientX: 860 });
      vi.advanceTimersByTime(32);
    });
    fireEvent.mouseUp(document);
    expect(() =>
      fireEvent.mouseMove(document, { clientX: 900 }),
    ).not.toThrow();
  });

  it('视口缩小后 clamp 超宽右栏', async () => {
    const original = window.innerWidth;
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
          rightWidth={1200}
        />
      </ConfigProvider>,
    );
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 800,
    });
    await act(async () => {
      fireEvent.resize(window);
    });
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: original,
    });
  });
});
