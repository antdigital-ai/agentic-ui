import React, { useContext } from 'react';
import AnimationText from '../AnimationText';
import { StreamingAnimationContext } from '../StreamingAnimationContext';

export interface StreamAnimWrapProps {
  /** 来自 buildEditorAlignedComponents 闭包 */
  streaming?: boolean;
  /** 显式 false 时关闭末段段落动画 */
  streamingParagraphAnimation?: boolean;
  children?: React.ReactNode;
}

/**
 * 段落级流式淡入包装：仅当 streaming + 末块 + 未显式关闭段落动画时启用 AnimationText。
 *
 * 提到模块级是为了：在 buildEditorAlignedComponents 重建时（props 抖动），React 不会
 * 把它当作新组件类型 → 子树不会被卸载重挂，避免动画/输入态丢失。
 */
const StreamAnimWrapComponent: React.FC<StreamAnimWrapProps> = ({
  streaming,
  streamingParagraphAnimation,
  children,
}) => {
  const { animateBlock } = useContext(StreamingAnimationContext);
  const allow =
    !!streaming && animateBlock && streamingParagraphAnimation !== false;
  if (!allow) return <>{children}</>;
  return <AnimationText>{children}</AnimationText>;
};

StreamAnimWrapComponent.displayName = 'StreamAnimWrap';

export const StreamAnimWrap = React.memo(StreamAnimWrapComponent);
