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
  it('should render with default props', () => {
    render(<SwitchButton>Toggle</SwitchButton>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render children text', () => {
    render(<SwitchButton>Toggle Me</SwitchButton>);
    expect(screen.getByText('Toggle Me')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <SwitchButton icon={<span data-testid="custom-icon">icon</span>}>
        Test
      </SwitchButton>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render custom triggerIcon', () => {
    render(
      <SwitchButton
        triggerIcon={<span data-testid="custom-trigger">trigger</span>}
      >
        Test
      </SwitchButton>,
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('should render default ChevronDown when inactive', () => {
    render(<SwitchButton>Test</SwitchButton>);
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('should render ChevronUp when active', () => {
    render(<SwitchButton active={true}>Test</SwitchButton>);
    expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
  });

  it('should toggle uncontrolled state on click', () => {
    const onChange = vi.fn();
    render(<SwitchButton onChange={onChange}>Test</SwitchButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should not toggle when disabled', () => {
    const onChange = vi.fn();
    render(
      <SwitchButton disabled onChange={onChange}>
        Test
      </SwitchButton>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should support controlled mode', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SwitchButton active={false} onChange={onChange}>
        Test
      </SwitchButton>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <SwitchButton active={true} onChange={onChange}>
        Test
      </SwitchButton>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onClick handler', async () => {
    const onClick = vi.fn();
    render(<SwitchButton onClick={onClick}>Test</SwitchButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<SwitchButton className="custom-class">Test</SwitchButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('should apply custom style', () => {
    render(<SwitchButton style={{ color: 'red' }}>Test</SwitchButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('should support defaultActive prop', () => {
    render(<SwitchButton defaultActive={true}>Test</SwitchButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should render without children or icon', () => {
    render(<SwitchButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
