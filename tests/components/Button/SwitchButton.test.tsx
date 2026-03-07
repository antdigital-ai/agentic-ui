import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SwitchButton } from '../../../src/Components/Button/SwitchButton';

vi.mock('@sofa-design/icons', () => ({
  ChevronDown: () => <span data-testid="chevron-down">down</span>,
  ChevronUp: () => <span data-testid="chevron-up">up</span>,
}));

describe('SwitchButton', () => {
  it('should render with children, icon, and default trigger icon', () => {
    render(
      <SwitchButton icon={<span data-testid="icon">i</span>}>
        Toggle
      </SwitchButton>,
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render custom triggerIcon and ChevronUp when active', () => {
    const { rerender } = render(
      <SwitchButton active={true}>Test</SwitchButton>,
    );
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();

    rerender(
      <SwitchButton
        triggerIcon={<span data-testid="custom-trigger">t</span>}
      >
        Test
      </SwitchButton>,
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('should toggle uncontrolled state and call onChange/onClick', () => {
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <SwitchButton onChange={onChange} onClick={onClick}>
        Test
      </SwitchButton>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should not toggle when disabled', () => {
    const onChange = vi.fn();
    render(
      <SwitchButton disabled onChange={onChange}>Test</SwitchButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should support controlled mode via active prop', () => {
    const { rerender } = render(
      <SwitchButton active={false}>Test</SwitchButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<SwitchButton active={true}>Test</SwitchButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should support defaultActive prop', () => {
    render(<SwitchButton defaultActive={true}>Test</SwitchButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should apply custom className and style', () => {
    render(
      <SwitchButton className="custom" style={{ color: 'red' }}>
        Test
      </SwitchButton>,
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom');
    expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
