import { ConfigProvider, Tooltip, TooltipProps } from 'antd';
import classNames from 'clsx';
import { isObject } from 'lodash-es';
import React, {
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
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

/**
 * ScrollVisibleButton 组件公开属性
 *
 * `shouldVisible` 是内部实现细节，由 BackTop / BackBottom 负责注入，
 * 不在公开 API 中暴露。
 */
export interface ScrollVisibleButtonProps extends Omit<
  React.DOMAttributes<HTMLButtonElement>,
  'onClick'
> {
  /** 自动化测试用按钮标识，未设置时默认与主题前缀一致 */
  'data-testid'?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 提示信息 */
  tooltip?: React.ReactNode | TooltipProps;
  /** 滚动目标元素 */
  target?: () => HTMLElement | Window;
  /** 点击回调 */
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement> | undefined,
    container: HTMLElement | Window,
  ) => void;
}

export type ScrollVisibleButtonRef = {
  nativeElement: HTMLButtonElement | null;
};

/** @internal 仅供 BackTop / BackBottom 内部透传 shouldVisible 使用，不对外暴露 */
type WithShouldVisible = ScrollVisibleButtonProps & {
  shouldVisible?: number | UseScrollVisibleProps['shouldVisible'];
};

/**
 * ScrollVisibleButton 组件
 *
 * 根据滚动位置显示/隐藏的按钮，支持平滑动画效果。
 * 注意：shouldVisible 是内部实现细节，请使用 BackTo.Top / BackTo.Bottom。
 *
 * @example
 * ```tsx
 * <BackTo.Top tooltip="返回顶部" />
 * <BackTo.Bottom tooltip="去底部" />
 * ```
 */
export const ScrollVisibleButton = forwardRef<
  ScrollVisibleButtonRef,
  ScrollVisibleButtonProps
>(
  (props, ref) => {
    // shouldVisible 是内部 prop，不在公开类型中暴露，通过内部类型读取
    const {
      className,
      style,
      shouldVisible: propsShouldVisible = DEFAULT_VISIBLE_THRESHOLD,
      target,
      onClick,
      tooltip,
      children,
      'data-testid': dataTestId,
      ...rest
    } = props as WithShouldVisible;
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

    // 显隐动画：presence wrapper 始终保留在 DOM 中（fixed 定位，完全脱离文档流），
    // 只通过 opacity + pointer-events 切换显隐，避免挂载/卸载触发文档流重排导致页面跳动。
    const [dataState, setDataState] = useState<'enter' | 'exit'>(
      visible ? 'enter' : 'exit',
    );

    useEffect(() => {
      if (visible) {
        // 下一帧切到 enter，确保浏览器已完成一次 layout 后再触发 opacity 过渡
        const raf = requestAnimationFrame(() => setDataState('enter'));
        return () => cancelAnimationFrame(raf);
      }
      setDataState('exit');
      return undefined;
    }, [visible]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e, currentContainer.current);
    };

    const button = (
      <button
        ref={internalRef}
        className={classNames(baseCls, className, hashId)}
        data-testid={dataTestId ?? baseCls}
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

    // presence wrapper 始终挂载（position:fixed 脱离文档流），不会触发布局重排
    return wrapSSR(
      <>
        <div
          className={`${baseCls}-presence ${hashId}`}
          data-state={dataState}
        >
          {buttonWithTooltip}
        </div>
      </>,
    );
  },
);
