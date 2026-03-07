import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VoicingLottie } from '../../src/Icons/animated/VoicingLottie';

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

describe('VoicingLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<VoicingLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('data-animation', 'loaded');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with custom size', () => {
    render(<VoicingLottie size={64} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should render with custom className', () => {
    render(<VoicingLottie className="voicing-custom" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveClass('voicing-custom');
  });

  it('should render with custom style', () => {
    render(<VoicingLottie style={{ border: '2px solid blue' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ border: '2px solid blue' });
  });

  it('should render with autoplay disabled', () => {
    render(<VoicingLottie autoplay={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with loop disabled', () => {
    render(<VoicingLottie loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
  });

  it('should merge custom style with container style', () => {
    render(<VoicingLottie size={40} style={{ backgroundColor: 'green' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({
      width: '40px',
      height: '40px',
      display: 'flex',
    });
    const styleAttr = el.getAttribute('style');
    expect(styleAttr).toContain('background-color: green');
  });

  it('should render with all props', () => {
    render(
      <VoicingLottie
        size={50}
        className="all-props"
        style={{ padding: '5px' }}
        autoplay={false}
        loop={false}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
    expect(el).toHaveClass('all-props');
    expect(el).toHaveStyle({ width: '50px', height: '50px' });
  });
});
