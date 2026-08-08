/**
 * WorkspaceTabCountDigits residual：多位数 stagger、hashId、动画 class。
 */
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceTabCountDigits } from '../WorkspaceTabCountDigits';

describe('WorkspaceTabCountDigits residual branches', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('非 test 环境：首次挂载跳过动画重置；同值不重置；变值走 rAF', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const rafQueue: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { rerender } = render(
      <WorkspaceTabCountDigits tabKey="a" value={1} prefixCls="ws" />,
    );
    expect(screen.getByLabelText('1')).toHaveClass(
      'ws-tab-count-digits--animating',
    );

    rerender(<WorkspaceTabCountDigits tabKey="a" value={1} prefixCls="ws" />);
    expect(rafQueue).toHaveLength(0);

    rerender(<WorkspaceTabCountDigits tabKey="a" value={9} prefixCls="ws" />);
    expect(rafQueue.length).toBeGreaterThanOrEqual(1);
    act(() => {
      const outer = rafQueue.shift();
      outer?.(0);
      const inner = rafQueue.shift();
      inner?.(0);
    });
    expect(screen.getByLabelText('9')).toHaveClass(
      'ws-tab-count-digits--animating',
    );
  });

  it('单位数无 animationDelay；多位数后续位有 stagger', () => {
    const { rerender } = render(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={7}
        prefixCls="ws"
        hashId="h1"
      />,
    );
    const digit0 = screen.getByTestId('workspace-tab-count-digit--files--0');
    expect(digit0.style.animationDelay).toBe('');
    expect(screen.getByLabelText('7')).toHaveClass(
      'ws-tab-count-digits--animating',
    );

    rerender(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={42}
        prefixCls="ws"
        hashId="h1"
      />,
    );
    expect(screen.getByLabelText('42')).toBeInTheDocument();
    const digit1 = screen.getByTestId('workspace-tab-count-digit--files--1');
    expect(digit1.style.animationDelay).toBe('70ms');
  });

  it('无 hashId 仍渲染；三位数字 stagger 递增', () => {
    render(
      <WorkspaceTabCountDigits tabKey="t" value={105} prefixCls="pfx" />,
    );
    expect(
      screen.getByTestId('workspace-tab-count-digit--t--2').style
        .animationDelay,
    ).toBe('140ms');
  });

  it('value=0 渲染单 digit', () => {
    render(
      <WorkspaceTabCountDigits tabKey="z" value={0} prefixCls="ws" />,
    );
    expect(screen.getByLabelText('0')).toBeInTheDocument();
  });
});
