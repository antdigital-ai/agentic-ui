import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PeekLottie } from '../../../src/Components/Robot/lotties/PeekLottie';

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

describe('PeekLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<PeekLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with custom size', () => {
    render(<PeekLottie size={64} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should render with default size of 32', () => {
    render(<PeekLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('should render with custom className', () => {
    render(<PeekLottie className="custom-peek" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveClass('custom-peek');
  });

  it('should render with custom style', () => {
    render(<PeekLottie style={{ border: '1px solid red' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ border: '1px solid red' });
  });

  it('should render with autoplay disabled', () => {
    render(<PeekLottie autoplay={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with loop disabled', () => {
    render(<PeekLottie loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
  });

  it('should merge custom style with container style', () => {
    render(<PeekLottie size={48} style={{ backgroundColor: 'blue' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px', display: 'flex' });
    const styleAttr = el.getAttribute('style');
    expect(styleAttr).toContain('background-color: blue');
  });
});
