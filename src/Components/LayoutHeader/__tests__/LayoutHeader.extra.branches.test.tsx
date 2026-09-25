import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../I18n';
import { LayoutHeader } from '../index';

const renderHeader = (ui: React.ReactElement) =>
  render(
    <ConfigProvider prefixCls="ant-agentic">
      <I18nProvide>{ui}</I18nProvide>
    </ConfigProvider>,
  );

describe('LayoutHeader 额外分支', () => {
  it('默认 title；leftCollapsible=false 时点击不切换', async () => {
    const onLeft = vi.fn();
    renderHeader(
      <LayoutHeader title="T" leftCollapsible={false} onLeftCollapse={onLeft} />,
    );
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('leftDefaultCollapsed 初始折叠图标', () => {
    renderHeader(
      <LayoutHeader leftCollapsible leftDefaultCollapsed />,
    );
    expect(
      screen.getByRole('button', { name: /折叠左侧|collapse/i }),
    ).toBeInTheDocument();
  });

  it('showShare 无 onShare 不抛错', async () => {
    const user = userEvent.setup();
    renderHeader(<LayoutHeader showShare />);
    await user.click(screen.getByRole('button', { name: /分享|Share/i }));
  });

  it('rightDefaultCollapsed + className', () => {
    const { container } = renderHeader(
      <LayoutHeader
        rightCollapsible
        rightDefaultCollapsed
        className="hdr-extra"
      />,
    );
    expect(container.querySelector('.hdr-extra')).toBeTruthy();
  });
});
