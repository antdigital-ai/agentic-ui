import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import EffectPlayer from '../../../src/Components/effects/EffectPlayer';

describe('EffectPlayer', () => {
  it('should render a div with default size and position:relative', () => {
    render(<EffectPlayer sceneUrl="test-scene" data-testid="player" />);
    const el = screen.getByTestId('player');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveStyle({ width: '1em', height: '1em', position: 'relative' });
  });

  it('should apply custom numeric/string size', () => {
    const { rerender } = render(
      <EffectPlayer sceneUrl="test" data-testid="player" size={64} />,
    );
    expect(screen.getByTestId('player')).toHaveStyle({ width: '64px' });

    rerender(
      <EffectPlayer sceneUrl="test" data-testid="player" size="3rem" />,
    );
    expect(screen.getByTestId('player')).toHaveStyle({ width: '3rem' });
  });

  it('should apply className, style and extra HTML attributes', () => {
    render(
      <EffectPlayer
        sceneUrl="test"
        data-testid="player"
        className="custom"
        style={{ margin: '10px' }}
      />,
    );
    const el = screen.getByTestId('player');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({ margin: '10px' });
  });

  it('should clean up on unmount without errors', () => {
    const { unmount } = render(<EffectPlayer sceneUrl="test" />);
    expect(() => unmount()).not.toThrow();
  });

  it('should not show fallback image initially', () => {
    render(<EffectPlayer sceneUrl="test" />);
    expect(document.querySelector('img[alt="fallback"]')).toBeFalsy();
  });
});
