import classNames from 'classnames';
import React from 'react';
import type { ChartClassNames, ChartStyles } from '../../types/classNames';
import ChartErrorBoundary from './ChartErrorBoundary';
import { useStyle } from './style';

export interface ChartContainerProps {
  /** 自定义CSS类名 */
  className?: string;

  /** 样式对象 */
  style?: React.CSSProperties;
  /** 图表主题 */
  theme?: 'light' | 'dark';
  /** 是否为移动端 */
  isMobile?: boolean;
  /** 图表变体 */
  variant?: 'outline' | 'borderless';

  /** 错误边界配置 */
  errorBoundary?: {
    /** 是否启用错误边界 */
    enabled?: boolean;
    /** 错误时的回退UI */
    fallback?: React.ReactNode;
    /** 错误回调函数 */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  };
  loading?: boolean;
  /** 自定义CSS类名（支持对象格式，为每层DOM设置类名） */
  classNames?: ChartClassNames;
  /** 自定义样式对象（支持对象格式，为每层DOM设置样式） */
  styles?: ChartStyles;
}

export interface ChartContainerRef {
  hashId: string;
}

/**
 * ChartContainer 组件 - 图表容器组件
 *
 * 该组件用于统一管理图表组件的 className 逻辑，包括 baseClassName、hashId 和自定义 className 的组合。
 * 提供一致的样式管理、SSR 支持和错误边界保护。
 *
 * @component
 * @description 图表容器组件，统一管理图表组件的样式类名和错误处理
 * @param {ChartContainerProps} props - 组件属性
 * @param {string} props.baseClassName - 基础类名
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.ReactNode} props.children - 子元素
 * @param {React.CSSProperties} [props.style] - 样式对象
 * @param {'light' | 'dark'} [props.theme='light'] - 图表主题
 * @param {boolean} [props.isMobile=false] - 是否为移动端
 * @param {object} [props.errorBoundary] - 错误边界配置
 * @param {boolean} [props.errorBoundary.enabled=true] - 是否启用错误边界
 * @param {React.ReactNode} [props.errorBoundary.fallback] - 错误时的回退UI
 * @param {function} [props.errorBoundary.onError] - 错误回调函数
 * @param {boolean} [props.errorBoundary.showError] - 是否显示错误详情
 *
 * @example
 * ```tsx
 * // 基础使用
 * <ChartContainer
 *   baseClassName="area-chart-container"
 *   className="custom-chart"
 *   theme="light"
 *   isMobile={false}
 *   style={{ width: 600, height: 400 }}
 * >
 *   <div>图表内容</div>
 * </ChartContainer>
 *
 * // 自定义错误边界
 * <ChartContainer
 *   baseClassName="line-chart-container"
 *   errorBoundary={{
 *     enabled: true,
 *     fallback: <div>自定义错误提示</div>,
 *     onError: (error, errorInfo) => {
 *       console.error('图表错误:', error);
 *       // 上报错误到监控系统
 *     },
 *     showError: true
 *   }}
 * >
 *   <MyChart />
 * </ChartContainer>
 *
 * // 禁用错误边界
 * <ChartContainer
 *   baseClassName="pie-chart-container"
 *   errorBoundary={{ enabled: false }}
 * >
 *   <PieChart />
 * </ChartContainer>
 * ```
 *
 * @returns {React.ReactElement} 渲染的图表容器组件
 *
 * @remarks
 * - 自动处理 baseClassName、hashId 和自定义 className 的组合
 * - 提供 SSR 支持
 * - 支持样式隔离
 * - 统一的样式管理
 * - 内置错误边界保护，防止图表错误影响整个应用
 * - 错误边界默认启用，可通过配置禁用或自定义
 */
const ChartContainer: React.FC<
  ChartContainerProps & {
    baseClassName: string;
    /** 子元素 */
    children: React.ReactNode;
    role?: string;
  }
> = ({
  baseClassName,
  className,
  children,
  style,
  classNames: classNamesProp,
  styles: stylesProp,
  theme = 'light',
  variant = 'default',
  isMobile = false,
  errorBoundary = { enabled: true },
  ...restProps
}) => {
  const { wrapSSR, hashId } = useStyle(baseClassName);

  // 构建动态类名
  const combinedClassName = classNames(
    baseClassName,
    hashId,
    theme === 'light' && `${baseClassName}-light-theme`,
    theme === 'dark' && `${baseClassName}-dark-theme`,
    isMobile && `${baseClassName}-mobile`,
    !isMobile && `${baseClassName}-desktop`,
    variant === 'outline' && `${baseClassName}-outline`,
    variant === 'borderless' && `${baseClassName}-borderless`,
    className,
    classNamesProp?.root,
  );

  const combinedStyle = {
    ...style,
    ...stylesProp?.root,
  };

  const containerContent = (
    <div className={combinedClassName} style={combinedStyle} {...restProps}>
      {children}
    </div>
  );

  // 如果启用了错误边界，则包装内容
  if (errorBoundary?.enabled !== false) {
    return wrapSSR(
      <ChartErrorBoundary
        fallback={errorBoundary?.fallback}
        onError={errorBoundary?.onError}
      >
        {containerContent}
      </ChartErrorBoundary>,
    );
  }

  return wrapSSR(containerContent);
};

export default ChartContainer;
