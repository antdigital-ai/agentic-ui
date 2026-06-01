import type { ReactNode } from 'react';
import type { LayoutHeaderConfig } from '../Components/LayoutHeader';
import type { BaseStyleProps } from '../Types';

/**
 * ChatLayout 组件的属性接口
 */
export interface ChatLayoutProps extends BaseStyleProps {
  /** 头部配置 */
  header?: LayoutHeaderConfig;
  /** 内容区域的自定义内容 */
  children?: ReactNode;
  /** 底部区域的自定义内容 */
  footer?: ReactNode;
  /** 底部区域的高度 */
  footerHeight?: number;
  /** 滚动行为，'smooth' 使用基于 rAF 的渐进滚动（流式输出场景下更平滑且不会被打断），'auto' 立即滚动 */
  scrollBehavior?: 'smooth' | 'auto';
  /** 是否显示底部背景 */
  showFooterBackground?: boolean;
  /** 滚动状态变化回调，便于业务方实现"回到底部"按钮等交互 */
  onScrollStateChange?: (state: ChatLayoutScrollState) => void;
  /** 自定义类名 */
  classNames?: {
    /** 根容器类名 */
    root?: string;
    /** 内容区域类名 */
    content?: string;
    /** 滚动区域类名 */
    scrollable?: string;
    /** 底部区域类名 */
    footer?: string;
    /** 底部背景区域类名 */
    footerBackground?: string;
  };
  /** 自定义样式 */
  styles?: {
    /** 根容器样式 */
    root?: React.CSSProperties;
    /** 内容区域样式 */
    content?: React.CSSProperties;
    /** 滚动区域样式 */
    scrollable?: React.CSSProperties;
    /** 底部区域样式 */
    footer?: React.CSSProperties;
    /** 底部背景区域样式 */
    footerBackground?: React.CSSProperties;
  };
}

/**
 * 滚动状态
 */
export interface ChatLayoutScrollState {
  /** 是否贴近底部（距离底部 <= 容差阈值） */
  isAtBottom: boolean;
  /** 是否处于"跟随底部"状态（用户未主动上滑离开） */
  isPinned: boolean;
}

export interface ChatLayoutRef {
  /** 滚动容器 DOM 节点 */
  scrollContainer: HTMLDivElement | null;
  /**
   * 手动滚动到底部
   * @param behavior 滚动行为，默认 'auto' 立即滚动；传 'smooth' 使用渐进滚动
   */
  scrollToBottom: (behavior?: 'smooth' | 'auto') => void;
  /** 当前是否贴底 */
  isAtBottom: () => boolean;
}
