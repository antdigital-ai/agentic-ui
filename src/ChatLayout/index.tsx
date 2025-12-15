import { ConfigProvider } from 'antd';
import React, { forwardRef, useContext, useImperativeHandle } from 'react';
import { LayoutHeader } from '../Components/LayoutHeader';
import useAutoScroll from '../Hooks/useAutoScroll';
import { useStyle } from './style';
import type { ChatLayoutProps, ChatLayoutRef } from './types';

/**
 * ChatLayout 组件 - 聊天布局组件
 *
 * 该组件提供了一个完整的聊天界面布局，包含头部区域、内容区域和底部区域。
 * 头部区域包含标题、左侧折叠按钮、分享按钮和右侧折叠按钮。
 * 内容区域用于放置对话内容（如 BubbleList）。
 * 底部区域固定在底部，用于放置输入框或AI对话按钮等组件。
 *
 * @component
 * @description 聊天布局组件，提供完整的对话界面布局
 * @param {ChatLayoutProps} props - 组件属性
 *
 * @example
 * ```tsx
 * import { ChatLayout } from './ChatLayout';
 *
 * // 基本用法
 * <ChatLayout
 *   header={{
 *     title: "AI 助手",
 *     onLeftCollapse: () => console.log('左侧折叠'),
 *     onRightCollapse: () => console.log('右侧折叠'),
 *     onShare: () => console.log('分享')
 *   }}
 * >
 *   <div>对话内容</div>
 * </ChatLayout>
 *
 * // 受控模式 - 折叠状态
 * <ChatLayout
 *   header={{
 *     title: "AI 助手",
 *     leftCollapsed: leftCollapsed,
 *     rightCollapsed: rightCollapsed,
 *     onLeftCollapse: setLeftCollapsed,
 *     onRightCollapse: setRightCollapsed
 *   }}
 * >
 *   <div>对话内容</div>
 * </ChatLayout>
 *
 * // 非受控模式 - 默认折叠状态
 * <ChatLayout
 *   header={{
 *     title: "AI 助手",
 *     leftDefaultCollapsed: true,
 *     rightDefaultCollapsed: false,
 *     onLeftCollapse: (collapsed) => console.log('左侧折叠状态:', collapsed),
 *     onRightCollapse: (collapsed) => console.log('右侧折叠状态:', collapsed)
 *   }}
 * >
 *   <div>对话内容</div>
 * </ChatLayout>
 *
 * // 自定义底部
 * <ChatLayout
 *   header={{ title: "AI 助手" }}
 *   footer={<div>自定义底部内容</div>}
 * >
 *   <div>对话内容</div>
 * </ChatLayout>
 * ```
 *
 * @returns {React.ReactElement} 渲染的聊天布局组件
 */
const ChatLayout = forwardRef<ChatLayoutRef, ChatLayoutProps>(
  (
    {
      header,
      children,
      footer,
      footerHeight = 90,
      scrollBehavior = 'smooth',
      className,
      style,
    },
    ref,
  ) => {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('chat-layout');
    const { wrapSSR, hashId } = useStyle(prefixCls);
    const { containerRef, scrollToBottom } = useAutoScroll({
      SCROLL_TOLERANCE: 30,
      onResize: () => {},
      timeout: 200,
      scrollBehavior,
    });

    useImperativeHandle(ref, () => ({
      scrollContainer: containerRef.current,
      scrollToBottom,
    }));

    return wrapSSR(
      <div
        className={`${prefixCls} ${className || ''} ${hashId}`}
        style={style}
      >
        {/* 头部区域 */}
        {header && <LayoutHeader {...header} />}

        {/* 内容区域 */}
        <div className={`${prefixCls}-content ${hashId}`}>
          <div
            className={`${prefixCls}-content-scrollable ${hashId}`}
            ref={containerRef}
          >
            {children}
            <div
              style={{ height: footer ? footerHeight : 0, width: '100%' }}
            ></div>
          </div>
        </div>

        {/* 底部区域 */}
        {footer && (
          <div
            className={`${prefixCls}-footer ${hashId}`}
            style={{ minHeight: footerHeight }}
          >
            {footer}
          </div>
        )}
      </div>,
    );
  },
);
// 保持向后兼容，导出 ChatFlowHeader 作为 LayoutHeader 的别名
export { LayoutHeader as ChatFlowHeader } from '../Components/LayoutHeader';
export type { LayoutHeaderProps as ChatFlowHeaderProps } from '../Components/LayoutHeader';
export type { ChatLayoutProps, ChatLayoutRef } from './types';
export { ChatLayout };
