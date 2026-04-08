import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToggleButton } from '../../../src/Components/Button/ToggleButton';

describe('ToggleButton', () => {
  it('should render children, icon, and triggerIcon', () => {
    render(
      <ToggleButton
        icon={<span data-testid="icon">i</span>}
        triggerIcon={<span data-testid="trigger">t</span>}
      >
        Click Me
      </ToggleButton>,
    );
    expect(screen.getByText('Click Me')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  it('should handle click and disabled state', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ToggleButton onClick={onClick}>Test</ToggleButton>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <ToggleButton disabled onClick={onClick}>Test</ToggleButton>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply active and disabled classes', () => {
    const { container } = render(
      <ToggleButton active disabled>Test</ToggleButton>,
    );
    expect(container.querySelector('[class*="active"]')).toBeTruthy();
    expect(container.querySelector('[class*="disabled"]')).toBeTruthy();
  });

  it('should apply custom className and style', () => {
    const { container } = render(
      <ToggleButton
        className="my-toggle"
        style={{ backgroundColor: 'blue' }}
      >
        Test
      </ToggleButton>,
    );
    expect(container.querySelector('.my-toggle')).toBeTruthy();
    expect(container.querySelector('[style*="background-color"]')).toBeTruthy();
  });

  it('should render without children, icon, or triggerIcon', () => {
    render(<ToggleButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
