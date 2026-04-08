import React from 'react';

/** 仅末块为 true：流式 Markdown 只对「当前生长块」播放入场，避免全页段落/表格单元格一起闪动 */
export interface StreamingAnimationContextValue {
  animateBlock: boolean;
}

export const StreamingAnimationContext =
  React.createContext<StreamingAnimationContextValue | null>(null);
