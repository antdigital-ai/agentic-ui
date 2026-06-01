import React, { useMemo } from 'react';
import { useAsyncLottieData } from '../useAsyncLottieData';
import AbstractLottie, { AbstractLottieProps } from './Abstract';

export type BubbleActionLottieProps = Omit<
  AbstractLottieProps,
  'animationData'
>;

interface CreateBubbleActionLottieOptions {
  /** 动态 import 函数，例如 `() => import('./lottie.json')` */
  loadJson: () => Promise<unknown>;
  /** 组件 displayName，便于 React DevTools */
  displayName?: string;
}

/**
 * 工厂：根据动态 import 生成一个基于 AbstractLottie 的 bubble-action 包装组件。
 *
 * 用于消除 bubble-actions/{Like,Copy,Dislike,More,Play,Quote,Refresh,Share} 等
 * 结构完全相同的轻量包装组件。
 */
export function createBubbleActionLottie(
  options: CreateBubbleActionLottieOptions,
): React.FC<BubbleActionLottieProps> {
  const { loadJson, displayName } = options;

  const Component: React.FC<BubbleActionLottieProps> = (props) => {
    const stableLoad = useMemo(() => loadJson, []);
    const animationData = useAsyncLottieData(stableLoad);
    if (animationData === null) {
      return null;
    }
    return <AbstractLottie {...props} animationData={animationData} />;
  };

  if (displayName) {
    Component.displayName = displayName;
  }

  return Component;
}
