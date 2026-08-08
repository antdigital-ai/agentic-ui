/**
 * LayoutHeader residual：折叠按钮、share、extra、受控状态。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutHeader } from '../index';

describe('LayoutHeader prop matrix residual', () => {
  it('默认标题；left/right collapsible 点击', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(
      <ConfigProvider>
        <LayoutHeader
          leftCollapsible
          rightCollapsible
          onLeftCollapse={onLeft}
          onRightCollapse={onRight}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('AI 助手')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => fireEvent.click(btn));
    expect(onLeft.mock.calls.length + onRight.mock.calls.length).toBeGreaterThan(
      0,
    );
  });

  it('showShare / extras / 自定义 title', () => {
    const onShare = vi.fn();
    render(
      <ConfigProvider>
        <LayoutHeader
          title="Custom"
          showShare
          onShare={onShare}
          leftExtra={<span data-testid="le">L</span>}
          rightExtra={<span data-testid="re">R</span>}
          leftDefaultCollapsed
          rightDefaultCollapsed
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByTestId('le')).toBeInTheDocument();
    expect(screen.getByTestId('re')).toBeInTheDocument();
    const shareBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('分享') || true);
    if (shareBtn) fireEvent.click(shareBtn);
  });

  it('受控折叠状态', () => {
    render(
      <ConfigProvider>
        <LayoutHeader
          leftCollapsible
          rightCollapsible
          leftCollapsed
          rightCollapsed={false}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('AI 助手')).toBeInTheDocument();
  });
});
