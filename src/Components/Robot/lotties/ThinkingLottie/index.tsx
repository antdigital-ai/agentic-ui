import Lottie from 'lottie-react';
import React from 'react';
import thinkingLottie from './thinking.json';

export interface ThinkingLottieProps {
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
 * ThinkingLottie 组件 - Lottie眨眼跑+追星星动画组件
 *
 * 该组件使用Lottie动画库提供流畅的加载动画效果，支持自定义尺寸、播放控制等。
 *
 * @component
 * @description Lottie眨眼跑+追星星动画组件，提供流畅的眨眼跑+追星星动画效果
 * @param {ThinkingLottieProps} props - 组件属性
 * @param {boolean} [props.autoplay=true] - 是否自动播放动画
 * @param {boolean} [props.loop=true] - 是否循环播放动画
 * @param {string} [props.className] - 动画容器类名
 * @param {React.CSSProperties} [props.style] - 动画容器样式
 * @param {number} [props.size=32] - 动画尺寸
 *
 * @example
 * ```tsx
 * <ThinkingLottie
 *   autoplay={true}
 *   loop={true}
 *   size={48}
 *   className="custom-loading"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Lottie眨眼跑+追星星动画组件
 *
 * @remarks
 * - 使用Lottie动画库
 * - 提供流畅的动画效果
 * - 支持自定义尺寸
 * - 支持播放控制
 * - 支持自定义样式
 */
export const ThinkingLottie: React.FC<ThinkingLottieProps> = ({
  autoplay = true,
  loop = true,
  className,
  style,
  size = 32,
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
      animationData={thinkingLottie}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default ThinkingLottie;
