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
}

export interface ChatLayoutRef {
  scrollContainer: HTMLDivElement | null;
  scrollToBottom: () => void;
}
