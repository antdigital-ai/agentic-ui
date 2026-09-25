/**
 * EffectPlayer deepen12 safe：autoplay false pause、resize、onError 降级。
 */
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  Player: vi.fn(function MockPlayer(this: any, options: any) {
    player.onError = options.onError;
    Object.assign(this, player);
    return this;
  }),
}));

describe('EffectPlayer deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    player.loadScene.mockClear();
    player.pause.mockClear();
    player.resize.mockClear();
    player.dispose.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('autoplay false → pause；size 变化 resize', () => {
    const { rerender, unmount } = render(
      <EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={20} />,
    );
    expect(player.loadScene).toHaveBeenCalledWith('scene', { autoplay: false });
    expect(player.pause).toHaveBeenCalled();
    rerender(<EffectPlayer sceneUrl={'scene' as any} autoplay={false} size={30} />);
    expect(player.resize).toHaveBeenCalled();
    unmount();
    expect(player.dispose).toHaveBeenCalled();
  });

  it('onError 展示 downgradeImage；无降级图不崩', () => {
    render(
      <EffectPlayer
        sceneUrl={'scene' as any}
        downgradeImage="/fallback.png"
        size="2em"
      />,
    );
    act(() => {
      player.onError?.();
    });
    expect(screen.getByAltText('fallback')).toHaveAttribute(
      'src',
      '/fallback.png',
    );
    const { container } = render(<EffectPlayer sceneUrl={'scene' as any} />);
    act(() => {
      player.onError?.();
    });
    expect(container).toBeTruthy();
  });
});
