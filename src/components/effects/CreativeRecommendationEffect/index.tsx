import React from 'react';
import EffectPlayer, { EffectPlayerProps } from '../EffectPlayer';
import creativeRecommendation from './creativeRecommendation.json';

/**
 * 创意推荐闪动组件
 *
 * 使用 Lottie 动画展示创意推荐闪动的组件，支持自定义尺寸、样式和播放行为。
 *
 * @component
 * @example
 * // 基础用法
 * <CreativeRecommendationEffect />
 *
 * @example
 * // 自定义尺寸
 * <CreativeRecommendationEffect size={64} />
 *
 * @example
 * // 自定义样式
 * <CreativeRecommendationEffect
 *   size={80}
 *   style={{ margin: '20px' }}
 *   className="custom-creative-recommendation"
 * />
 *
 * @example
 * // 控制播放行为
 * <CreativeRecommendationEffect
 *   autoplay={false}
 *   loop={false}
 * />
 *
 * @param props - 组件属性
 * @param props.autoplay - 是否自动播放动画，默认为 true
 * @param props.loop - 是否循环播放动画，默认为 true
 * @param props.className - 动画容器类名
 * @param props.style - 动画容器自定义样式
 * @param props.size - 动画尺寸（宽度和高度）
 * @returns 渲染的创意推荐闪动组件
 */
export const CreativeRecommendationEffect: React.FC<
  Omit<EffectPlayerProps, 'sceneUrl'>
> = ({ autoplay = true, loop = true, className, style, size }) => {
  return (
    <EffectPlayer
      sceneUrl={creativeRecommendation}
      downgradeImage={
        'https://mdn.alipayobjects.com/graph_jupiter/afts/img/A*VgxnSph0dEwAAAAAQCAAAAgAesF2AQ/original'
      }
      size={size}
      style={style}
      autoplay={autoplay}
      loop={loop}
      className={className}
    />
  );
};

export default CreativeRecommendationEffect;
