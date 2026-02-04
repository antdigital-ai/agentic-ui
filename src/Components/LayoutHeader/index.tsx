import {
  LaptopMinimal,
  PanelLeftFill,
  PanelLeftFillFold,
  SquareArrowOutUpRight,
} from '@sofa-design/icons';
import { Button, ConfigProvider } from 'antd';
import classNames from 'classnames';
import { useMergedState } from 'rc-util';
import React, { useContext } from 'react';
import { I18nContext } from '../../I18n';
import { ActionIconBox } from '../ActionIconBox';
import { useLayoutHeaderStyle } from './style';
import type { LayoutHeaderProps } from './types';

/**
 * LayoutHeader 组件 - 布局头部组件
 *
 * 该组件提供了一个通用的布局头部区域，包含标题、左侧折叠按钮、分享按钮和右侧折叠按钮。
 * 支持自定义左侧和右侧的额外内容，以及受控和非受控模式。
 *
 * @component
 * @description 布局头部组件，提供完整的头部布局和交互功能
 * @param {LayoutHeaderProps} props - 组件属性
 *
 * @example
 * ```tsx
 * import { LayoutHeader } from './LayoutHeader';
 *
 * // 基本用法
 * <LayoutHeader
 *   title="AI 助手"
 *   onLeftCollapse={() => console.log('左侧折叠')}
 *   onRightCollapse={() => console.log('右侧折叠')}
 *   onShare={() => console.log('分享')}
 * />
 *
 * // 受控模式 - 折叠状态
 * <LayoutHeader
 *   title="AI 助手"
 *   leftCollapsed={leftCollapsed}
 *   rightCollapsed={rightCollapsed}
 *   onLeftCollapse={setLeftCollapsed}
 *   onRightCollapse={setRightCollapsed}
 * />
 *
 * // 非受控模式 - 默认折叠状态
 * <LayoutHeader
 *   title="AI 助手"
 *   leftDefaultCollapsed={true}
 *   rightDefaultCollapsed={false}
 *   onLeftCollapse={(collapsed) => console.log('左侧折叠状态:', collapsed)}
 *   onRightCollapse={(collapsed) => console.log('右侧折叠状态:', collapsed)}
 * />
 *
 * // 自定义内容
 * <LayoutHeader
 *   title="AI 助手"
 *   leftExtra={<div>自定义左侧内容</div>}
 *   rightExtra={<div>自定义右侧内容</div>}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的头部组件
 */
const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  title = 'AI 助手',
  showShare = false,
  leftCollapsible = false,
  rightCollapsible = false,
  leftCollapsed: controlledLeftCollapsed,
  rightCollapsed: controlledRightCollapsed,
  leftDefaultCollapsed = false,
  rightDefaultCollapsed = false,
  onLeftCollapse,
  onRightCollapse,
  onShare,
  leftExtra,
  rightExtra,
  className,
}) => {
  const { locale } = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('layout-header');
  const { wrapSSR, hashId } = useLayoutHeaderStyle(prefixCls);

  // 使用 useMergedState 管理左侧折叠状态
  const [leftCollapsed, setLeftCollapsed] = useMergedState(
    leftDefaultCollapsed,
    {
      value: controlledLeftCollapsed,
      onChange: onLeftCollapse,
    },
  );

  // 使用 useMergedState 管理右侧折叠状态
  const [rightCollapsed, setRightCollapsed] = useMergedState(
    rightDefaultCollapsed,
    {
      value: controlledRightCollapsed,
      onChange: onRightCollapse,
    },
  );

  const handleLeftCollapse = () => {
    if (leftCollapsible) {
      setLeftCollapsed(!leftCollapsed);
    }
  };

  const handleRightCollapse = () => {
    if (rightCollapsible) {
      setRightCollapsed(!rightCollapsed);
    }
  };

  const handleShare = () => {
    onShare?.();
  };

  return wrapSSR(
    <div className={classNames(prefixCls, hashId, className)}>
      {/* 左侧区域：标题和左侧折叠按钮 */}
      <div className={classNames(`${prefixCls}-left`, hashId)}>
        {leftCollapsible && (
          <>
            <ActionIconBox
              onClick={handleLeftCollapse}
              aria-label={locale?.['chatFlow.collapseLeft'] || '折叠左侧边栏'}
              title={locale?.['chatFlow.collapseLeft'] || '折叠左侧边栏'}
            >
              {leftCollapsed ? <PanelLeftFill /> : <PanelLeftFillFold />}
            </ActionIconBox>
            <div
              className={classNames(`${prefixCls}-left-separator`, hashId)}
            />
          </>
        )}
        <h1 className={classNames(`${prefixCls}-left-title`, hashId)}>
          {title}
        </h1>
        {leftExtra}
      </div>
      {/* 右侧区域：分享按钮和右侧折叠按钮 */}
      <div className={classNames(`${prefixCls}-right`, hashId)}>
        {showShare && (
          <Button
            size="small"
            className={classNames(`${prefixCls}-right-share-btn`, hashId)}
            onClick={handleShare}
            aria-label={locale?.['chatFlow.shareDialog'] || '分享对话'}
            icon={<SquareArrowOutUpRight />}
            color="default"
          >
            {locale?.['chatFlow.share'] || '分享'}
          </Button>
        )}
        {rightCollapsible && (
          <ActionIconBox
            onClick={handleRightCollapse}
            aria-label={locale?.['chatFlow.collapseRight'] || '折叠右侧边栏'}
            title={locale?.['chatFlow.collapseRight'] || '折叠右侧边栏'}
          >
            <LaptopMinimal />
          </ActionIconBox>
        )}
        {rightExtra}
      </div>
    </div>,
  );
};

export type { LayoutHeaderConfig, LayoutHeaderProps } from './types';
export { LayoutHeader };
