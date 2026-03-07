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

  it('should render with default props', () => {
    render(<AbstractLottie animationData={mockAnimationData} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with default size of 1em', () => {
    render(<AbstractLottie animationData={mockAnimationData} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '1em', height: '1em' });
  });

  it('should render with custom numeric size', () => {
    render(<AbstractLottie animationData={mockAnimationData} size={64} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should render with custom string size', () => {
    render(<AbstractLottie animationData={mockAnimationData} size="2em" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '2em', height: '2em' });
  });

  it('should render with custom className', () => {
    render(
      <AbstractLottie
        animationData={mockAnimationData}
        className="custom-cls"
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el.className).toContain('custom-cls');
  });

  it('should render with custom style', () => {
    render(
      <AbstractLottie
        animationData={mockAnimationData}
        style={{ margin: '5px' }}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ margin: '5px' });
  });

  it('should render with autoplay enabled', () => {
    render(
      <AbstractLottie animationData={mockAnimationData} autoplay={true} />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'true');
  });

  it('should render with loop enabled', () => {
    render(<AbstractLottie animationData={mockAnimationData} loop={true} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'true');
  });

  it('should call play when active becomes true', () => {
    const { rerender } = render(
      <AbstractLottie animationData={mockAnimationData} active={false} />,
    );

    rerender(
      <AbstractLottie animationData={mockAnimationData} active={true} />,
    );

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should call stop when active becomes false', () => {
    const { rerender } = render(
      <AbstractLottie animationData={mockAnimationData} active={true} />,
    );

    mockPlay.mockClear();
    mockStop.mockClear();

    rerender(
      <AbstractLottie animationData={mockAnimationData} active={false} />,
    );

    expect(mockStop).toHaveBeenCalled();
  });

  it('should call stop by default (active=false)', () => {
    render(<AbstractLottie animationData={mockAnimationData} />);
    expect(mockStop).toHaveBeenCalled();
  });
});
