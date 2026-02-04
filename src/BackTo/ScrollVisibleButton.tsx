import { ConfigProvider, Tooltip, TooltipProps } from 'antd';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { isObject } from 'lodash-es';
import React, {
  forwardRef,
  isValidElement,
  useContext,
  useImperativeHandle,
} from 'react';
import {
  useScrollVisible,
  UseScrollVisibleProps,
} from './hooks/useScrollVisible';
import { prefixCls, useStyle } from './style';

const DEFAULT_VISIBLE_THRESHOLD = 400;

const getDefaultTarget = () => window;

const getShouldVisibleHandler = (
  propsShouldVisible: number | UseScrollVisibleProps['shouldVisible'],
): UseScrollVisibleProps['shouldVisible'] => {
  return (scrollTop, container) => {
    if (typeof propsShouldVisible === 'function') {
      return propsShouldVisible(scrollTop, container);
    }
    return scrollTop >= propsShouldVisible;
  };
};

const getTooltipProps = (
  tooltip: React.ReactNode | TooltipProps,
): TooltipProps => {
  if (isObject(tooltip) && !isValidElement(tooltip)) {
    return tooltip as TooltipProps;
  }
  return { title: tooltip };
};

const EXIT_ANIMATION = { opacity: 0 };

/**
 * ScrollVisibleButton 组件属性
 */
export interface ScrollVisibleButtonProps extends Omit<
  React.DOMAttributes<HTMLButtonElement>,
  'onClick'
> {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 提示信息 */
  tooltip?: React.ReactNode | TooltipProps;
  /** 滚动目标元素 */
  target?: () => HTMLElement | Window;
  /** 按钮显示条件 @default 400 */
  shouldVisible?: number | UseScrollVisibleProps['shouldVisible'];
  /** 点击回调 */
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement> | undefined,
    container: HTMLElement | Window,
  ) => void;
}

export type ScrollVisibleButtonRef = {
  nativeElement: HTMLButtonElement | null;
};

/**
 * ScrollVisibleButton 组件
 *
 * 根据滚动位置显示/隐藏的按钮，支持平滑动画效果
 *
 * @example
 * ```tsx
 * <ScrollVisibleButton
 *   tooltip="返回顶部"
 *   shouldVisible={400}
 *   onClick={handleClick}
 * >
 *   <ArrowUpIcon />
 * </ScrollVisibleButton>
 * ```
 */
export const ScrollVisibleButton = forwardRef<
  ScrollVisibleButtonRef,
  ScrollVisibleButtonProps
>(
  (
    {
      className,
      style,
      shouldVisible: propsShouldVisible = DEFAULT_VISIBLE_THRESHOLD,
      target,
      onClick,
      tooltip,
      children,
      ...rest
    },
    ref,
  ) => {
    const context = useContext(ConfigProvider.ConfigContext);
    const baseCls = context?.getPrefixCls(prefixCls);
    const { wrapSSR, hashId } = useStyle(baseCls);

    const internalRef = React.useRef<HTMLButtonElement | null>(null);

    useImperativeHandle(ref, () => ({
      nativeElement: internalRef.current,
    }));

    const getTarget = target || getDefaultTarget;
    const shouldVisible = getShouldVisibleHandler(propsShouldVisible);

    const { visible, currentContainer } = useScrollVisible({
      target: getTarget,
      shouldVisible,
    });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e, currentContainer.current);
    };

    const button = (
      <button
        ref={internalRef}
        className={classNames(baseCls, className, hashId)}
        style={style}
        type="button"
        onClick={handleClick}
        {...rest}
      >
        <div className={`${baseCls}-content ${hashId}`}>{children}</div>
      </button>
    );

    const buttonWithTooltip = tooltip ? (
      <Tooltip {...getTooltipProps(tooltip)}>{button}</Tooltip>
    ) : (
      button
    );

    return wrapSSR(
      <AnimatePresence>
        {visible && (
          <motion.div exit={EXIT_ANIMATION}>{buttonWithTooltip}</motion.div>
        )}
      </AnimatePresence>,
    );
  },
);
