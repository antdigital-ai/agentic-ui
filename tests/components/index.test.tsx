import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// 简单的组件测试
describe('Component Tests', () => {
  afterEach(() => {
    cleanup();
  });
  it('should render a simple div', () => {
    render(<div data-testid="test-div">Test Content</div>);
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render a button with click handler', () => {
    const handleClick = vi.fn();
    render(<button onClick={handleClick}>Click me</button>);

    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('should render with custom className', () => {
    render(<div className="custom-class">Content</div>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('custom-class');
  });

  it('should render with custom style', () => {
    render(<div style={{ color: 'red' }}>Content</div>);
    const element = screen.getByText('Content');
    expect(element).toHaveStyle('color: rgb(255, 0, 0)');
  });

  it('should render nested components', () => {
    render(
      <div>
        <span>Nested</span>
        <p>Content</p>
      </div>,
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
