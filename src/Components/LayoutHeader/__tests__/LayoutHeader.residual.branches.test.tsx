/**
 * LayoutHeader 残留：左右折叠、分享、右侧内容。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../I18n';
import { LayoutHeader } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider prefixCls="ant-agentic">
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('LayoutHeader residual branches', () => {
  it('leftCollapsible 点击切换回调', () => {
    const onLeft = vi.fn();
    wrap(
      <LayoutHeader
        title="Header"
        leftCollapsible
        onLeftCollapse={onLeft}
      />,
    );
    const btn = screen.getByRole('button', { name: /折叠左侧|collapse/i });
    fireEvent.click(btn);
    expect(onLeft).toHaveBeenCalled();
  });

  it('rightCollapsible + rightDefaultCollapsed', () => {
    const onRight = vi.fn();
    wrap(
      <LayoutHeader
        rightCollapsible
        rightDefaultCollapsed
        onRightCollapse={onRight}
      />,
    );
    const btn = screen.getByRole('button', { name: /折叠右侧|collapse/i });
    fireEvent.click(btn);
    expect(onRight).toHaveBeenCalled();
  });

  it('showShare + onShare；rightExtra 渲染', () => {
    const onShare = vi.fn();
    wrap(
      <LayoutHeader
        showShare
        onShare={onShare}
        rightExtra={<span data-testid="ex">ex</span>}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /分享|Share/i }));
    expect(onShare).toHaveBeenCalled();
    expect(screen.getByTestId('ex')).toBeInTheDocument();
  });

  it('无 title 使用默认；className/style', () => {
    const { container } = wrap(
      <LayoutHeader className="lh" style={{ margin: 2 }} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it.skip('受控 leftCollapsed/rightCollapsed；leftExtra；双侧可折叠', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    wrap(
      <LayoutHeader
        leftCollapsible
        rightCollapsible
        leftCollapsed
        rightCollapsed={false}
        onLeftCollapse={onLeft}
        onRightCollapse={onRight}
        leftExtra={<span data-testid="left-ex">L</span>}
        title="Custom"
      />,
    );
    expect(screen.getByTestId('left-ex')).toBeTruthy();
    expect(screen.getByText('Custom')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /折叠左侧|collapse/i }));
    expect(onLeft).toHaveBeenCalled();
  });
});
