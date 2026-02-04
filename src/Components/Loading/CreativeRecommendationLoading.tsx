import React from 'react';
import { CreativeRecommendationEffect } from '../effects';
import { LoadingLottieProps } from '../lotties/LoadingLottie';

/**
 * CreativeRecommendationLoading 组件 - 创意推荐闪动动画组件
 *
 * 该组件提供一个创意推荐闪动动画效果。
 * 主要用于在创意推荐闪动过程中提供视觉反馈。
 *
 * @component
 * @description 创意推荐闪动动画组件
 * @example
 * ```tsx
 * import { CreativeRecommendationLoading } from './Components/CreativeRecommendationLoading';
 *
 * function App() {
 *   return (
 *     <div>
 *       <CreativeRecommendationLoading />
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {React.ReactElement} 渲染的创意推荐闪动动画组件
 */
export const CreativeRecommendationLoading = ({
  ...props
}: LoadingLottieProps) => {
  const lottieProps = {
    size: '1em',
    ...props,
  };

  return <CreativeRecommendationEffect {...lottieProps} />;
};
