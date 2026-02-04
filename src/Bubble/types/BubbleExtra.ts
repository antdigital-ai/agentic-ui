import React from 'react';
import { MessageBubbleData, WithFalse } from '../../Types';

// 简化的 BubbleProps 类型，避免循环依赖
export interface SimpleBubbleProps<T = Record<string, any>> {
  originData?: T & MessageBubbleData;
  [key: string]: any;
}

/**
 * 聊天项额外操作组件的属性接口
 * @interface BubbleExtraProps
 */
export type BubbleExtraProps = {
  /**
   * 回复消息的回调函数
   * @description 当用户点击回复按钮时触发，传入要回复的消息内容
   * @param message - 要回复的消息内容
   * @callback
   * @optional
   */
  onReply?: (message: string) => void;

  /**
   * 点踩的回调函数
   * @description 当用户点击点踩按钮时触发
   * @deprecated 请使用 onDislike 替代（符合命名规范），但为保持兼容性暂时保留
   * @callback
   * @optional
   */
  onDisLike?: () => void;
  /** 点踩的回调函数 */
  onDislike?: () => void;

  /**
   * 点赞的回调函数
   * @description 当用户点击点赞按钮时触发
   * @callback
   * @optional
   */
  onLike?: () => void;

  /**
   * 取消点赞的回调函数
   * @description 当用户点击取消点赞按钮时触发
   * @deprecated 请使用 onLikeCancel 替代（符合命名规范），但为保持兼容性暂时保留
   * @callback
   * @optional
   */
  onCancelLike?: (bubble: MessageBubbleData<Record<string, any>>) => void;
  /**
   * Like 子组件取消事件
   * @description 当用户点击取消点赞按钮时触发
   */
  onLikeCancel?: (bubble: MessageBubbleData<Record<string, any>>) => void;

  /**
   * 控制复制按钮的显示
   * @description 控制复制按钮是否显示的函数或布尔值
   * - 如果传入函数，则调用函数判断是否显示，函数接收 bubble 作为参数
   * - 如果传入布尔值，则直接使用该值控制显示
   * - 如果未传入（undefined），则使用默认逻辑判断
   * @param bubble - 聊天项的数据对象
   * @returns 是否显示复制按钮
   * @optional
   */
  shouldShowCopy?: boolean | ((bubble: BubbleExtraProps['bubble']) => boolean);

  /**
   * 控制语音按钮的显示
   * @description 控制语音按钮是否显示
   */
  shouldShowVoice?: boolean;

  /**
   * 外部语音适配器
   * @description 传入播报适配器替换默认播报
   */
  useSpeech?: any; // 暂时使用 any，避免循环依赖

  /**
   * 额外操作组件的自定义样式
   * @description 用于自定义额外操作区域的样式
   * @optional
   */
  style?: React.CSSProperties;

  /**
   * 是否为只读模式
   * @description 当设置为 true 时，所有操作按钮将被禁用
   * @default false
   * @optional
   */
  readonly?: boolean;

  /**
   * 聊天项的数据
   * @description 包含聊天消息的完整信息
   */
  bubble: SimpleBubbleProps<{
    /**
     * 聊天内容
     * @description 消息的具体文本内容
     */
    content: string;

    /**
     * 聊天项的唯一标识
     * @description 用于唯一标识一条消息
     */
    uuid: number;

    /**
     * 额外信息
     * @description 包含消息相关的额外数据
     */
    extra: {
      /**
       * 预设消息
       * @description 用于快速回复的预设消息内容
       */
      preMessage: {
        /**
         * 预设消息的内容
         * @description 预设消息的具体文本内容
         */
        content: string;
      };
    };
  }>;

  /**
   * 额外内容为空时的回调函数
   * @description 当额外内容为空时触发，用于通知父组件
   * @param isNull - 是否为空
   * @callback
   * @optional
   */
  onRenderExtraNull?: (isNull: boolean) => void;

  /**
   * 自定义渲染函数
   * @description 用于完全自定义额外操作区域的渲染
   * @param props - 当前组件的所有属性
   * @param defaultDoms - 默认的操作按钮 DOM 节点
   * @returns 自定义的额外操作区域 React 节点
   * @optional
   * @deprecated 此属性当前未被使用，extraRender 功能在 MessagesContent 层级处理
   */
  render?: WithFalse<
    (
      props: SimpleBubbleProps<Record<string, any>>,
      defaultDoms: React.ReactNode,
    ) => React.ReactNode
  >;
  pure?: boolean;
  rightRender?: WithFalse<
    (
      props: BubbleExtraProps,
      defaultDoms: {
        /**
         * 点赞按钮的 DOM 节点
         */
        like: React.ReactNode;
        /**
         * 点踩按钮的 DOM 节点
         */
        disLike: React.ReactNode;
        /**
         * 复制按钮的 DOM 节点
         */
        copy: React.ReactNode;
        /**
         * 回复按钮的 DOM 节点
         */
        reply: React.ReactNode;
      },
    ) => React.ReactNode
  >;
  placement?: 'left' | 'right';
};
