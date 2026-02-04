import React, { forwardRef, memo, useCallback } from 'react';
import { getScrollRailHeight } from '../Utils/getScroll';
import scrollTo from '../Utils/scrollTo';
import { BottomIcon } from './icons/BottomIcon';
import {
  ScrollVisibleButton,
  ScrollVisibleButtonProps,
  ScrollVisibleButtonRef,
} from './ScrollVisibleButton';

// 常量定义
const DEFAULT_DURATION = 450;
const DEFAULT_VISIBLE_THRESHOLD = 400;

/**
 * BackBottom 组件属性接口
 * @interface BackBottomProps
 */
export interface BackBottomProps extends ScrollVisibleButtonProps {
  /**
   * 滚动到底部的持续时间
   * @default 450
   */
  duration?: number;
}

/**
 * BackBottom 组件 - 返回底部按钮组件
 *
 * 该组件提供一个返回底部的浮动按钮，点击后平滑滚动到页面底部。
 * 当距离底部超过指定阈值时自动显示，支持自定义滚动持续时间和显示条件。
 *
 * @component
 * @description 返回底部按钮，点击后平滑滚动到页面底部
 * @param {BackBottomProps} props - 组件属性
 * @param {number} [props.duration=450] - 滚动到底部的持续时间（毫秒）
 * @param {number | ((scrollTop: number, container: HTMLElement | Window) => boolean)} [props.shouldVisible=400] - 显示条件阈值或自定义函数
 * @param {(e: React.MouseEvent, container: HTMLElement | Window) => void} [props.onClick] - 点击回调函数
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {HTMLElement | Window} [props.target] - 滚动容器，默认为 window
 *
 * @example
 * ```tsx
 * // 基本用法
 * <BackBottom />
 *
 * // 自定义滚动持续时间
 * <BackBottom duration={300} />
 *
 * // 自定义显示阈值
 * <BackBottom shouldVisible={600} />
 *
 * // 自定义显示条件
 * <BackBottom
 *   shouldVisible={(scrollTop, container) => {
 *     const scrollHeight = container instanceof Window
 *       ? document.documentElement.scrollHeight
 *       : container.scrollHeight;
 *     return scrollHeight - scrollTop >= 800;
 *   }}
 * />
 *
 * // 指定滚动容器
 * <BackBottom target={document.getElementById('container')} />
 * ```
 *
 * @returns {React.ReactElement} 渲染的返回底部按钮组件
 *
 * @remarks
 * - 默认在距离底部超过 400px 时显示
 * - 支持平滑滚动动画
 * - 可自定义滚动持续时间
 * - 支持自定义显示条件
 * - 支持指定滚动容器
 * - 使用 forwardRef 支持 ref 传递
 * - 提供完整的无障碍支持
 */
const BackBottomComponent = forwardRef<ScrollVisibleButtonRef, BackBottomProps>(
  (props, ref) => {
    const {
      duration = DEFAULT_DURATION,
      onClick,
      shouldVisible: propsShouldVisible,
      ...rest
    } = props;

    const shouldVisible = useCallback<
      (scrollTop: number, container: HTMLElement | Window) => boolean
    >(
      (scrollTop, container) => {
        if (typeof propsShouldVisible === 'function') {
          return propsShouldVisible(scrollTop, container);
        }
        const scrollRailHeight = getScrollRailHeight(container);
        return (
          scrollRailHeight - scrollTop >=
          (propsShouldVisible ?? DEFAULT_VISIBLE_THRESHOLD)
        );
      },
      [propsShouldVisible],
    );

    // 使用 useCallback 优化滚动到底部处理函数
    const scrollToBottom = useCallback<
      (
        e: React.MouseEvent<HTMLButtonElement> | undefined,
        container: HTMLElement | Window,
      ) => void
    >(
      (e, container) => {
        const scrollRailHeight = getScrollRailHeight(container);
        scrollTo(scrollRailHeight, { container, duration });
        onClick?.(e, container);
      },
      [duration, onClick],
    );

    return (
      <ScrollVisibleButton
        {...rest}
        ref={ref}
        shouldVisible={shouldVisible}
        onClick={scrollToBottom}
      >
        <BottomIcon />
      </ScrollVisibleButton>
    );
  },
);

BackBottomComponent.displayName = 'BackBottom';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const BackBottom = memo(BackBottomComponent);
