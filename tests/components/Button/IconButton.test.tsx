import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../../../src/Components/Button/IconButton';

describe('IconButton', () => {
  it('should render icon and handle click', () => {
    const onClick = vi.fn();
    render(
      <IconButton
        icon={<span data-testid="test-icon">icon</span>}
        onClick={onClick}
      />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<IconButton icon={<span>icon</span>} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply active, elevated, size classes', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} active elevated size="sm" />,
    );
    expect(container.querySelector('[class*="active"]')).toBeTruthy();
    expect(container.querySelector('[class*="elevated"]')).toBeTruthy();
    expect(container.querySelector('[class*="sm"]')).toBeTruthy();
  });

  it('should apply xs size class', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} size="xs" />,
    );
    expect(container.querySelector('[class*="xs"]')).toBeTruthy();
  });

  it('should apply custom className and style', () => {
    const { container } = render(
      <IconButton
        icon={<span>icon</span>}
        className="my-btn"
        style={{ marginTop: '10px' }}
      />,
    );
    expect(container.querySelector('.my-btn')).toBeTruthy();
    expect(container.firstChild as HTMLElement).toHaveStyle({ marginTop: '10px' });
  });

  it('should prefer isLoading over legacy loading prop', () => {
    const { rerender } = render(
      <IconButton icon={<span>icon</span>} isLoading />,
    );
    expect(screen.getByRole('button').className).toContain('loading');

    rerender(
      <IconButton icon={<span>icon</span>} isLoading={false} loading={true} />,
    );
    expect(screen.getByRole('button').className).not.toContain('loading');
  });
});
