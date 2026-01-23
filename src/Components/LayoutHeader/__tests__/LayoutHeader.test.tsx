import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock I18nContext
vi.mock('../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      'chatFlow.collapseLeft': '折叠左侧边栏',
      'chatFlow.collapseRight': '折叠右侧边栏',
      'chatFlow.share': '分享',
      'chatFlow.shareDialog': '分享对话',
    },
  }),
}));

import { LayoutHeader } from '../index';

describe('LayoutHeader', () => {
  it('renders with default props', () => {
    render(
      <LayoutHeader
        leftCollapsible={true}
        showShare={true}
      />,
    );

    expect(screen.getByText('AI 助手')).toBeInTheDocument();
    expect(screen.getByLabelText('折叠左侧边栏')).toBeInTheDocument();
    expect(screen.getByText('分享')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<LayoutHeader title="自定义标题" />);

    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });

  it('handles left collapse click', () => {
    const onLeftCollapse = vi.fn();
    render(
      <LayoutHeader
        leftCollapsible={true}
        onLeftCollapse={onLeftCollapse}
      />,
    );

    fireEvent.click(screen.getByLabelText('折叠左侧边栏'));
    expect(onLeftCollapse).toHaveBeenCalledWith(true, false);
  });

  it('handles right collapse click', () => {
    const onRightCollapse = vi.fn();
    render(
      <LayoutHeader
        rightCollapsible={true}
        onRightCollapse={onRightCollapse}
      />,
    );

    fireEvent.click(screen.getByLabelText('折叠右侧边栏'));
    expect(onRightCollapse).toHaveBeenCalledWith(true, false);
  });

  it('handles share click', () => {
    const onShare = vi.fn();
    render(
      <LayoutHeader
        showShare={true}
        onShare={onShare}
      />,
    );

    fireEvent.click(screen.getByText('分享'));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('renders custom left extra content', () => {
    render(
      <LayoutHeader leftExtra={<div data-testid="left-extra">左侧内容</div>} />,
    );

    expect(screen.getByTestId('left-extra')).toBeInTheDocument();
  });

  it('renders custom right extra content', () => {
    render(
      <LayoutHeader
        rightExtra={<div data-testid="right-extra">右侧内容</div>}
      />,
    );

    expect(screen.getByTestId('right-extra')).toBeInTheDocument();
  });

  it('respects showShare prop', () => {
    render(<LayoutHeader showShare={false} />);

    expect(screen.queryByText('分享')).not.toBeInTheDocument();
  });

  it('supports controlled mode for left collapse', () => {
    const onLeftCollapse = vi.fn();
    render(
      <LayoutHeader
        leftCollapsible={true}
        leftCollapsed={true}
        onLeftCollapse={onLeftCollapse}
      />,
    );

    fireEvent.click(screen.getByLabelText('折叠左侧边栏'));
    expect(onLeftCollapse).toHaveBeenCalledWith(false, true);
  });

  it('supports controlled mode for right collapse', () => {
    const onRightCollapse = vi.fn();
    render(
      <LayoutHeader
        rightCollapsed={true}
        rightCollapsible={true}
        onRightCollapse={onRightCollapse}
      />,
    );

    fireEvent.click(screen.getByLabelText('折叠右侧边栏'));
    expect(onRightCollapse).toHaveBeenCalledWith(false, true);
  });

  it('supports uncontrolled mode with default values', () => {
    const onLeftCollapse = vi.fn();
    const onRightCollapse = vi.fn();
    render(
      <LayoutHeader
        leftCollapsible={true}
        leftDefaultCollapsed={true}
        rightDefaultCollapsed={false}
        onLeftCollapse={onLeftCollapse}
        onRightCollapse={onRightCollapse}
        rightCollapsible={true}
      />,
    );

    // 点击左侧折叠按钮，应该从 true 变为 false
    fireEvent.click(screen.getByLabelText('折叠左侧边栏'));
    expect(onLeftCollapse).toHaveBeenCalledWith(false, true);

    // 点击右侧折叠按钮，应该从 false 变为 true
    fireEvent.click(screen.getByLabelText('折叠右侧边栏'));
    expect(onRightCollapse).toHaveBeenCalledWith(true, false);
  });

  it('applies custom className', () => {
    const { container } = render(<LayoutHeader className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('ant-layout-header');
  });
});
