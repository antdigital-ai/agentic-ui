import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToggleButton } from '../../../src/Components/Button/ToggleButton';

describe('ToggleButton', () => {
  it('should render with default props', () => {
    render(<ToggleButton>Toggle</ToggleButton>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render children text', () => {
    render(<ToggleButton>Click Me</ToggleButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <ToggleButton icon={<span data-testid="toggle-icon">icon</span>}>
        Test
      </ToggleButton>,
    );
    expect(screen.getByTestId('toggle-icon')).toBeInTheDocument();
  });

  it('should render triggerIcon when provided', () => {
    render(
      <ToggleButton
        triggerIcon={<span data-testid="trigger-icon">trigger</span>}
      >
        Test
      </ToggleButton>,
    );
    expect(screen.getByTestId('trigger-icon')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<ToggleButton onClick={onClick}>Test</ToggleButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onClick = vi.fn();
    render(
      <ToggleButton disabled onClick={onClick}>
        Test
      </ToggleButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply active class', () => {
    const { container } = render(<ToggleButton active>Test</ToggleButton>);
    const activeEl = container.querySelector('[class*="active"]');
    expect(activeEl).toBeTruthy();
  });

  it('should apply disabled class', () => {
    const { container } = render(<ToggleButton disabled>Test</ToggleButton>);
    const disabledEl = container.querySelector('[class*="disabled"]');
    expect(disabledEl).toBeTruthy();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ToggleButton className="my-toggle">Test</ToggleButton>,
    );
    expect(container.querySelector('.my-toggle')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <ToggleButton style={{ backgroundColor: 'blue' }}>Test</ToggleButton>,
    );
    const styledDiv = container.querySelector('[style*="background-color"]');
    expect(styledDiv).toBeTruthy();
  });

  it('should render without children, icon, or triggerIcon', () => {
    render(<ToggleButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should not render icon span when icon is not provided', () => {
    const { container } = render(<ToggleButton>Test</ToggleButton>);
    const iconSpan = container.querySelector('[class*="icon"]');
    expect(iconSpan).toBeFalsy();
  });

  it('should not render trigger-icon span when triggerIcon is not provided', () => {
    const { container } = render(<ToggleButton>Test</ToggleButton>);
    const triggerSpan = container.querySelector('[class*="trigger-icon"]');
    expect(triggerSpan).toBeFalsy();
  });
});
