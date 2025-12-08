import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreativeRecommendationLoading } from '../../src/Components/Loading/CreativeRecommendationLoading';

// Mock EffectPlayer
vi.mock('../../src/Components/effects/EffectPlayer', () => ({
  default: ({
    sceneUrl,
    downgradeImage,
    size,
    style,
    autoplay,
    loop,
    className,
  }: any) => (
    <div
      data-testid="effect-player"
      data-scene-url={JSON.stringify(sceneUrl)}
      data-downgrade-image={downgradeImage}
      data-size={size}
      data-autoplay={autoplay}
      data-loop={loop}
      className={className}
      style={style}
    />
  ),
}));

describe('CreativeRecommendationLoading Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render CreativeRecommendationLoading component', () => {
    render(<CreativeRecommendationLoading />);

    expect(screen.getByTestId('effect-player')).toBeInTheDocument();
  });

  it('should use default size', () => {
    render(<CreativeRecommendationLoading />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-size', '1em');
  });

  it('should pass custom props', () => {
    render(
      <CreativeRecommendationLoading
        size={64}
        autoplay={false}
        loop={false}
        className="custom-class"
      />,
    );

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-size', '64');
    expect(player).toHaveAttribute('data-autoplay', 'false');
    expect(player).toHaveAttribute('data-loop', 'false');
    expect(player).toHaveClass('custom-class');
  });

  it('should merge custom style', () => {
    const customStyle = { margin: '20px' };
    render(<CreativeRecommendationLoading style={customStyle} />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveStyle({ margin: '20px' });
  });
});
