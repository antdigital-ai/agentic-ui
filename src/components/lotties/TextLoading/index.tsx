import { ConfigProvider } from 'antd';
import cx from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

export interface TextLoadingProps {
  /**
   * 要显示的文本内容
   * @default "Loading..."
   */
  text?: string;
  /**
   * 是否禁用闪光动画
   * @default false
   */
  disabled?: boolean;
  /**
   * 主题模式
   * - light: 亮色主题（深色文字 + 亮色光泽）
   * - dark: 暗色主题（浅色文字 + 暗色光泽）
   * @default "light"
   */
  theme?: 'light' | 'dark';
  /**
   * 容器类名
   */
  className?: string;
  /**
   * 容器样式
   */
  style?: React.CSSProperties;
  /**
   * 字体大小
   * @example fontSize="16px"
   */
  fontSize?: number | string;
}

/**
 * 文字加载组件
 *
 * 使用CSS动画展示闪光文字效果的加载状态组件，支持自定义文本、样式和动画开关。
 *
 * @component
 * @example
 * // 基础用法
 * <TextLoading />
 *
 * @example
 * // 自定义文本
 * <TextLoading text="加载中..." />
 *
 * @example
 * // 自定义样式
 * <TextLoading
 *   text="正在处理"
 *   fontSize="20px"
 *   style={{ margin: '20px' }}
 * />
 *
 * @example
 * // 禁用动画
 * <TextLoading disabled={true} />
 *
 * @param props - 组件属性
 * @param props.text - 要显示的文本内容，默认为 "Loading..."
 * @param props.disabled - 是否禁用闪光动画，默认为 false
 * @param props.className - 容器类名
 * @param props.style - 容器自定义样式
 * @param props.fontSize - 字体大小
 * @returns 渲染的文字加载组件
 */
export const TextLoading: React.FC<TextLoadingProps> = ({
  text = 'Loading...',
  disabled = false,
  theme = 'light',
  className,
  style,
  fontSize,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-text-loading');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const containerStyle: React.CSSProperties = {
    fontSize,
    ...style,
  };

  return wrapSSR(
    <span
      className={cx(prefixCls, hashId, className, {
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-dark`]: theme === 'dark',
        [`${prefixCls}-light`]: theme === 'light',
      })}
      style={containerStyle}
      data-testid="text-loading"
      aria-label={text}
      role="status"
      aria-live="polite"
    >
      {text}
    </span>,
  );
};

export default TextLoading;
