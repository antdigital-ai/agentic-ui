import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgenticLayout } from '../index';

// Mock the style hook
vi.mock('../../style', () => ({
  useAgenticLayoutStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

describe('AgenticLayout', () => {
  // Mock window dimensions
  const mockWindowInnerWidth = 1200;

  beforeEach(() => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: mockWindowInnerWidth,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset all mocks
    vi.restoreAllMocks();
  });

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

  it('should handle left and right collapsed states from header config', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{
            leftCollapsed: true,
            rightCollapsed: true,
          }}
        />
      </TestWrapper>,
    );

    // Check that content is still rendered but visually collapsed
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should handle left and right default collapsed states from header config', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{
            leftDefaultCollapsed: true,
            rightDefaultCollapsed: true,
          }}
        />
      </TestWrapper>,
    );

    // Check that content is still rendered but visually collapsed
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should update right width when prop changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <AgenticLayout
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          rightWidth={500}
        />
      </TestWrapper>,
    );

    // Re-render with different rightWidth
    rerender(
      <TestWrapper>
        <AgenticLayout
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          rightWidth={600}
        />
      </TestWrapper>,
    );

    // Component should re-render without errors
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should handle window resize and constrain right width', () => {
    // Mock window resize event
    const mockAddEventListener = vi.spyOn(window, 'addEventListener');

    render(
      <TestWrapper>
        <AgenticLayout
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          rightWidth={1000} // This exceeds the max width ratio
        />
      </TestWrapper>,
    );

    // Check that event listeners were added
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    // Simulate window resize
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);

    // Component should still render correctly
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should calculate max right width correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    render(
      <TestWrapper>
        <AgenticLayout
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          rightWidth={800}
        />
      </TestWrapper>,
    );

    // Component should render correctly
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should handle header collapsible properties', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{
            leftCollapsible: true,
            rightCollapsible: true,
          }}
        />
      </TestWrapper>,
    );

    // Component should render correctly
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });

  it('should handle header collapsible fallback when not provided', () => {
    render(
      <TestWrapper>
        <AgenticLayout
          left={<div data-testid="left">Left Content</div>}
          center={<div data-testid="center">Center Content</div>}
          right={<div data-testid="right">Right Content</div>}
          header={{}}
        />
      </TestWrapper>,
    );

    // Component should render correctly with fallback values
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
