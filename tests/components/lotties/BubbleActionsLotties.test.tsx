import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyLottie } from '../../../src/Components/lotties/bubble-actions/Copy';
import { DislikeLottie } from '../../../src/Components/lotties/bubble-actions/Dislike';
import { LikeLottie } from '../../../src/Components/lotties/bubble-actions/Like';
import { MoreLottie } from '../../../src/Components/lotties/bubble-actions/More';
import { PlayLottie } from '../../../src/Components/lotties/bubble-actions/Play';
import { QuoteLottie } from '../../../src/Components/lotties/bubble-actions/Quote';
import { RefreshLottie } from '../../../src/Components/lotties/bubble-actions/Refresh';
import { ShareLottie } from '../../../src/Components/lotties/bubble-actions/Share';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<Component />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-animation', 'loaded');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render with custom size', () => {
    render(<Component size={48} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('should render with active prop', () => {
    render(<Component active={true} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<Component className="test-class" />);
    const el = screen.getByTestId('lottie-animation');
    expect(el.className).toContain('test-class');
  });

  it('should render with custom style', () => {
    render(<Component style={{ opacity: 0.5 }} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveStyle({ opacity: '0.5' });
  });

  it('should render with loop and autoplay', () => {
    render(<Component loop={true} autoplay={true} />);
    const el = screen.getByTestId('lottie-animation');
    expect(el).toHaveAttribute('data-loop', 'true');
    expect(el).toHaveAttribute('data-autoplay', 'true');
  });
});
