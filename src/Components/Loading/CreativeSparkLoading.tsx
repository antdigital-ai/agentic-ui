import React from 'react';
import { CreativeSparkLottie, LoadingLottieProps } from '../lotties';

/**
 * CreativeSparkLoading 组件 - 创意生成中火花动画组件
 *
 * 该组件提供一个创意生成中火花动画效果。
 * 主要用于在创意生成中火花过程中提供视觉反馈。
 *
 * @component
 * @description 创意生成中火花动画组件
 * @example
 * ```tsx
 * import { CreativeSparkLoading } from './Components/CreativeSparkLoading';
 *
 * function App() {
 *   return (
 *     <div>
 *       <CreativeSparkLoading />
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {React.ReactElement} 渲染的创意生成中火花动画组件
 */
export const CreativeSparkLoading = ({ ...props }: LoadingLottieProps) => {
  const lottieProps = {
    size: '1em',
    ...props,
  };

  return <CreativeSparkLottie {...lottieProps} />;
};

export default CreativeSparkLoading;
