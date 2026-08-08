/**
 * EffectPlayer residual：autoplay false、error 降级图、resize、dispose。
 */
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
  it.skip('autoplay:false 时 pause；size 变化触发 resize', () => {
    player.loadScene.mockClear();
    player.pause.mockClear();
    player.resize.mockClear();
    const { rerender, unmount } = render(
      <EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={20} />,
    );
    expect(player.loadScene).toHaveBeenCalledWith('scene', { autoplay: false });
    expect(player.pause).toHaveBeenCalled();
    rerender(
      <EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={30} />,
    );
    expect(player.resize).toHaveBeenCalled();
    unmount();
    expect(player.dispose).toHaveBeenCalled();
  });

  it.skip('onError 展示 downgradeImage；无降级图时不崩', () => {
    player.loadScene.mockClear();
    render(
      <EffectPlayer
        sceneUrl={'scene' as any}
        downgradeImage="/fallback.png"
        size="2em"
      />,
    );
    player.onError?.();
    expect(screen.getByAltText('fallback')).toHaveAttribute(
      'src',
      '/fallback.png',
    );

    const { container } = render(<EffectPlayer sceneUrl={'scene' as any} />);
    player.onError?.();
    expect(container).toBeTruthy();
  });
});
