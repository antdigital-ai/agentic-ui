import { LoadingOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip, TooltipProps } from 'antd';
import classNames from 'clsx';
import { isFunction } from 'lodash-es';
import { useMergedState } from 'rc-util';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNativeTitleTooltipFallback } from '../../Hooks/useNativeTitleTooltipFallback';
import { useStyle } from './style';

export interface ActionIconBoxProps {
  children: ((isHovered: boolean) => React.ReactNode) | React.ReactNode;
  showTitle?: boolean;
  onClick?: (e: React.MouseEvent) => void | Promise<void>;
  tooltipProps?: TooltipProps;
  title?: React.ReactNode;
  type?: 'danger' | 'primary';
  transform?: boolean;
  className?: string;
  borderLess?: boolean;
  /**
   * @deprecated @since 2.29.0 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /** 加载状态 */
  isLoading?: boolean;
  style?: React.CSSProperties;
  active?: boolean;
  onInit?: () => void;
  'data-testid'?: string;
  noPadding?: boolean;
  iconStyle?: React.CSSProperties;
  onLoadingChange?: (loading: boolean) => void;
  theme?: 'light' | 'dark';
}

/**
 * 安全地把 iconStyle 合并到一个 ReactElement 上：
 * - 不传播原 props（cloneElement 默认会保留原 props，无需手动 ...child.props）
 * - 仅合并 style，避免覆盖子元素的事件 / className
 */
function applyIconStyle(
  child: React.ReactNode,
  iconStyle?: React.CSSProperties,
): React.ReactNode {
  if (!React.isValidElement(child)) return child;
  if (!iconStyle) return child;

  const childProps = (child.props ?? {}) as { style?: React.CSSProperties };
  return React.cloneElement(
    child as React.ReactElement<{ style?: React.CSSProperties }>,
    {
      style: { ...childProps.style, ...iconStyle },
    },
  );
}

/**
 * 把任意 children 节点（单个 / 数组）统一处理为合并了 iconStyle 的节点。
 */
function renderIconChildren(
  element: React.ReactNode,
  iconStyle?: React.CSSProperties,
): React.ReactNode {
  if (React.isValidElement(element)) {
    return applyIconStyle(element, iconStyle);
  }
  return React.Children.map(element, (child) =>
    applyIconStyle(child, iconStyle),
  );
}
/**
 * ActionIconBox 组件 - 操作图标盒子组件
 *
 * 该组件提供可点击的图标操作按钮，支持加载状态、工具提示、键盘导航等功能。
 * 主要用于编辑器工具栏中的各种操作按钮。
 *
 * @component
 * @description 操作图标盒子组件，提供可交互的图标按钮
 * @param {ActionIconBoxProps} props - 组件属性
 * @param {React.ReactNode} props.children - 图标内容
 * @param {boolean} [props.showTitle] - 是否显示标题文本
 * @param {(e: any) => void} [props.onClick] - 点击回调函数
 * @param {TooltipProps} [props.tooltipProps] - 工具提示配置
 * @param {string} props.title - 按钮标题和工具提示文本
 * @param {'danger' | 'primary'} [props.type] - 按钮类型
 * @param {boolean} [props.transform] - 是否启用变换效果
 * @param {string} [props.className] - 自定义CSS类名
 * @param {boolean} [props.borderLess] - 是否无边框样式
 * @param {boolean} [props.loading] - 是否显示加载状态
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {boolean} [props.scale] - 是否启用缩放效果
 * @param {boolean} [props.active] - 是否处于激活状态
 * @param {() => void} [props.onInit] - 初始化回调函数
 * @param {string} [props['data-testid']] - 测试ID
 * @param {boolean} [props.noPadding] - 是否无内边距
 * @param {React.CSSProperties} [props.iconStyle] - 图标样式
 *
 * @example
 * ```tsx
 * <ActionIconBox
 *   title="保存"
 *   onClick={() => console.log('保存')}
 *   type="primary"
 *   loading={false}
 * >
 *   <SaveIcon />
 * </ActionIconBox>
 * ```
 *
 * @returns {React.ReactElement} 渲染的操作图标盒子组件
 *
 * @remarks
 * - 支持加载状态显示
 * - 提供工具提示功能
 * - 支持键盘导航（Enter、空格键）
 * - 支持多种按钮类型
 * - 提供无障碍支持
 * - 支持自定义样式和类名
 * - 集成 Ant Design 组件
 * - 响应式交互设计
 */
export const ActionIconBox: React.FC<ActionIconBoxProps> = (props) => {
  const {
    children,
    showTitle,
    onClick,
    tooltipProps,
    title,
    type,
    transform,
    className,
    borderLess,
    loading: legacyLoading,
    isLoading,
    style,
    active,
    onInit,
    'data-testid': dataTestId,
    noPadding,
    iconStyle,
    onLoadingChange,
    theme,
  } = props;

  const propLoading = isLoading ?? legacyLoading;
  // 是否是受控 loading：受控时不再内部 setLoading，避免覆盖外部状态
  const isLoadingControlled = propLoading !== undefined;

  const [loading, setLoading] = useMergedState(false, {
    value: propLoading,
    onChange: onLoadingChange,
  });
  const [isHovered, setIsHovered] = useState(false);
  const keepNativeTitleFallback = useNativeTitleTooltipFallback();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor-action-icon-box');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  useEffect(() => {
    onInit?.();
    // onInit 仅在挂载时触发一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icon = useMemo(() => {
    if (loading) {
      return <LoadingOutlined style={iconStyle} />;
    }
    const element = isFunction(children) ? children(isHovered) : children;
    return renderIconChildren(element, iconStyle);
  }, [loading, isHovered, iconStyle, children]);

  // 抽出共用的交互处理函数，避免 Tooltip 与无 Tooltip 两个分支重复 60+ 行
  // 内部用 React.MouseEvent 签名以兼容历史调用方；键盘事件场景下传入的是
  // KeyboardEvent，runtime 仅会用到 preventDefault/stopPropagation，安全
  const triggerOnClick = async (e: React.MouseEvent) => {
    if (!onClick) return;
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    // 仅在非受控时由内部 setLoading；受控由外部决定
    if (!isLoadingControlled) setLoading(true);
    try {
      await onClick(e);
    } catch (error) {
      console.error('ActionIconBox onClick 错误:', error);
    } finally {
      if (!isLoadingControlled) setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    void triggerOnClick(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      void triggerOnClick(e as unknown as React.MouseEvent);
    }
  };

  const titleText = useMemo(() => {
    if (title === null || title === undefined) return undefined;
    return typeof title === 'string' ? title : undefined;
  }, [title]);

  const rootClassName = classNames(prefixCls, hashId, className, {
    [`${prefixCls}-danger`]: type === 'danger',
    [`${prefixCls}-primary`]: type === 'primary',
    [`${prefixCls}-border-less`]: borderLess,
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-transform`]: transform,
    [`${prefixCls}-${theme || 'light'}`]: theme || 'light',
    [`${prefixCls}-noPadding`]: noPadding,
  });

  const renderInner = (extraProps?: { 'data-title'?: string }) => (
    <span
      data-title={extraProps?.['data-title']}
      data-testid={dataTestId || 'action-icon-box'}
      role="button"
      tabIndex={0}
      aria-label={titleText}
      title={
        titleText === undefined
          ? undefined
          : extraProps && !keepNativeTitleFallback
            ? undefined
            : titleText
      }
      className={rootClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      {icon}
      {showTitle && (
        <span className={classNames(`${prefixCls}-title`, hashId)}>
          {title}
        </span>
      )}
    </span>
  );

  return wrapSSR(
    title ? (
      <Tooltip
        title={title}
        arrow={false}
        mouseEnterDelay={1}
        {...tooltipProps}
      >
        {renderInner({ 'data-title': titleText })}
      </Tooltip>
    ) : (
      renderInner()
    ),
  );
};
