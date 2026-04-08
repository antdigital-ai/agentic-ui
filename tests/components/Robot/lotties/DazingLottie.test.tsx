import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DazingLottie } from '../../../../src/Components/Robot/lotties/DazingLottie';

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

describe('DazingLottie', () => {
  it('renders with default props (autoplay, loop, size=32)', () => {
    render(<DazingLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('applies custom size, className, style', () => {
    render(
      <DazingLottie
        size={48}
        className="custom-dazing"
        style={{ margin: 1 }}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
    expect(el).toHaveClass('custom-dazing');
    expect(el.getAttribute('style')).toContain('margin');
  });

  it('respects autoplay=false and loop=false', () => {
    render(<DazingLottie autoplay={false} loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
  });
});
