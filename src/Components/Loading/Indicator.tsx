import { Progress, ProgressProps } from 'antd';
import React, { cloneElement } from 'react';
import { LoadingLottie, LoadingLottieProps } from '../lotties/LoadingLottie';

/**
 * Indicator 组件属性
 * @description 加载指示器组件的配置属性，用于控制指示器的显示方式和大小
 */
export interface IndicatorProps extends Pick<LoadingLottieProps, 'size'> {
  /**
   * 自定义加载指示器
   * @description 自定义加载动画的显示内容，可以是 ReactNode 或自定义组件
   * @example
   * ```tsx
   * <Indicator indicator={<CustomSpinner />} />
   * ```
   */
  indicator?: React.ReactNode;

  /**
   * 加载进度百分比
   * @description 显示加载进度（0-100），当提供此值时，会显示进度圆环而不是默认的动画
   * @example
   * ```tsx
   * <Indicator percent={75} size={64} />
   * ```
   */
  percent?: number;

  /**
   * 自定义 CSS 样式
   */
  style?: React.CSSProperties;
}

const defaultStrokeColor: ProgressProps['strokeColor'] = {
  '0%': '#09D6FF',
  '28%': '#9BA0FF',
  '38%': '#D7B9FF',
  '42%': '#FFFFFF',
  '52%': '#23E800',
  '100%': '#23E800',
};

/**
 * Indicator 组件 - 加载指示器
 *
 * 根据配置显示不同的加载指示器：
 * - 如果提供了自定义 indicator，则显示自定义指示器
 * - 如果提供了 percent，则显示进度圆环
 * - 否则显示默认的 LoadingLottie 动画
 *
 * @component
 * @description 加载指示器组件，支持自定义指示器、进度显示和默认动画
 *
 * @param {IndicatorProps} props - 组件属性
 * @param {string | number} [props.size] - 指示器的大小，可以是数字（像素）或字符串（如 '1em'），继承自 LoadingLottieProps
 * @param {React.ReactNode} [props.indicator] - 自定义加载指示器
 * @param {number} [props.percent] - 加载进度百分比（0-100）
 *
 * @example
 * ```tsx
 * // 默认动画
 * <Indicator size={64} />
 *
 * // 显示进度
 * <Indicator percent={75} size={64} />
 *
 * // 自定义指示器
 * <Indicator indicator={<CustomSpinner />} />
 * ```
 *
 * @returns {React.ReactElement} 渲染的加载指示器组件
 */
function Indicator({ indicator, percent, size, style }: IndicatorProps) {
  if (indicator && React.isValidElement(indicator)) {
    return cloneElement(indicator, (currentProps: any) => ({
      style: { ...currentProps.style, ...style },
      percent,
    }));
  }

  if (percent !== undefined && percent !== null) {
    return (
      <Progress
        type="circle"
        percent={percent}
        strokeColor={defaultStrokeColor}
        // TODO：Progress 不适用 1em 的 size
        // @ts-ignore
        size={size}
        showInfo={false}
        strokeWidth={12}
        style={style}
      />
    );
  }

  return <LoadingLottie size={size} style={style} />;
}

export default Indicator;
