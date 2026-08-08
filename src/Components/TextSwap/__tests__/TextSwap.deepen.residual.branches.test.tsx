/**
 * TextSwap deepen：prefers-reduced-motion → 即时换键。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextSwap } from '../index';

describe('TextSwap deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.unstubAllGlobals();
  });

  it('reduced-motion：swapKey 变更立即切换', () => {
    const { rerender } = render(
      <ConfigProvider>
        <TextSwap swapKey="a">AAA</TextSwap>
      </ConfigProvider>,
    );
    expect(screen.getByText('AAA')).toBeInTheDocument();
    act(() => {
      rerender(
        <ConfigProvider>
          <TextSwap swapKey="b">BBB</TextSwap>
        </ConfigProvider>,
      );
    });
    expect(screen.getByText('BBB')).toBeInTheDocument();
  });
});
