/**
 * SkillModeBar residual：open 切换 exit、className/style、无 title。
 * Timers: shouldAdvanceTime + clearAllTimers（afterEach 不用 useRealTimers）。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillModeBar } from '../index';

describe('SkillModeBar residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('open true→false 后卸载（test 环境 duration=0）', () => {
    const { rerender } = render(
      <ConfigProvider>
        <SkillModeBar
          skillMode={{
            open: true,
            title: 'S',
            className: 'sm-x',
            style: { color: 'red' },
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('skill-mode-bar')).toBeTruthy();
    rerender(
      <ConfigProvider>
        <SkillModeBar skillMode={{ open: false, title: 'S' }} />
      </ConfigProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.queryByTestId('skill-mode-bar')).toBeNull();
  });

  it('无 title 仍可关闭；rightContent 数组；closable divider', () => {
    const onSkillModeOpenChange = vi.fn();
    render(
      <ConfigProvider>
        <SkillModeBar
          skillMode={{
            open: true,
            rightContent: [<span key="a">R</span>],
            closable: true,
          }}
          onSkillModeOpenChange={onSkillModeOpenChange}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('skill-mode-close'));
    expect(onSkillModeOpenChange).toHaveBeenCalled();
    expect(screen.getByText('R')).toBeTruthy();
  });

  it('rightContent 单节点；closable false 无关闭钮', () => {
    render(
      <ConfigProvider>
        <SkillModeBar
          skillMode={{
            open: true,
            title: 'Solo',
            rightContent: <em>one</em>,
            closable: false,
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('one')).toBeTruthy();
    expect(screen.queryByTestId('skill-mode-close')).toBeNull();
  });
});
