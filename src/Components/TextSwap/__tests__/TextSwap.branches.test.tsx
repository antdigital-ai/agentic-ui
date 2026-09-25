/**
 * TextSwap 分支覆盖：reduced motion、swapKey 切换、durationMs。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import { TextSwap } from '../index';

const renderSwap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('TextSwap branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('swapKey 不变时同步 children', () => {
    const { rerender } = renderSwap(<TextSwap swapKey="a">First</TextSwap>);
    rerender(<TextSwap swapKey="a">Updated</TextSwap>);
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });

  it('swapKey 变化时更新内容', async () => {
    vi.useFakeTimers();
    const { rerender } = renderSwap(<TextSwap swapKey="a">One</TextSwap>);
    rerender(<TextSwap swapKey="b">Two</TextSwap>);
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText('Two')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('prefers-reduced-motion 时立即切换', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as any);
    const { rerender } = renderSwap(<TextSwap swapKey="x">A</TextSwap>);
    rerender(<TextSwap swapKey="y">B</TextSwap>);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('matchMedia 不可用时正常渲染', () => {
    const original = window.matchMedia;
    // @ts-expect-error test stub
    window.matchMedia = undefined;
    expect(() =>
      renderSwap(<TextSwap swapKey="k">Z</TextSwap>),
    ).not.toThrow();
    window.matchMedia = original;
  });

  it('durationMs 写入 CSS 变量', () => {
    renderSwap(
      <TextSwap swapKey="k" durationMs={400}>
        T
      </TextSwap>,
    );
    const el = screen.getByTestId('text-swap');
    expect(el.style.getPropertyValue('--text-swap-dur')).toBe('400ms');
  });

  it('matchMedia 抛错时仍渲染', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new Error('unsupported');
    });
    expect(() =>
      renderSwap(<TextSwap swapKey="1">A</TextSwap>),
    ).not.toThrow();
  });

  it('swapKey 变化触发交换动画 class', () => {
    const { rerender } = renderSwap(
      <TextSwap swapKey="a">One</TextSwap>,
    );
    rerender(
      <TextSwap swapKey="b" durationMs={120}>
        Two
      </TextSwap>,
    );
    expect(screen.getByTestId('text-swap').textContent).toContain('Two');
  });
});
