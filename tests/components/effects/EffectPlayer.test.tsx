import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EffectPlayer from '../../../src/Components/effects/EffectPlayer';

describe('EffectPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a container div', () => {
    const { container } = render(
      <EffectPlayer sceneUrl="test-scene" data-testid="effect-player" />,
    );
    const el = screen.getByTestId('effect-player');
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('DIV');
  });

  it('should apply default size style', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" />);
    const el = screen.getByTestId('player');
    expect(el).toHaveStyle({ width: '1em', height: '1em' });
  });

  it('should apply custom numeric size', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" size={64} />);
    const el = screen.getByTestId('player');
    expect(el).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should apply custom string size', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" size="3rem" />);
    const el = screen.getByTestId('player');
    expect(el).toHaveStyle({ width: '3rem', height: '3rem' });
  });

  it('should apply custom style', () => {
    render(
      <EffectPlayer
        sceneUrl="test-scene"
        data-testid="player"
        style={{ margin: '10px' }}
      />,
    );
    const el = screen.getByTestId('player');
    expect(el).toHaveStyle({ margin: '10px' });
  });

  it('should apply position relative to container', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" />);
    const el = screen.getByTestId('player');
    expect(el).toHaveStyle({ position: 'relative' });
  });

  it('should apply additional HTML attributes', () => {
    render(
      <EffectPlayer
        sceneUrl="test-scene"
        data-testid="player"
        className="custom"
      />,
    );
    const el = screen.getByTestId('player');
    expect(el).toHaveClass('custom');
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(
      <EffectPlayer sceneUrl="test-scene" data-testid="player" />,
    );
    expect(() => unmount()).not.toThrow();
  });

  it('should not show fallback image initially', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" />);
    const img = document.querySelector('img[alt="fallback"]');
    expect(img).toBeFalsy();
  });

  it('should render with autoplay false', () => {
    render(
      <EffectPlayer
        sceneUrl="test-scene"
        data-testid="player"
        autoplay={false}
      />,
    );
    const el = screen.getByTestId('player');
    expect(el).toBeInTheDocument();
  });

  it('should render with downgradeImage prop', () => {
    render(
      <EffectPlayer
        sceneUrl="test-scene"
        data-testid="player"
        downgradeImage="https://example.com/fallback.png"
      />,
    );
    const el = screen.getByTestId('player');
    expect(el).toBeInTheDocument();
  });
});
