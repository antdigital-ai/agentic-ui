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
  /** 滚动行为 */
  scrollBehavior?: 'smooth' | 'auto';
  /** 是否显示底部背景 */
  showFooterBackground?: boolean;
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

export interface ChatLayoutRef {
  scrollContainer: HTMLDivElement | null;
  scrollToBottom: () => void;
}
