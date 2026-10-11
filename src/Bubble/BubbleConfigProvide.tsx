import React from 'react';
import { ThoughtChainListProps } from '../ThoughtChainList/types';
import { BubbleProps, BubbleRenderConfig } from './type';

// Context 历史上接受 content/uuid 泛型的渲染回调，保留该赋值兼容性，
// 同时为直接声明的回调提供统一 BubbleProps 上下文类型。
type ContextRenderCallback<T> = T extends (
  props: BubbleProps,
  ...args: infer Args
) => infer Result
  ? { render(props: ContextBubbleProps, ...args: Args): Result }['render']
  : T;

type ContextBubbleRenderConfig = {
  [K in keyof BubbleRenderConfig]: K extends
    | 'extraRender'
    | 'extraRightRender'
    | 'customConfig'
    ? BubbleRenderConfig[K]
    : ContextRenderCallback<BubbleRenderConfig[K]>;
};

interface ContextBubbleProps extends Omit<BubbleProps, 'bubbleRenderConfig'> {
  bubbleRenderConfig?: ContextBubbleRenderConfig;
}

export type ChatConfigType = {
  agentId?: string;
  sessionId?: string;
  standalone: boolean;
  clientIdRef?: React.MutableRefObject<string>;
  thoughtChain?: {
    enable?: boolean;
    alwaysRender?: boolean;
    render?: (
      bubble: BubbleProps<Record<string, any>>,
      taskList: string,
    ) => React.ReactNode;
  } & ThoughtChainListProps;
  tracert?: {
    /**
     * 是否开启
     */
    enable: boolean;
  };
  /** 当前气泡属性 */
  bubble?: ContextBubbleProps;
  compact?: boolean;
  /**
   * extra（点赞、踩、复制等）是否仅在 hover 时展示
   * @default false 默认常驻展示
   */
  extraShowOnHover?: boolean;
};

export const BubbleConfigContext = React.createContext<
  ChatConfigType | undefined
>({
  standalone: false,
});
