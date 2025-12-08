import { ConfigProvider } from 'antd';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  LayoutHeader,
  type LayoutHeaderConfig,
} from '../Components/LayoutHeader';
import { useAgenticLayoutStyle } from './style';

export interface AgenticLayoutProps {
  /** 左侧内容 */
  left?: ReactNode;
  /** 中间内容 */
  center: ReactNode;
  /** 右侧内容 */
  right?: ReactNode;
  /** 头部配置 */
  header?: LayoutHeaderConfig;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 左侧宽度 */
  leftWidth?: number;
  /** 右侧宽度 */
  rightWidth?: number;
  /** 最小高度 */
  minHeight?: string | number;
  /** 子元素（用于兼容性，实际内容应使用 center 属性） */
  children?: ReactNode;
}

/**
 * AgenticLayout 组件 - 智能体布局组件
 *
 * 该组件提供一个三栏布局的容器，支持左中右三个区域的灵活配置。
 * 左右侧栏支持折叠功能，中间区域自适应宽度。
 *
 * @component
 * @description 智能体布局组件，提供左中右三栏布局
 * @param {AgenticLayoutProps} props - 组件属性
 * @param {ReactNode} [props.left] - 左侧内容
 * @param {ReactNode} props.center - 中间内容
 * @param {ReactNode} [props.right] - 右侧内容
 * @param {LayoutHeaderConfig} [props.header] - 头部配置
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义CSS类名
 * @param {number} [props.leftWidth=256] - 左侧宽度
 * @param {number} [props.rightWidth=540] - 右侧宽度
 * @param {string | number} [props.minHeight='600px'] - 最小高度
 *
 * @example
 * ```tsx
 * <AgenticLayout
 *   left={<History />}
 *   center={<ChatLayout />}
 *   right={<Workspace />}
 *   header={{
 *     title: "智能体助手",
 *     showShare: true,
 *     showLeftCollapse: true,
 *     showRightCollapse: true,
 *     onLeftCollapse: (collapsed) => console.log('左侧折叠:', collapsed),
 *     onRightCollapse: (collapsed) => console.log('右侧折叠:', collapsed),
 *     onShare: () => console.log('分享')
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的布局组件
 *
 * @remarks
 * - 支持左右侧栏的独立折叠控制
 * - 中间区域自适应剩余宽度
 * - 提供响应式布局适配
 * - 支持自定义宽度和高度
 * - 集成 Ant Design 主题系统
 */
const MIN_RIGHT_WIDTH = 400;
const MAX_RIGHT_WIDTH_RATIO = 0.7;

export const AgenticLayout: React.FC<AgenticLayoutProps> = ({
  left,
  center,
  right,
  header,
  style,
  className,
  leftWidth = 256,
  rightWidth = 540,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-layout');
  const { wrapSSR, hashId } = useAgenticLayoutStyle(prefixCls);

  // 从 header 配置中获取折叠状态
  const leftCollapsed =
    header?.leftCollapsed ?? header?.leftDefaultCollapsed ?? false;
  const rightCollapsed =
    header?.rightCollapsed ?? header?.rightDefaultCollapsed ?? false;

  // 右侧边栏宽度状态
  const [currentRightWidth, setCurrentRightWidth] = useState(rightWidth);
  const isResizingRef = useRef(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(rightWidth);

  // 计算最大宽度（浏览器窗口的70%）
  const getMaxRightWidth = useCallback(() => {
    if (typeof window === 'undefined') return Infinity;
    return window.innerWidth * MAX_RIGHT_WIDTH_RATIO;
  }, []);

  // 当 rightWidth prop 变化时更新状态
  useEffect(() => {
    setCurrentRightWidth(rightWidth);
  }, [rightWidth]);

  // 监听窗口大小变化，确保右侧边栏宽度不超过最大限制
  useEffect(() => {
    const handleWindowResize = () => {
      const maxWidth = getMaxRightWidth();
      if (currentRightWidth > maxWidth) {
        setCurrentRightWidth(maxWidth);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [currentRightWidth, getMaxRightWidth]);

  // 处理拖拽过程
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      // 向左拖拽（扩大右侧边栏）时 deltaX 为正，向右拖拽（缩小）时 deltaX 为负
      const deltaX = resizeStartX.current - e.clientX;
      const newWidth = resizeStartWidth.current + deltaX;
      const maxWidth = getMaxRightWidth();

      // 限制宽度范围
      const clampedWidth = Math.max(
        MIN_RIGHT_WIDTH,
        Math.min(newWidth, maxWidth),
      );

      setCurrentRightWidth(clampedWidth);
    },
    [getMaxRightWidth],
  );

  // 处理拖拽结束
  const handleResizeEnd = useCallback(function handleMouseUp() {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResizeMove]);

  // 处理拖拽开始
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = currentRightWidth;
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [currentRightWidth, handleResizeMove, handleResizeEnd],
  );

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleResizeMove, handleResizeEnd]);

  return wrapSSR(
    <div className={`${prefixCls} ${className || ''} ${hashId}`} style={style}>
      {/* 主体内容区域 */}
      <div
        className={`${prefixCls}-body ${hashId}`}
        style={{ display: 'flex', flex: 1 }}
      >
        {/* 左侧边栏 */}
        {left && (
          <div
            className={`${prefixCls}-sidebar ${prefixCls}-sidebar-left ${
              leftCollapsed ? `${prefixCls}-sidebar-left-collapsed` : ''
            } ${hashId}`}
            style={{
              width: leftCollapsed ? 0 : leftWidth,
              minWidth: leftCollapsed ? 0 : leftWidth,
              maxWidth: leftCollapsed ? 0 : leftWidth,
            }}
          >
            <div className={`${prefixCls}-sidebar-content ${hashId}`}>
              {left}
            </div>
          </div>
        )}

        {/* 中间内容区域 */}
        <div
          className={`${prefixCls}-main ${hashId}`}
          style={{
            flex: 1,
            minWidth: MIN_RIGHT_WIDTH,
          }}
        >
          {header && (
            <LayoutHeader
              {...header}
              leftCollapsible={header.leftCollapsible ?? !!left}
              rightCollapsible={header.rightCollapsible ?? !!right}
            />
          )}
          <div className={`${prefixCls}-main-content ${hashId}`}>{center}</div>
        </div>
      </div>
      {/* 右侧边栏 */}
      {right && (
        <div
          className={`${prefixCls}-sidebar-wrapper-right ${hashId}`}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            height: '100%',
          }}
        >
          {/* 拖拽手柄 */}
          {!rightCollapsed && (
            <div
              className={`${prefixCls}-resize-handle ${prefixCls}-resize-handle-right ${hashId}`}
              onMouseDown={handleResizeStart}
            />
          )}
          <div
            className={`${prefixCls}-sidebar ${prefixCls}-sidebar-right ${
              rightCollapsed ? `${prefixCls}-sidebar-right-collapsed` : ''
            } ${hashId}`}
            style={{
              width: rightCollapsed ? 0 : currentRightWidth,
              minWidth: rightCollapsed ? 0 : currentRightWidth,
              maxWidth: rightCollapsed ? 0 : currentRightWidth,
            }}
          >
            <div className={`${prefixCls}-sidebar-content ${hashId}`}>
              {right}
            </div>
          </div>
        </div>
      )}
    </div>,
  );
};
