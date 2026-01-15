import Lottie from 'lottie-react';
import React from 'react';
import lottieData from './lottie';

export interface FooterBackgroundLottieProps {
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
}

/**
 * FooterBackgroundLottie 组件 - Lottie底部背景动画组件
 *
 * 该组件使用Lottie动画库提供流畅的底部背景动画效果，支持播放控制等。
 *
 * @component
 * @description FooterBackgroundLottie 组件 - Lottie底部背景动画组件，提供流畅的底部背景动画效果
 * @param {FooterBackgroundLottieProps} props - 组件属性
 * @param {boolean} [props.autoplay=true] - 是否自动播放动画
 * @param {boolean} [props.loop=true] - 是否循环播放动画
 * @param {string} [props.className] - 动画容器类名
 * @param {React.CSSProperties} [props.style] - 动画容器样式
 *
 * @example
 * ```tsx
 * <FooterBackgroundLottie
 *   autoplay={true}
 *   loop={true}
 *   className="custom-loading"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Lottie底部背景动画组件
 *
 * @remarks
 * - 使用Lottie动画库
 * - 提供流畅的动画效果
 * - 支持播放控制
 * - 支持自定义样式
 */
export const FooterBackgroundLottie: React.FC<FooterBackgroundLottieProps> = ({
  autoplay = true,
  loop = true,
  className,
  style,
}) => {
  return (
    <Lottie
      className={className}
      style={style}
      renderer="svg"
      aria-hidden="true"
      animationData={lottieData}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default FooterBackgroundLottie;
