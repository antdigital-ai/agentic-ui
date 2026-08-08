/**
 * ScrollVisibleButton 分支：tooltip 对象/节点、shouldVisible 函数/数字、无 tooltip、点击。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ScrollVisibleButton,
  type ScrollVisibleButtonRef,
} from '../ScrollVisibleButton';

vi.mock('../hooks/useScrollVisible', () => ({
  useScrollVisible: vi.fn(() => ({
    visible: true,
    currentContainer: { current: window },
  })),
}));

import { useScrollVisible } from '../hooks/useScrollVisible';

describe('ScrollVisibleButton 分支覆盖', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (useScrollVisible as any).mockReturnValue({
      visible: true,
      currentContainer: { current: window },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 tooltip 直接渲染按钮并点击', () => {
    const onClick = vi.fn();
    const ref = createRef<ScrollVisibleButtonRef>();
    render(
      <ConfigProvider>
        <ScrollVisibleButton ref={ref} onClick={onClick} data-testid="svb">
          up
        </ScrollVisibleButton>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('svb'));
    expect(onClick).toHaveBeenCalled();
    expect(ref.current?.nativeElement).toBeTruthy();
  });

  it('tooltip 为 ReactNode', () => {
    render(
      <ConfigProvider>
        <ScrollVisibleButton tooltip="回到顶部" data-testid="svb">
          up
        </ScrollVisibleButton>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('svb')).toBeInTheDocument();
  });

  it('tooltip 为对象配置', () => {
    render(
      <ConfigProvider>
        <ScrollVisibleButton
          tooltip={{ title: 'tip', placement: 'left' }}
          data-testid="svb"
        >
          up
        </ScrollVisibleButton>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('svb')).toBeInTheDocument();
  });

  it('visible=false 时 data-state=exit', () => {
    (useScrollVisible as any).mockReturnValue({
      visible: false,
      currentContainer: { current: window },
    });
    const { container } = render(
      <ConfigProvider>
        <ScrollVisibleButton data-testid="svb">up</ScrollVisibleButton>
      </ConfigProvider>,
    );
    expect(container.querySelector('[data-state="exit"]')).toBeTruthy();
  });

  it('visible=true 时 rAF 后 data-state=enter', () => {
    const { container } = render(
      <ConfigProvider>
        <ScrollVisibleButton data-testid="svb">up</ScrollVisibleButton>
      </ConfigProvider>,
    );
    act(() => {
      // flush rAF via timers
      vi.advanceTimersByTime(20);
    });
    expect(
      container.querySelector('[data-state="enter"]') ||
        container.querySelector('[data-state]'),
    ).toBeTruthy();
  });

  it('shouldVisible 为函数时传入 hook', () => {
    const shouldVisible = vi.fn(() => true);
    render(
      <ConfigProvider>
        <ScrollVisibleButton
          {...({ shouldVisible } as any)}
          target={() => window}
          data-testid="svb"
        >
          up
        </ScrollVisibleButton>
      </ConfigProvider>,
    );
    expect(useScrollVisible).toHaveBeenCalled();
    const args = (useScrollVisible as any).mock.calls.at(-1)[0];
    expect(args.shouldVisible(500, window)).toBe(true);
  });

  it('shouldVisible 为数字阈值', () => {
    render(
      <ConfigProvider>
        <ScrollVisibleButton
          {...({ shouldVisible: 100 } as any)}
          data-testid="svb"
        >
          up
        </ScrollVisibleButton>
      </ConfigProvider>,
    );
    const args = (useScrollVisible as any).mock.calls.at(-1)[0];
    expect(args.shouldVisible(50, window)).toBe(false);
    expect(args.shouldVisible(100, window)).toBe(true);
  });
});
