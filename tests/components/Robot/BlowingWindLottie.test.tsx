import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BlowingWindLottie } from '../../../src/Components/Robot/lotties/BlowingWindLottie';

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

describe('BlowingWindLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<BlowingWindLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with default size of 32', () => {
    render(<BlowingWindLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('should render with custom size', () => {
    render(<BlowingWindLottie size={48} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('should render with custom className', () => {
    render(<BlowingWindLottie className="custom-wind" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveClass('custom-wind');
  });

  it('should render with custom style', () => {
    render(<BlowingWindLottie style={{ opacity: 0.5 }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ opacity: '0.5' });
  });

  it('should render with autoplay disabled', () => {
    render(<BlowingWindLottie autoplay={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with loop disabled', () => {
    render(<BlowingWindLottie loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
  });

  it('should render with size 0', () => {
    render(<BlowingWindLottie size={0} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '0px', height: '0px' });
  });
});
