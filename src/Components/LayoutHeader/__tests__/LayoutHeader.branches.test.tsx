/**
 * LayoutHeader 分支覆盖：折叠、分享、受控与非受控。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from 'antd';
import { I18nContext, I18nProvide } from '../../../I18n';
import { LayoutHeader } from '../index';

const renderHeader = (ui: React.ReactElement) =>
  render(
    <ConfigProvider prefixCls="ant-agentic">
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('LayoutHeader branches', () => {
  it('leftCollapsible 点击切换折叠', async () => {
    const user = userEvent.setup();
    const onLeftCollapse = vi.fn();
    renderHeader(
      <LayoutHeader leftCollapsible onLeftCollapse={onLeftCollapse} />,
    );
    await user.click(
      screen.getByRole('button', { name: /折叠左侧|collapse/i }),
    );
    expect(onLeftCollapse).toHaveBeenCalledWith(true, false);
  });

  it('rightCollapsible 点击触发 onRightCollapse', async () => {
    const user = userEvent.setup();
    const onRightCollapse = vi.fn();
    renderHeader(
      <LayoutHeader rightCollapsible onRightCollapse={onRightCollapse} />,
    );
    await user.click(
      screen.getByRole('button', { name: /折叠右侧|collapse/i }),
    );
    expect(onRightCollapse).toHaveBeenCalledWith(true, false);
  });

  it('showShare 触发 onShare', async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();
    renderHeader(<LayoutHeader showShare onShare={onShare} />);
    await user.click(screen.getByRole('button', { name: /分享|Share/i }));
    expect(onShare).toHaveBeenCalled();
  });

  it('leftExtra / rightExtra 渲染', () => {
    renderHeader(
      <LayoutHeader
        leftExtra={<span data-testid="left-x">L</span>}
        rightExtra={<span data-testid="right-x">R</span>}
      />,
    );
    expect(screen.getByTestId('left-x')).toBeInTheDocument();
    expect(screen.getByTestId('right-x')).toBeInTheDocument();
  });

  it('受控 leftCollapsed', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [collapsed] = useState(false);
      return (
        <LayoutHeader
          leftCollapsible
          leftCollapsed={collapsed}
          onLeftCollapse={vi.fn()}
        />
      );
    };
    renderHeader(<Controlled />);
    await user.click(
      screen.getByRole('button', { name: /折叠左侧|collapse/i }),
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('leftCollapsible false 不渲染左侧折叠按钮', () => {
    renderHeader(<LayoutHeader leftCollapsible={false} />);
    expect(
      screen.queryByRole('button', { name: /折叠左侧|collapse/i }),
    ).toBeNull();
  });

  it('rightCollapsible false 不渲染右侧折叠按钮', () => {
    renderHeader(<LayoutHeader rightCollapsible={false} showShare={false} />);
    expect(
      screen.queryByRole('button', { name: /折叠右侧|collapse/i }),
    ).toBeNull();
  });

  it('locale 覆盖折叠/分享文案；leftCollapsed 切换图标；分享无 onShare', async () => {
    const user = userEvent.setup();
    renderHeader(
      <I18nContext.Provider
        value={{
          locale: {
            'chatFlow.collapseLeft': 'Fold L',
            'chatFlow.collapseRight': 'Fold R',
            'chatFlow.share': 'ShareX',
            'chatFlow.shareDialog': 'ShareDlg',
          } as any,
          language: 'en-US',
        }}
      >
        <LayoutHeader
          title="T"
          leftCollapsible
          rightCollapsible
          leftDefaultCollapsed
          showShare
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByRole('button', { name: 'Fold L' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fold R' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ShareDlg' })).toHaveTextContent(
      'ShareX',
    );
    await user.click(screen.getByRole('button', { name: 'ShareDlg' }));
    await user.click(screen.getByRole('button', { name: 'Fold L' }));
    await user.click(screen.getByRole('button', { name: 'Fold R' }));
  });
});
