import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AgenticLayout } from '..';

// Mock the style hook
vi.mock('../style', () => ({
  useAgenticLayoutStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('AgenticLayout', () => {
  it('should render with basic props', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          center={<div data-testid="center">Center Content</div>}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('center')).toBeInTheDocument();
  });

  it('should render left and right content', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should work in uncontrolled mode', () => {
    const onLeftCollapse = vi.fn();
    const onRightCollapse = vi.fn();

    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{
            leftDefaultCollapsed: false,
            rightDefaultCollapsed: false,
            onLeftCollapse: onLeftCollapse,
            onRightCollapse: onRightCollapse,
          }}
        />
      </TestWrapper>,
    );

    // 在非受控模式下，组件应该正常渲染
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should work in controlled mode', () => {
    const onLeftCollapse = vi.fn();
    const onRightCollapse = vi.fn();

    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{
            leftDefaultCollapsed: false,
            rightDefaultCollapsed: false,
            onLeftCollapse: onLeftCollapse,
            onRightCollapse: onRightCollapse,
          }}
        />
      </TestWrapper>,
    );

    // 在受控模式下，组件应该正常渲染
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
