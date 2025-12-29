import type { ReactNode } from 'react';

/**
 * 布局头部配置接口
 */
export interface LayoutHeaderConfig {
  /** 标题文本 */
  title?: string;
  /** 是否显示分享按钮 */
  showShare?: boolean;
  /** 左侧是否可折叠 */
  leftCollapsible?: boolean;
  /** 右侧是否可折叠 */
  rightCollapsible?: boolean;
  /** 左侧折叠状态（受控） */
  leftCollapsed?: boolean;
  /** 右侧折叠状态（受控） */
  rightCollapsed?: boolean;
  /** 左侧默认折叠状态（非受控时使用） */
  leftDefaultCollapsed?: boolean;
  /** 右侧默认折叠状态（非受控时使用） */
  rightDefaultCollapsed?: boolean;
  /** 左侧折叠按钮点击事件 */
  onLeftCollapse?: (collapsed: boolean) => void;
  /** 右侧折叠按钮点击事件 */
  onRightCollapse?: (collapsed: boolean) => void;
  /** 分享按钮点击事件 */
  onShare?: () => void;
  /** 自定义左侧内容 */
  leftExtra?: ReactNode;
  /** 自定义右侧内容 */
  rightExtra?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 布局头部组件属性接口
 */
export type LayoutHeaderProps = LayoutHeaderConfig;
