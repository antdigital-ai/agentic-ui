import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { WorkspaceTabCountDigits } from '../WorkspaceTabCountDigits';

describe('WorkspaceTabCountDigits 分支覆盖', () => {
  it('渲染数字并给非首位 digit 加 animationDelay', () => {
    render(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={12}
        prefixCls="ws"
        hashId="h"
      />,
    );
    expect(
      screen.getByTestId('workspace-tab-count-digits--files'),
    ).toHaveAttribute('aria-label', '12');
    const d0 = screen.getByTestId('workspace-tab-count-digit--files--0');
    const d1 = screen.getByTestId('workspace-tab-count-digit--files--1');
    expect(d0.style.animationDelay).toBe('');
    expect(d1.style.animationDelay).toBe('70ms');
  });

  it('value 变化时 test 环境跳过动画重置仍更新文本', () => {
    const { rerender } = render(
      <WorkspaceTabCountDigits tabKey="t" value={1} prefixCls="ws" />,
    );
    expect(screen.getByLabelText('1')).toBeTruthy();
    rerender(<WorkspaceTabCountDigits tabKey="t" value={2} prefixCls="ws" />);
    expect(screen.getByLabelText('2')).toBeTruthy();
    rerender(<WorkspaceTabCountDigits tabKey="t" value={2} prefixCls="ws" />);
    expect(screen.getByLabelText('2')).toBeTruthy();
  });

  it('无 hashId 时仍渲染 animating class', () => {
    const { container } = render(
      <WorkspaceTabCountDigits tabKey="k" value={3} prefixCls="ws" />,
    );
    expect(
      container.querySelector('.ws-tab-count-digits--animating'),
    ).toBeTruthy();
  });
});
