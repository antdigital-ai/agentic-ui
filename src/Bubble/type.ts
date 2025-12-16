import { TooltipProps } from 'antd';
import { ReactNode } from 'react';
import { MarkdownEditorProps } from '../MarkdownEditor/types';
import { AttachmentFile } from '../MarkdownInputField/AttachmentButton/types';
import {
  BaseStyleProps,
  BubbleMetaData,
  MessageBubbleData,
  MultiClassNameProps,
  MultiStyleProps,
  WithFalse,
} from '../Types';
import type { UseSpeechAdapter } from './MessagesContent/VoiceButton';
import { BubbleExtraProps } from './types/BubbleExtra';
import { DocInfoListProps } from './types/DocInfo';

/**
 * 基础样式属性
 * @deprecated 请使用 BaseStyleProps from '../Types'
 */
export type BubbleStyleProps = BaseStyleProps;

/**
 * 气泡样式配置
 * @description 气泡组件各部分的样式配置
 */
export interface BubbleStyles {
  [key: string]: React.CSSProperties | undefined;
  /**
   * 气泡根容器的自定义样式
   */
  bubbleStyle?: React.CSSProperties;

  /**
   * 头像标题区域的自定义样式
   */
  bubbleAvatarTitleStyle?: React.CSSProperties;

  /**
   * 主容器的自定义样式
   */
  bubbleContainerStyle?: React.CSSProperties;

  /**
   * 加载图标的自定义样式
   */
  bubbleLoadingIconStyle?: React.CSSProperties;

  /**
   * 名称区域的自定义样式
   */
  bubbleNameStyle?: React.CSSProperties;

  /**
   * 内容的自定义样式
   */
  bubbleListItemContentStyle?: React.CSSProperties;

  /**
   * 内容前置区域的自定义样式
   */
  bubbleListItemBeforeStyle?: React.CSSProperties;

  /**
   * 内容后置区域的自定义样式
   */
  bubbleListItemAfterStyle?: React.CSSProperties;

  /**
   * 标题的自定义样式
   */
  bubbleListItemTitleStyle?: React.CSSProperties;

  /**
   * 头像的自定义样式
   */
  bubbleListItemAvatarStyle?: React.CSSProperties;

  /**
   * 额外内容的自定义样式
   */
  bubbleListItemExtraStyle?: React.CSSProperties;
}

/**
 * 气泡类名配置
 * @description 气泡组件各部分的类名配置
 */
export interface BubbleClassNames {
  [key: string]: string | undefined;
  /**
   * 气泡根容器的自定义类名
   */
  bubbleClassName?: string;

  /**
   * 头像标题区域的自定义类名
   */
  bubbleAvatarTitleClassName?: string;

  /**
   * 主容器的自定义类名
   */
  bubbleContainerClassName?: string;

  /**
   * 加载图标的自定义类名
   */
  bubbleLoadingIconClassName?: string;

  /**
   * 名称区域的自定义类名
   */
  bubbleNameClassName?: string;

  /**
   * 内容的自定义类名
   */
  bubbleListItemContentClassName?: string;

  /**
   * 内容前置区域的自定义类名
   */
  bubbleListItemBeforeClassName?: string;

  /**
   * 内容后置区域的自定义类名
   */
  bubbleListItemAfterClassName?: string;

  /**
   * 标题的自定义类名
   */
  bubbleListItemTitleClassName?: string;

  /**
   * 头像的自定义类名
   */
  bubbleListItemAvatarClassName?: string;

  /**
   * 额外内容的自定义类名
   */
  bubbleListItemExtraClassName?: string;
}

/**
 * 气泡项样式属性
 * @description 包含单一根样式和多个子元素样式的完整配置
 */
export interface BubbleItemStyleProps
  extends BubbleStyleProps,
    MultiStyleProps<BubbleStyles>,
    MultiClassNameProps<BubbleClassNames> {}

// 从统一类型文件导出，避免重复定义
export type { BubbleMetaData, MessageBubbleData } from '../Types';

/**
 * 自定义配置
 */
export interface CustomConfig {
  /**
   * 提示框配置
   */
  TooltipProps?: TooltipProps;

  /**
   * 弹出框配置
   */
  PopoverProps?: {
    titleStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
  };
}

// 从统一类型文件导出，避免重复定义
export type { WithFalse } from '../Types';

/**
 * 气泡渲染配置
 */
export interface BubbleRenderConfig<T = Record<string, any>> {
  titleRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  contentRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  contentAfterRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  contentBeforeRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  /**
   * afterContent 的 render 方法
   * @description 用于渲染在 content 后面的内容
   */
  afterMessageRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  /**
   * beforeContent 的 render 方法
   * @description 用于渲染在 content 前面的内容
   */
  beforeMessageRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  avatarRender?: WithFalse<
    (props: BubbleProps<T>, defaultDom: ReactNode) => ReactNode
  >;
  customConfig?: CustomConfig;
  render?: WithFalse<
    (
      props: BubbleProps<T>,
      domsMap: {
        avatar: ReactNode;
        title: ReactNode;
        header: ReactNode;
        messageContent: ReactNode;
        itemDom: ReactNode;
        extra: ReactNode;
      },
      defaultDom: ReactNode,
    ) => ReactNode
  >;
  extraRender?: BubbleExtraProps['render'];
  extraRightRender?: BubbleExtraProps['rightRender'];
}

/**
 * 气泡组件属性
 */
export interface BubbleProps<T = Record<string, any>>
  extends BubbleItemStyleProps {
  time?: number;
  /**
   * 头像元数据
   */
  avatar?: BubbleMetaData;

  /**
   * 是否启用纯净模式
   */
  pure?: boolean;

  /**
   * 渲染配置
   */
  bubbleRenderConfig?: BubbleRenderConfig<T>;

  /**
   * 头像点击事件
   */
  onAvatarClick?: () => void;

  /**
   * 双击事件
   */
  onDoubleClick?: () => void;

  /**
   * 放置位置
   */
  placement?: 'left' | 'right';

  /**
   * 原始数据
   */
  originData?: T & MessageBubbleData;

  /**
   * 消息ID
   */
  id?: string;

  /**
   * 列表引用
   */
  bubbleListRef?: any;

  /**
   * 是否只读
   */
  readonly?: boolean;

  /**
   * Markdown 渲染配置
   */
  markdownRenderConfig?: MarkdownEditorProps;

  /**
   * 自定义配置
   */
  customConfig?: CustomConfig;

  /**
   * 依赖项数组
   */
  deps?: any[];

  /**
   * 不喜欢回调
   */
  onDisLike?: (
    bubble: MessageBubbleData<Record<string, any>>,
  ) => Promise<void> | void;

  /**
   * 喜欢回调
   */
  onLike?: (
    bubble: MessageBubbleData<Record<string, any>>,
  ) => Promise<void> | void;

  /**
   * 取消点赞的回调函数
   * @description 当用户点击取消点赞按钮时触发
   * @callback
   * @optional
   */
  onCancelLike?: (bubble: MessageBubbleData<Record<string, any>>) => void;

  /**
   * 回复回调
   */
  onReply?: (message: string) => void;

  /**
   * 文档列表配置
   */
  docListProps?: DocInfoListProps & {
    enable?: boolean;
  };

  /**
   * 气泡引用
   */
  bubbleRef?: any;

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
   * @description 替换默认 Web Speech 实现，接入自定义 TTS 能力
   */
  useSpeech?: UseSpeechAdapter;

  /**
   * 预加载消息
   */
  preMessage?: MessageBubbleData;

  /**
   * 自定义“更多”操作渲染 DOM
   */
  renderFileMoreAction?: (file: AttachmentFile) => React.ReactNode;

  /**
   * 文件视图事件（新）
   * @description 与示例中的 fileViewEvents 对齐：通过回调拿到默认 handlers，并可返回局部覆盖实现
   */
  fileViewEvents?: (handlers: {
    onPreview: (file: AttachmentFile) => void;
    onDownload: (file: AttachmentFile) => void;
    onViewAll: (files: AttachmentFile[]) => void;
  }) => Partial<{
    onPreview: (file: AttachmentFile) => void;
    onDownload: (file: AttachmentFile) => void;
    onViewAll: (files: AttachmentFile[]) => void;
  }> | void;

  /**
   * 文件视图配置（新）
   * @description 与示例中的 fileViewConfig 对齐：控制样式与更多按钮、数量等
   */
  fileViewConfig?: {
    /** 自定义根容器 className */
    className?: string;
    /** 自定义根容器样式 */
    style?: React.CSSProperties;
    /** 最大展示条目数（默认 3） */
    maxDisplayCount?: number;
    /** 是否显示"查看更多"按钮 */
    showMoreButton?: boolean;
    /** 自定义悬浮动作区 */
    customSlot?: React.ReactNode | ((file: AttachmentFile) => React.ReactNode);
    /**
     * 自定义更多操作渲染
     * 兼容以下几种写法：
     * - (file) => ReactNode
     * - () => (file) => ReactNode
     * - () => ReactNode
     * - 直接传 ReactNode
     */
    renderFileMoreAction?:
      | React.ReactNode
      | ((file: AttachmentFile) => React.ReactNode)
      | (() => React.ReactNode)
      | (() => (file: AttachmentFile) => React.ReactNode);
  };
  userBubbleProps?: BubbleProps;
  aIBubbleProps?: BubbleProps;
}
