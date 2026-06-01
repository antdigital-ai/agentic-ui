import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { VoicePlayLottie } from '../animated/VoicePlayLottie';
import { VoicingLottie } from '../animated/VoicingLottie';

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
      data-testid="lottie-mock"
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
  it('should render with default props (autoplay=true, loop=true)', async () => {
    render(<Component />);
    const el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-animation', 'loaded');
    });
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
    if (hasAriaHidden) {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('should apply custom size, className, style', async () => {
    render(
      <Component
        size={48}
        className="voice-custom"
        style={{ backgroundColor: 'green' }}
      />,
    );
    const el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-animation', 'loaded');
    });
    expect(el).toHaveStyle({ width: '48px', height: '48px', display: 'flex' });
    expect(el).toHaveClass('voice-custom');
    expect(el.getAttribute('style')).toContain('background-color: green');
  });

  it('should respect autoplay=false and loop=false', async () => {
    render(<Component autoplay={false} loop={false} />);
    const el = await screen.findByTestId('lottie-mock');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-animation', 'loaded');
    });
    expect(el).toHaveAttribute('data-autoplay', 'false');
    expect(el).toHaveAttribute('data-loop', 'false');
  });
});
