import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CopyLottie } from '../bubble-actions/Copy';
import { DislikeLottie } from '../bubble-actions/Dislike';
import { LikeLottie } from '../bubble-actions/Like';
import { MoreLottie } from '../bubble-actions/More';
import { PlayLottie } from '../bubble-actions/Play';
import { QuoteLottie } from '../bubble-actions/Quote';
import { RefreshLottie } from '../bubble-actions/Refresh';
import { ShareLottie } from '../bubble-actions/Share';

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
      lottieRef.current = { play: vi.fn(), stop: vi.fn() };
    }
    return (
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
    );
  },
}));

const lottieComponents = [
  { name: 'CopyLottie', Component: CopyLottie },
  { name: 'DislikeLottie', Component: DislikeLottie },
  { name: 'LikeLottie', Component: LikeLottie },
  { name: 'MoreLottie', Component: MoreLottie },
  { name: 'PlayLottie', Component: PlayLottie },
  { name: 'QuoteLottie', Component: QuoteLottie },
  { name: 'RefreshLottie', Component: RefreshLottie },
  { name: 'ShareLottie', Component: ShareLottie },
];

describe.each(lottieComponents)('$name', ({ Component }) => {
  it('should render with animation data and aria-hidden', async () => {
    render(<Component />);
    const el = await screen.findByTestId('lottie-animation');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-animation', 'loaded');
    });
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply size, className, style, active, loop, autoplay', async () => {
    render(
      <Component
        size={48}
        className="test-cls"
        style={{ opacity: 0.5 }}
        active={true}
        loop={true}
        autoplay={true}
      />,
    );
    const el = await screen.findByTestId('lottie-animation');
    await waitFor(() => {
      expect(el).toHaveAttribute('data-animation', 'loaded');
    });
    expect(el).toHaveStyle({ width: '48px', height: '48px', opacity: '0.5' });
    expect(el.className).toContain('test-cls');
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
  });
});
