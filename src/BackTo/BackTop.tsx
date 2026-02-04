import React, { forwardRef, memo, useCallback } from 'react';
import scrollTo from '../Utils/scrollTo';
import {
  ScrollVisibleButton,
  ScrollVisibleButtonProps,
  ScrollVisibleButtonRef,
} from './ScrollVisibleButton';
import { TopIcon } from './icons/TopIcon';

// 常量定义
const DEFAULT_DURATION = 450;
const DEFAULT_VISIBLE_THRESHOLD = 400;

const getShouldVisible = (
  propsShouldVisible: BackTopProps['shouldVisible'],
) => {
  return (scrollTop: number, container: HTMLElement | Window): boolean => {
    if (typeof propsShouldVisible === 'function') {
      return propsShouldVisible(scrollTop, container);
    }
    return scrollTop >= (propsShouldVisible ?? DEFAULT_VISIBLE_THRESHOLD);
  };
};

/**
 * BackTop 组件属性
 */
export interface BackTopProps extends ScrollVisibleButtonProps {
  /** 滚动到顶部的持续时间 @default 450 */
  duration?: number;
}

/**
 * BackTop 组件 - 返回顶部按钮组件
 *
 * 该组件提供一个返回顶部的浮动按钮，点击后平滑滚动到页面顶部。
 * 当滚动距离超过指定阈值时自动显示，支持自定义滚动持续时间和显示条件。
 *
 * @component
 * @description 返回顶部按钮，点击后平滑滚动到页面顶部
 * @param {BackTopProps} props - 组件属性
 * @param {number} [props.duration=450] - 滚动到顶部的持续时间（毫秒）
 * @param {number | ((scrollTop: number, container: HTMLElement | Window) => boolean)} [props.shouldVisible=400] - 显示条件阈值或自定义函数
 * @param {(e: React.MouseEvent, container: HTMLElement | Window) => void} [props.onClick] - 点击回调函数
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {HTMLElement | Window} [props.target] - 滚动容器，默认为 window
 *
 * @example
 * ```tsx
 * // 基本用法
 * <BackTop />
 *
 * // 自定义滚动持续时间
 * <BackTop duration={300} />
 *
 * // 自定义显示阈值
 * <BackTop shouldVisible={600} />
 *
 * // 自定义显示条件
 * <BackTop
 *   shouldVisible={(scrollTop) => scrollTop > 500}
 * />
 *
 * // 指定滚动容器
 * <BackTop target={document.getElementById('container')} />
 * ```
 *
 * @returns {React.ReactElement} 渲染的返回顶部按钮组件
 *
 * @remarks
 * - 默认在滚动距离超过 400px 时显示
 * - 支持平滑滚动动画
 * - 可自定义滚动持续时间
 * - 支持自定义显示条件
 * - 支持指定滚动容器
 * - 使用 forwardRef 支持 ref 传递
 * - 提供完整的无障碍支持
 */
const BackTopComponent = forwardRef<ScrollVisibleButtonRef, BackTopProps>(
  (props, ref) => {
    const {
      duration = DEFAULT_DURATION,
      onClick,
      shouldVisible: propsShouldVisible,
      ...rest
    } = props;

    const shouldVisible = getShouldVisible(propsShouldVisible);

    // 使用 useCallback 优化点击处理函数
    const handleClick = useCallback(
      (
        e: React.MouseEvent<HTMLButtonElement> | undefined,
        container: HTMLElement | Window,
      ) => {
        scrollTo(0, { container, duration });
        onClick?.(e, container);
      },
      [duration, onClick],
    );

    return (
      <ScrollVisibleButton
        {...rest}
        ref={ref}
        shouldVisible={shouldVisible}
        onClick={handleClick}
      >
        <TopIcon />
      </ScrollVisibleButton>
    );
  },
);

BackTopComponent.displayName = 'BackTop';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const BackTop = memo(BackTopComponent);
