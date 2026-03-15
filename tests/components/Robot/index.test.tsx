import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Robot from '../../../src/Components/Robot';

vi.mock('../../../src/Components/Robot/lotties', () => ({
  DazingLottie: ({ size }: { size?: number }) => (
    <div data-testid="dazing-lottie">Dazing {size}</div>
  ),
  ThinkingLottie: ({ size }: { size?: number }) => (
    <div data-testid="thinking-lottie">Thinking {size}</div>
  ),
}));

describe('Robot', () => {
  it('renders custom React element as icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">Custom</span>;
    render(<Robot icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('renders img when icon is string URL', () => {
    render(<Robot icon="https://example.com/robot.png" />);
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/robot.png');
  });

  it('renders ThinkingLottie when status is running and no icon', () => {
    render(<Robot status="running" size={48} />);
    expect(screen.getByTestId('thinking-lottie')).toBeInTheDocument();
    expect(screen.getByText(/Thinking 48/)).toBeInTheDocument();
  });

  it('renders DazingLottie when status is default and no icon', () => {
    render(<Robot status="default" size={42} />);
    expect(screen.getByTestId('dazing-lottie')).toBeInTheDocument();
    expect(screen.getByText(/Dazing 42/)).toBeInTheDocument();
  });

  it('renders DazingLottie when status is undefined', () => {
    render(<Robot size={40} />);
    expect(screen.getByTestId('dazing-lottie')).toBeInTheDocument();
  });

  it('applies size to wrapper when icon is not React element', () => {
    const { container } = render(<Robot size={60} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('applies className and style', () => {
    const { container } = render(
      <Robot className="my-robot" style={{ opacity: 0.8 }} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('my-robot');
    expect(wrapper).toHaveStyle({ opacity: 0.8 });
  });
});
