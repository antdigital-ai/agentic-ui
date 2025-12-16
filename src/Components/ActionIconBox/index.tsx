import { LoadingOutlined } from '@ant-design/icons';
import { ConfigProvider, Tooltip, TooltipProps } from 'antd';
import cx from 'classnames';
import { useMergedState } from 'rc-util';
import React, { useContext, useEffect, useMemo } from 'react';
import { useStyle } from './style';

export type ActionIconBoxProps = {
  children: React.ReactNode;
  showTitle?: boolean;
  onClick?: (e: any) => void;
  tooltipProps?: TooltipProps;
  title?: React.ReactNode;
  type?: 'danger' | 'primary';
  transform?: boolean;
  className?: string;
  borderLess?: boolean;
  /**
   * @deprecated 请使用 isLoading 代替
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
};
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
  const propLoading = props.isLoading ?? props.loading;
  const [loading, setLoading] = useMergedState(false, {
    value: propLoading,
    onChange: props.onLoadingChange,
  });
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor-action-icon-box');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  useEffect(() => {
    props.onInit?.();
  }, []);

  const icon = useMemo(() => {
    if (loading) {
      return <LoadingOutlined style={props.iconStyle} />;
    }

    // 处理单个子元素的情况
    if (React.isValidElement(props.children)) {
      try {
        return React.cloneElement(props.children as any, {
          // @ts-ignore
          ...props?.children?.props,
          style: {
            // @ts-ignore
            ...props?.children?.props?.style,
            ...props.iconStyle,
          },
        });
      } catch (error) {
        console.error('ActionIconBox: 克隆元素时出错', error);
        return props.children;
      }
    }

    // 处理多个子元素的情况
    try {
      return React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            // @ts-ignore
            ...child?.props,
            style: {
              // @ts-ignore
              ...child?.props?.style,
              ...props.iconStyle,
            },
          });
        }
        return child;
      });
    } catch (error) {
      console.error('ActionIconBox: 处理子元素时出错', error);
      return props.children;
    }
  }, [loading, props.loading, props.iconStyle, props.children]);

  return wrapSSR(
    props.title ? (
      <Tooltip
        title={props.title}
        arrow={false}
        mouseEnterDelay={1}
        {...props.tooltipProps}
      >
        <span
          data-title={props.title?.toString()}
          data-testid={props['data-testid'] || 'action-icon-box'}
          role="button"
          tabIndex={0}
          aria-label={props.title?.toString()}
          className={cx(prefixCls, hashId, props.className, {
            [`${prefixCls}-danger`]: props.type === 'danger',
            [`${prefixCls}-primary`]: props.type === 'primary',
            [`${prefixCls}-border-less`]: props.borderLess,
            [`${prefixCls}-active`]: props.active,
            [`${prefixCls}-transform`]: props.transform,
            [`${prefixCls}-${props.theme || 'light'}`]: props.theme || 'light',
            [`${prefixCls}-noPadding`]: props.noPadding,
          })}
          onClick={async (e) => {
            e.preventDefault();
            if (!props.onClick) return;
            if (loading) return;
            setLoading(true);
            try {
              await props.onClick?.(e as any);
            } catch (error) {
              console.error('ActionIconBox onClick 错误:', error);
            } finally {
              setLoading(false);
            }
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!props.onClick) return;
              if (loading) return;
              setLoading(true);
              try {
                await props.onClick(e as any);
              } catch (error) {
                console.error('ActionIconBox onKeyDown 错误:', error);
              } finally {
                setLoading(false);
              }
            }
          }}
          style={props.style}
        >
          {icon}
          {props.showTitle && (
            <span className={`${prefixCls}-title ${hashId}`}>
              {props.title}
            </span>
          )}
        </span>
      </Tooltip>
    ) : (
      <span
        data-testid={props['data-testid'] || 'action-icon-box'}
        role="button"
        tabIndex={0}
        aria-label={props.title?.toString()}
        title={props.title?.toString()}
        className={cx(prefixCls, hashId, props.className, {
          [`${prefixCls}-danger`]: props.type === 'danger',
          [`${prefixCls}-primary`]: props.type === 'primary',
          [`${prefixCls}-border-less`]: props.borderLess,
          [`${prefixCls}-active`]: props.active,
          [`${prefixCls}-transform`]: props.transform,
          [`${prefixCls}-${props.theme || 'light'}`]: props.theme || 'light',
          [`${prefixCls}-noPadding`]: props.noPadding,
        })}
        onClick={async (e) => {
          e.preventDefault();
          if (!props.onClick) return;
          if (loading) return;
          setLoading(true);
          try {
            await props.onClick?.(e as any);
          } catch (error) {
            console.error('ActionIconBox onClick 错误:', error);
          } finally {
            setLoading(false);
          }
        }}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!props.onClick) return;
            if (loading) return;
            setLoading(true);
            try {
              await props.onClick(e as any);
            } catch (error) {
              console.error('ActionIconBox onKeyDown 错误:', error);
            } finally {
              setLoading(false);
            }
          }
        }}
        style={props.style}
      >
        {icon}
        {props.showTitle && (
          <span className={`${prefixCls}-title ${hashId}`}>{props.title}</span>
        )}
      </span>
    ),
  );
};
