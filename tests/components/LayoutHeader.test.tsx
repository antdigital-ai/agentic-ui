import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LayoutHeader } from '../../src/Components/LayoutHeader';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('LayoutHeader', () => {
  it('renders title', () => {
    wrap(<LayoutHeader title="标题" />);
    expect(screen.getByText('标题')).toBeInTheDocument();
  });

  it('renders default title when not provided', () => {
    wrap(<LayoutHeader />);
    expect(screen.getByText('AI 助手')).toBeInTheDocument();
  });

  it('shows share button when showShare is true', () => {
    wrap(<LayoutHeader showShare />);
    expect(screen.getByRole('button', { name: /分享/ })).toBeInTheDocument();
  });

  it('calls onShare when share button clicked', () => {
    const onShare = vi.fn();
    wrap(<LayoutHeader showShare onShare={onShare} />);
    fireEvent.click(screen.getByRole('button', { name: /分享/ }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('renders left collapse button when leftCollapsible', () => {
    wrap(<LayoutHeader leftCollapsible />);
    expect(
      screen.getByRole('button', { name: /折叠左侧边栏/ }),
    ).toBeInTheDocument();
  });

  it('toggles left collapsed when left collapse clicked', () => {
    const onLeftCollapse = vi.fn();
    wrap(
      <LayoutHeader
        leftCollapsible
        onLeftCollapse={onLeftCollapse}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /折叠左侧边栏/ }));
    expect(onLeftCollapse).toHaveBeenCalled();
    expect(onLeftCollapse.mock.calls[0][0]).toBe(true);
  });

  it('renders right collapse button when rightCollapsible', () => {
    wrap(<LayoutHeader rightCollapsible />);
    expect(
      screen.getByRole('button', { name: /折叠右侧边栏/ }),
    ).toBeInTheDocument();
  });

  it('toggles right collapsed when right collapse clicked', () => {
    const onRightCollapse = vi.fn();
    wrap(
      <LayoutHeader
        rightCollapsible
        onRightCollapse={onRightCollapse}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /折叠右侧边栏/ }));
    expect(onRightCollapse).toHaveBeenCalled();
    expect(onRightCollapse.mock.calls[0][0]).toBe(true);
  });

  it('renders leftExtra and rightExtra', () => {
    wrap(
      <LayoutHeader
        leftExtra={<span data-testid="left-extra">Left</span>}
        rightExtra={<span data-testid="right-extra">Right</span>}
      />,
    );
    expect(screen.getByTestId('left-extra')).toHaveTextContent('Left');
    expect(screen.getByTestId('right-extra')).toHaveTextContent('Right');
  });

  it('applies className', () => {
    const { container } = wrap(
      <LayoutHeader title="Test" className="custom-header" />,
    );
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
  });

  it('uses default collapsed state when uncontrolled', () => {
    wrap(
      <LayoutHeader
        leftCollapsible
        rightCollapsible
        leftDefaultCollapsed
        rightDefaultCollapsed={false}
      />,
    );
    expect(screen.getByRole('button', { name: /折叠左侧边栏/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /折叠右侧边栏/ })).toBeInTheDocument();
  });
});
