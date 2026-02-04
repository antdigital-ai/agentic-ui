import React from 'react';
import bg from './images/bg.png';

export interface FooterBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * FooterBackgroundLottie 组件 - Lottie底部背景动画组件
 *
 * 该组件使用Lottie动画库提供流畅的底部背景动画效果，支持播放控制等。
 *
 * @component
 * @description FooterBackground 组件 - 底部背景组件，提供流畅的底部背景动画效果
 * @param {FooterBackgroundProps} props - 组件属性
 * @param {string} [props.className] - 背景容器类名
 * @param {React.CSSProperties} [props.style] - 背景容器样式
 *
 * @example
 * ```tsx
 * <FooterBackground
 *   className="custom-footer-background"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的底部背景组件
 *
 * @remarks
 * - 使用背景图片
 * - 提供流畅的背景效果
 * - 支持自定义样式
 */
export const FooterBackground: React.FC<FooterBackgroundProps> = ({
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${bg})`,
      }}
      aria-hidden="true"
    />
  );
};

export default FooterBackground;
