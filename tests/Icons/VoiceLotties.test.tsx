import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VoicePlayLottie } from '../../src/Icons/animated/VoicePlayLottie';
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

const voiceLotties = [
  { name: 'VoicePlayLottie', Component: VoicePlayLottie, hasAriaHidden: false },
  { name: 'VoicingLottie', Component: VoicingLottie, hasAriaHidden: true },
];

describe.each(voiceLotties)('$name', ({ Component, hasAriaHidden }) => {
  it('should render with default props (autoplay=true, loop=true)', () => {
    render(<Component />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    expect(el).toHaveAttribute('data-animation', 'loaded');
    if (hasAriaHidden) {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('should apply custom size, className, style', () => {
    render(
      <Component
        size={48}
        className="voice-custom"
        style={{ backgroundColor: 'green' }}
      />,
    );
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px', display: 'flex' });
    expect(el).toHaveClass('voice-custom');
    expect(el.getAttribute('style')).toContain('background-color: green');
  });

  it('should respect autoplay=false and loop=false', () => {
    render(<Component autoplay={false} loop={false} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
  });
});
