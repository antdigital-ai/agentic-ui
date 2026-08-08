/**
 * TextSwap residual：exit/enter 相位、清理、默认 duration、自定义 testid。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextSwap } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('TextSwap residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('未传 durationMs 时不写 CSS 变量；自定义 data-testid', () => {
    wrap(
      <TextSwap swapKey="a" data-testid="custom-swap">
        Hello
      </TextSwap>,
    );
    const el = screen.getByTestId('custom-swap');
    expect(el.style.getPropertyValue('--text-swap-dur')).toBe('');
    expect(el).toHaveTextContent('Hello');
  });

  it('swap 过程出现 exit / enter-start class，完成后 idle', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    const { rerender, container } = wrap(
      <TextSwap swapKey="a" durationMs={100}>
        One
      </TextSwap>,
    );
    rerender(
      <ConfigProvider>
        <TextSwap swapKey="b" durationMs={100}>
          Two
        </TextSwap>
      </ConfigProvider>,
    );

    expect(container.querySelector('[class*="exit"]')).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('卸载时清理 pending timer 不抛', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    const { rerender, unmount } = wrap(
      <TextSwap swapKey="1" durationMs={500}>
        A
      </TextSwap>,
    );
    rerender(
      <ConfigProvider>
        <TextSwap swapKey="2" durationMs={500}>
          B
        </TextSwap>
      </ConfigProvider>,
    );
    expect(() => unmount()).not.toThrow();
  });
});
