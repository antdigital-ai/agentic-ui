import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThinkingLottie } from '../../../../src/Components/Robot/lotties/ThinkingLottie';

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

describe('ThinkingLottie', () => {
  it('renders with default props (autoplay, loop, size=32)', () => {
    render(<ThinkingLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies custom size, className, style', () => {
    render(
      <ThinkingLottie
        size={48}
        className="custom-thinking"
        style={{ margin: 1 }}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
    expect(el).toHaveClass('custom-thinking');
    expect(el.getAttribute('style')).toContain('margin');
  });

  it('respects autoplay=false and loop=false', () => {
    render(<ThinkingLottie autoplay={false} loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
  });
});
