import React from 'react';
import { LoadingLottie, LoadingLottieProps } from '../lotties/LoadingLottie';

/**
 * Loading 组件 - 加载动画组件
 *
 * 该组件提供一个简单的加载动画效果，包含两个旋转的椭圆形。
 * 主要用于在数据加载或处理过程中提供视觉反馈。
 *
 * @component
 * @description 加载动画组件，显示两个旋转变形的椭圆
 * @example
 * ```tsx
 * import { Loading } from './Components/Loading';
 *
 * function App() {
 *   return (
 *     <div>
 *       <Loading />
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {React.ReactElement} 渲染的加载动画组件
 */
export const Loading = (props: LoadingLottieProps) => {
  return <LoadingLottie size={'1em'} {...props} />;
};
