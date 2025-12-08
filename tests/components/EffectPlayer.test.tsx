import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EffectPlayer from '../../src/Components/effects/EffectPlayer';

const getMockPlayer = async () => {
  const { Player } = await import('@galacean/effects');
  return (Player as any).mock.results[0].value;
};

// Mock @galacean/effects
vi.mock('@galacean/effects', () => {
  const mockPlayer = {
    loadScene: vi.fn(),
    dispose: vi.fn(),
    resume: vi.fn(),
    pause: vi.fn(),
    resize: vi.fn(),
  };

  const Player = vi.fn().mockImplementation(() => mockPlayer);

  return {
    Player,
  };
});

describe('EffectPlayer Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render EffectPlayer component', () => {
    const sceneUrl = { url: 'test-scene.json' };
    const { container } = render(<EffectPlayer sceneUrl={sceneUrl} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should use custom size', () => {
    const sceneUrl = { url: 'test-scene.json' };
    const { container } = render(
      <EffectPlayer sceneUrl={sceneUrl} size={64} />,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('64px');
    expect(div.style.height).toBe('64px');
  });

  it('should use string size', () => {
    const sceneUrl = { url: 'test-scene.json' };
    const { container } = render(
      <EffectPlayer sceneUrl={sceneUrl} size="2em" />,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('2em');
    expect(div.style.height).toBe('2em');
  });

  it('should show fallback image when error occurs', async () => {
    const sceneUrl = { url: 'test-scene.json' };
    const downgradeImage = 'https://example.com/fallback.png';
    const { Player } = await import('@galacean/effects');

    const mockPlayer = new Player({ container: document.createElement('div') });

    // 创建带有 onError 的 Player
    const PlayerWithError = vi.fn().mockImplementation((config: any) => {
      if (config.onError) {
        // 触发错误回调
        queueMicrotask(() => config.onError());
      }
      return mockPlayer;
    });

    vi.mocked(Player).mockImplementation(PlayerWithError);

    render(
      <EffectPlayer sceneUrl={sceneUrl} downgradeImage={downgradeImage} />,
    );

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByAltText('fallback')).toHaveAttribute(
        'src',
        downgradeImage,
      );
    });
  });

  it('should reload scene when sceneUrl changes', async () => {
    const sceneUrl1 = { url: 'test-scene-1.json' };
    const sceneUrl2 = { url: 'test-scene-2.json' };
    const { rerender } = render(<EffectPlayer sceneUrl={sceneUrl1} />);

    const mockPlayer = await getMockPlayer();

    rerender(<EffectPlayer sceneUrl={sceneUrl2} />);

    await waitFor(() => {
      expect(mockPlayer.loadScene).toHaveBeenCalledWith(sceneUrl2, {
        autoplay: true,
      });
    });
  });

  it('should handle autoplay changes', async () => {
    const sceneUrl = { url: 'test-scene.json' };
    const { rerender } = render(
      <EffectPlayer sceneUrl={sceneUrl} autoplay={true} />,
    );

    const mockPlayer = await getMockPlayer();

    rerender(<EffectPlayer sceneUrl={sceneUrl} autoplay={false} />);

    await waitFor(() => {
      expect(mockPlayer.pause).toHaveBeenCalled();
    });

    rerender(<EffectPlayer sceneUrl={sceneUrl} autoplay={true} />);

    await waitFor(() => {
      expect(mockPlayer.resume).toHaveBeenCalled();
    });
  });

  it('should call resize when size changes', async () => {
    const sceneUrl = { url: 'test-scene.json' };
    const { rerender } = render(<EffectPlayer sceneUrl={sceneUrl} size={64} />);

    const mockPlayer = await getMockPlayer();

    rerender(<EffectPlayer sceneUrl={sceneUrl} size={128} />);

    await waitFor(() => {
      expect(mockPlayer.resize).toHaveBeenCalled();
    });
  });

  it('should merge custom style', () => {
    const sceneUrl = { url: 'test-scene.json' };
    const customStyle = { margin: '20px', padding: '10px' };
    const { container } = render(
      <EffectPlayer sceneUrl={sceneUrl} style={customStyle} />,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.margin).toBe('20px');
    expect(div.style.padding).toBe('10px');
  });

  it('should pass other HTML attributes', () => {
    const sceneUrl = { url: 'test-scene.json' };
    render(
      <EffectPlayer
        sceneUrl={sceneUrl}
        data-testid="effect-player"
        className="custom-class"
      />,
    );

    const container = screen.getByTestId('effect-player');
    expect(container).toHaveClass('custom-class');
  });
});
