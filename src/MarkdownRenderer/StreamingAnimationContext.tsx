import React from 'react';

/** 仅末块为 true：流式 Markdown 只对「当前生长块」播放入场，避免全页段落/表格单元格一起闪动 */
export interface StreamingAnimationContextValue {
  animateBlock: boolean;
}

/** 默认 animateBlock=true：无 Provider 包裹时（如静态渲染）不阻断子树自身的入场动画 */
export const StreamingAnimationContext =
  React.createContext<StreamingAnimationContextValue>({ animateBlock: true });
