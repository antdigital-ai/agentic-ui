/**
 * WorkspaceTabCountDigits deepen：非 test 环境同值早退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceTabCountDigits } from '../WorkspaceTabCountDigits';

describe('WorkspaceTabCountDigits deepen residual branches', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = originalEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('相同 value 二次渲染走 serialized 相等早退', () => {
    const { rerender } = render(
      <WorkspaceTabCountDigits tabKey="t" value={12} prefixCls="ws" />,
    );
    expect(screen.getByTestId('workspace-tab-count-digits--t')).toHaveAttribute(
      'aria-label',
      '12',
    );
    act(() => {
      rerender(
        <WorkspaceTabCountDigits tabKey="t" value={12} prefixCls="ws" />,
      );
    });
    expect(
      screen.getByTestId('workspace-tab-count-digits--t'),
    ).toBeInTheDocument();
  });
});
