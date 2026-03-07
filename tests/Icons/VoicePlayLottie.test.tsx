import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VoicePlayLottie } from '../../src/Icons/animated/VoicePlayLottie';

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

describe('VoicePlayLottie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<VoicePlayLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('data-animation', 'loaded');
  });

  it('should render with custom size', () => {
    render(<VoicePlayLottie size={48} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('should render with custom className', () => {
    render(<VoicePlayLottie className="voice-play" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveClass('voice-play');
  });

  it('should render with custom style', () => {
    render(<VoicePlayLottie style={{ margin: '5px' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ margin: '5px' });
  });

  it('should render with autoplay disabled', () => {
    render(<VoicePlayLottie autoplay={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
  });

  it('should render with loop disabled', () => {
    render(<VoicePlayLottie loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'false');
  });

  it('should merge custom style with container style', () => {
    render(<VoicePlayLottie size={32} style={{ color: 'red' }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({
      width: '32px',
      height: '32px',
      display: 'flex',
    });
  });

  it('should render without size prop', () => {
    render(<VoicePlayLottie />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    const style = el.getAttribute('style');
    expect(style).toContain('display: flex');
  });
});
