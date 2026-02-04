import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreativeRecommendationEffect } from '../../src/Components/effects/CreativeRecommendationEffect';

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

describe('CreativeRecommendationEffect Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render CreativeRecommendationEffect component', () => {
    render(<CreativeRecommendationEffect />);

    expect(screen.getByTestId('effect-player')).toBeInTheDocument();
  });

  it('should use default autoplay and loop values', () => {
    render(<CreativeRecommendationEffect />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-autoplay', 'true');
    expect(player).toHaveAttribute('data-loop', 'true');
  });

  it('should handle autoplay=false', () => {
    render(<CreativeRecommendationEffect autoplay={false} />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-autoplay', 'false');
  });

  it('should handle loop=false', () => {
    render(<CreativeRecommendationEffect loop={false} />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-loop', 'false');
  });

  it('should apply custom size', () => {
    render(<CreativeRecommendationEffect size={64} />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveAttribute('data-size', '64');
  });

  it('should apply custom style', () => {
    const customStyle = { margin: '20px' };
    render(<CreativeRecommendationEffect style={customStyle} />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveStyle({ margin: '20px' });
  });

  it('should apply custom className', () => {
    render(<CreativeRecommendationEffect className="custom-class" />);

    const player = screen.getByTestId('effect-player');
    expect(player).toHaveClass('custom-class');
  });

  it('should pass downgrade image URL', () => {
    render(<CreativeRecommendationEffect />);

    const player = screen.getByTestId('effect-player');
    const downgradeImage = player.getAttribute('data-downgrade-image');
    expect(downgradeImage).toContain('mdn.alipayobjects.com');
  });
});
