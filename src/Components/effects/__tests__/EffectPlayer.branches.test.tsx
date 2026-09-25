import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import EffectPlayer from '../EffectPlayer';

const player = vi.hoisted(() => ({
  loadScene: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  onError: undefined as undefined | (() => void),
}));

vi.mock('@galacean/effects', () => ({
  Player: vi.fn((options: any) => {
    player.onError = options.onError;
    return player;
  }),
}));

describe('EffectPlayer residual branches', () => {
  it.skip('pauses when autoplay is false and resizes after size changes', () => {
    const { rerender } = render(<EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={20} />);
    expect(player.loadScene).toHaveBeenCalledWith('scene', { autoplay: false });
    expect(player.pause).toHaveBeenCalled();
    rerender(<EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={30} />);
    expect(player.resize).toHaveBeenCalled();
  });

  it.skip('shows the configured fallback image when the player errors', () => {
    render(<EffectPlayer sceneUrl={'scene' as any} downgradeImage="/fallback.png" />);
    player.onError?.();
    expect(screen.getByAltText('fallback')).toHaveAttribute('src', '/fallback.png');
  });
});
