import React from 'react';
import EffectPlayer, { EffectPlayerProps } from '../EffectPlayer';
import loadingEffect from './loading.json';

/**
 * 加载动画组件
 *
 * 使用 Lottie 动画展示加载动画的组件，支持自定义尺寸、样式和播放行为。
 *
 * @component
 * @example
 * // 基础用法
 * <LoadingEffect />
 *
 * @example
 * // 自定义尺寸
 * <LoadingEffect size={64} />
 *
 * @example
 * // 自定义样式
 * <LoadingEffect
 *   size={80}
 *   style={{ margin: '20px' }}
 *   className="custom-loading"
 * />
 *
 * @example
 * // 控制播放行为
 * <LoadingEffect
 *   autoplay={false}
 *   loop={false}
 * />
 *
 * @param props - 组件属性
 * @param props.autoplay - 是否自动播放动画，默认为 true
 * @param props.loop - 是否循环播放动画，默认为 true
 * @param props.className - 动画容器类名
 * @param props.style - 动画容器自定义样式
 * @param props.size - 动画尺寸（宽度和高度）
 * @returns 渲染的加载动画组件
 */
export const LoadingEffect: React.FC<Omit<EffectPlayerProps, 'sceneUrl'>> = ({
  autoplay = true,
  loop = true,
  className,
  style,
  size,
}) => {
  return (
    <EffectPlayer
      sceneUrl={loadingEffect}
      size={size}
      style={style}
      autoplay={autoplay}
      loop={loop}
      className={className}
    />
  );
};

export default LoadingEffect;
