import React from 'react';
import { ThoughtChainListProps } from '../ThoughtChainList/types';
import { BubbleProps } from './type';

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
  bubble?: BubbleProps<{
    /**
     * 聊天内容
     */
    content: string;
    /**
     * 聊天项的唯一标识
     */
    uuid: number;
  }>;
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
