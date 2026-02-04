import { Player, Scene } from '@galacean/effects';
import React, {
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLatest } from 'react-use';
import { useRefFunction } from '../../Hooks/useRefFunction';

export interface EffectPlayerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'ref'
> {
  /**
   * 动画资源
   */
  sceneUrl: Scene.LoadType;
  /**
   * 降级图片
   */
  downgradeImage?: string;
  /**
   * 是否自动播放动画
   * @default true
   */
  autoplay?: boolean;
  /**
   * 是否循环播放动画
   * @default true
   */
  loop?: boolean;
  /**
   * 动画尺寸
   */
  size?: string | number;
}

function EffectPlayer({
  sceneUrl,
  downgradeImage,
  autoplay = true,
  // TODO: 添加禁止循环播放功能
  // loop = true,
  size = '1em',
  style,
  ...attrs
}: EffectPlayerProps) {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // ==================== Downgrade Image ====================
  const downgradeImageRef = useLatest(downgradeImage);

  const [fallbackImage, setFallbackImage] = useState<string>();

  const onError = useRefFunction(() => {
    setFallbackImage(downgradeImageRef.current);
  });

  // ==================== Create Player ====================
  useLayoutEffect(() => {
    // create player
    const { current: container } = containerRef;
    if (container) {
      playerRef.current = new Player({
        container,
        onError,
      });
      playerRef.current.loadScene(sceneUrl, {
        autoplay,
      });
    }

    // dispose player
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // ==================== State Effects ====================
  useEffect(() => {
    if (playerRef.current) {
      setFallbackImage(undefined);
      playerRef.current.loadScene(sceneUrl, {
        autoplay,
      });
    }
  }, [sceneUrl]);

  useEffect(() => {
    if (playerRef.current) {
      if (autoplay) {
        playerRef.current.resume();
      } else {
        playerRef.current.pause();
      }
    }
  }, [autoplay]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.resize();
    }
  }, [size]);

  return (
    <div {...attrs} ref={containerRef} style={containerStyle}>
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt="fallback"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </div>
  );
}

export default EffectPlayer;
