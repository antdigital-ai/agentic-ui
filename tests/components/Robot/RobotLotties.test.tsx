import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BlowingWindLottie } from '../../../src/Components/Robot/lotties/BlowingWindLottie';
import { BouncingLottie } from '../../../src/Components/Robot/lotties/BouncingLottie';
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

const robotLotties = [
  { name: 'PeekLottie', Component: PeekLottie },
  { name: 'BouncingLottie', Component: BouncingLottie },
  { name: 'BlowingWindLottie', Component: BlowingWindLottie },
];

describe.each(robotLotties)('$name', ({ Component }) => {
  it('should render with default props (autoplay, loop, aria-hidden, size=32)', () => {
    render(<Component />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('should apply custom size, className, style', () => {
    render(
      <Component
        size={64}
        className="custom"
        style={{ backgroundColor: 'blue' }}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
    expect(el).toHaveClass('custom');
    expect(el.getAttribute('style')).toContain('background-color: blue');
  });

  it('should respect autoplay=false and loop=false', () => {
    render(<Component autoplay={false} loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
  });
});
