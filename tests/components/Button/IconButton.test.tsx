import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../../../src/Components/Button/IconButton';

describe('IconButton', () => {
  it('should render with default props', () => {
    render(<IconButton icon={<span>icon</span>} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render icon content', () => {
    render(
      <IconButton icon={<span data-testid="test-icon">icon</span>} />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<IconButton icon={<span>icon</span>} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onClick = vi.fn();
    render(
      <IconButton icon={<span>icon</span>} disabled onClick={onClick} />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply active class when active', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} active />,
    );
    const buttonEl = container.querySelector('[class*="active"]');
    expect(buttonEl).toBeTruthy();
  });

  it('should apply elevated class when elevated', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} elevated />,
    );
    const buttonEl = container.querySelector('[class*="elevated"]');
    expect(buttonEl).toBeTruthy();
  });

  it('should apply sm size class', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} size="sm" />,
    );
    const buttonEl = container.querySelector('[class*="sm"]');
    expect(buttonEl).toBeTruthy();
  });

  it('should apply xs size class', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} size="xs" />,
    );
    const buttonEl = container.querySelector('[class*="xs"]');
    expect(buttonEl).toBeTruthy();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <IconButton icon={<span>icon</span>} className="my-button" />,
    );
    expect(container.querySelector('.my-button')).toBeTruthy();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <IconButton
        icon={<span>icon</span>}
        style={{ marginTop: '10px' }}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });

  it('should support isLoading prop', () => {
    render(<IconButton icon={<span>icon</span>} isLoading />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('loading');
  });

  it('should support legacy loading prop', () => {
    render(<IconButton icon={<span>icon</span>} loading />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('loading');
  });

  it('should prefer isLoading over legacy loading', () => {
    render(
      <IconButton icon={<span>icon</span>} isLoading={false} loading={true} />,
    );
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('loading');
  });

  it('should render with tooltip', () => {
    render(<IconButton icon={<span>icon</span>} tooltip="Click me" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
