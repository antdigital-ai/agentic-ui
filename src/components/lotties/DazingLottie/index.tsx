import Lottie from 'lottie-react';
import React from 'react';
import dazingLottie from './dazing.json';

export interface DazingLottieProps {
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
 * DazingLottie 组件 - Lottie呼吸+眨眼睛动画组件
 *
 * 该组件使用Lottie动画库提供流畅的加载动画效果，支持自定义尺寸、播放控制等。
 *
 * @component
 * @description Lottie语音播报动画组件，提供流畅的语音播报动画效果
 * @param {DazingLottieProps} props - 组件属性
 * @param {boolean} [props.autoplay=true] - 是否自动播放动画
 * @param {boolean} [props.loop=true] - 是否循环播放动画
 * @param {string} [props.className] - 动画容器类名
 * @param {React.CSSProperties} [props.style] - 动画容器样式
 * @param {number} [props.size=32] - 动画尺寸
 *
 * @example
 * ```tsx
 * <VoicingLottie
 *   autoplay={true}
 *   loop={true}
 *   size={48}
 *   className="custom-loading"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Lottie语音播报动画组件
 *
 * @remarks
 * - 使用Lottie动画库
 * - 提供流畅的动画效果
 * - 支持自定义尺寸
 * - 支持播放控制
 * - 支持自定义样式
 * - 提供默认的加载动画
 */
export const DazingLottie: React.FC<DazingLottieProps> = ({
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
      aria-hidden="true"
      animationData={dazingLottie}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default DazingLottie;
