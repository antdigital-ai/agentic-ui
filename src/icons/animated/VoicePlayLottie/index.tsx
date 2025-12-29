import Lottie from 'lottie-react';
import React from 'react';
import voicePlay from './voicePlay.json';

export interface LottieVoiceProps {
  /**
   * 是否自动播放动画
   */
  autoplay?: boolean;
  /**
   * 是否循环播放动画
   */
  loop?: boolean;
  /**
   * 动画容器类名
   */
  className?: string;
  /**
   * 动画容器样式
   */
  style?: React.CSSProperties;
  /**
   * 动画尺寸
   */
  size?: number;
}

/**
 * VoicePlay 组件 - Lottie语音播放动画组件
 *
 *
 * @component
 * @description Lottie语音播放动画组件
 * @param {LottieVoiceProps} props - 组件属性
 * @param {boolean} [props.autoplay=true] - 是否自动播放动画
 * @param {boolean} [props.loop=true] - 是否循环播放动画
 * @param {string} [props.className] - 动画容器类名
 * @param {React.CSSProperties} [props.style] - 动画容器样式
 * @param {number} [props.size=32] - 动画尺寸
 *
 * @example
 * ```tsx
 * <VoicePlayLottie
 *   autoplay={true}
 *   loop={true}
 *   size={48}
 *   className="custom-loading"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Lottie语音播放动画组件
 *
 * @remarks
 * - 使用Lottie动画库
 * - 支持自定义尺寸
 * - 支持播放控制
 * - 支持自定义样式
 * - 提供默认的语音播放动画
 */
export const VoicePlayLottie: React.FC<LottieVoiceProps> = ({
  autoplay = true,
  loop = true,
  className,
  style,
  size,
}) => {
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  };

  return (
    <Lottie
      style={containerStyle}
      className={className}
      animationData={voicePlay}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default VoicePlayLottie;
