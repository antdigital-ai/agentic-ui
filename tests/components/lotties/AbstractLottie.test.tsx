import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractLottie } from '../../../src/Components/lotties/bubble-actions/Abstract';

const mockPlay = vi.fn();
const mockStop = vi.fn();

vi.mock('lottie-react', () => ({
  default: ({
    animationData,
    loop,
    autoplay,
    style,
    className,
    lottieRef,
    ...props
  }: any) => {
    if (lottieRef) {
      lottieRef.current = { play: mockPlay, stop: mockStop };
    }
    return (
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
    );
  },
}));

const mockAnimationData = { v: '5.5.7', layers: [] };

describe('AbstractLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with defaults: autoplay=false, loop=false, size=1em', () => {
    render(<AbstractLottie animationData={mockAnimationData} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveStyle({ width: '1em', height: '1em' });
  });

  it('should accept numeric and string size', () => {
    const { rerender } = render(
      <AbstractLottie animationData={mockAnimationData} size={64} />,
    );
    expect(screen.getByTestId('lottie-animation')).toHaveStyle({ width: '64px' });

    rerender(<AbstractLottie animationData={mockAnimationData} size="2em" />);
    expect(screen.getByTestId('lottie-animation')).toHaveStyle({ width: '2em' });
  });

  it('should apply className, style, autoplay, loop', () => {
    render(
      <AbstractLottie
        animationData={mockAnimationData}
        className="custom"
        style={{ margin: '5px' }}
        autoplay={true}
        loop={true}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el.className).toContain('custom');
    expect(el).toHaveStyle({ margin: '5px' });
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('data-loop', 'true');
  });

  it('should call play when active=true, stop when active=false', () => {
    const { rerender } = render(
      <AbstractLottie animationData={mockAnimationData} active={false} />,
    );
    expect(mockStop).toHaveBeenCalled();

    mockPlay.mockClear();
    mockStop.mockClear();

    rerender(
      <AbstractLottie animationData={mockAnimationData} active={true} />,
    );
    expect(mockPlay).toHaveBeenCalled();
  });
});
