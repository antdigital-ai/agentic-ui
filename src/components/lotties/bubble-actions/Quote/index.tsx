import React from 'react';
import AbstractLottie, { AbstractLottieProps } from '../Abstract';
import quoteAnimation from './lottie.json';

export type QuoteLottieProps = Omit<AbstractLottieProps, 'animationData'>;

/**
 * 引用操作动画组件
 *
 * 使用 Lottie 动画展示引用操作的视觉反馈，支持自定义尺寸、样式和播放行为。
 *
 * @component
 * @example
 * // 基础用法
 * <QuoteLottie />
 *
 * @example
 * // 自定义尺寸
 * <QuoteLottie size={64} />
 *
 * @example
 * // 自定义样式
 * <QuoteLottie
 *   size={80}
 *   style={{ margin: '20px' }}
 *   className="custom-quote"
 * />
 *
 * @example
 * // 控制播放行为
 * <QuoteLottie
 *   active={true}
 *   autoplay={true}
 *   loop={true}
 * />
 *
 * @param props - 组件属性
 * @param props.active - 是否激活动画，默认为 false
 * @param props.autoplay - 是否自动播放动画，默认为 false
 * @param props.loop - 是否循环播放动画，默认为 false
 * @param props.className - 动画容器类名
 * @param props.style - 动画容器自定义样式
 * @param props.size - 动画尺寸（宽度和高度），默认为 '1em'
 * @returns 渲染的引用操作动画组件
 */
export const QuoteLottie: React.FC<QuoteLottieProps> = (props) => (
  <AbstractLottie {...props} animationData={quoteAnimation} />
);

export default QuoteLottie;
