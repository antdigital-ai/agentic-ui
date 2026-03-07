import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BouncingLottie } from '../../../src/Components/Robot/lotties/BouncingLottie';

vi.mock('lottie-react', () => ({
  default: ({
    animationData,
    loop,
    autoplay,
    style,
    className,
    ...props
  }: any) => (
    <div
      data-testid="lottie-animation"
      data-loop={loop}
      data-autoplay={autoplay}
      data-animation={animationData ? 'loaded' : 'empty'}
      style={style}
      className={className}
      {...props}
    >
      Lottie Animation
    </div>
  ),
}));

describe('BouncingLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<BouncingLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with default size of 32', () => {
    render(<BouncingLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('should render with custom size', () => {
    render(<BouncingLottie size={80} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '80px', height: '80px' });
  });

  it('should render with custom className', () => {
    render(<BouncingLottie className="custom-bouncing" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveClass('custom-bouncing');
  });

  it('should render with custom style', () => {
    render(<BouncingLottie style={{ margin: '10px' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ margin: '10px' });
  });

  it('should render with autoplay disabled', () => {
    render(<BouncingLottie autoplay={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with loop disabled', () => {
    render(<BouncingLottie loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
  });

  it('should render with all props combined', () => {
    render(
      <BouncingLottie
        size={100}
        className="test"
        style={{ padding: '5px' }}
        autoplay={false}
        loop={false}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveClass('test');
    expect(el).toHaveStyle({ width: '100px', height: '100px' });
  });
});
