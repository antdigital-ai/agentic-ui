import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_TEXT_SWAP_DURATION_MS } from './constants';
import { useTextSwapStyle } from './style';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export interface TextSwapProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /**
   * When this value changes, the old content plays exit, then new `children` enter.
   */
  swapKey: string;
  children: React.ReactNode;
  /**
   * Exit + transition duration in ms. When set, updates `--text-swap-dur` and the internal timer.
   * @default 200
   */
  durationMs?: number;
  /** @default text-swap */
  'data-testid'?: string;
}

/**
 * Text content cross-fade with vertical motion (exit up, enter from below), blur, and opacity.
 * Respects `prefers-reduced-motion: reduce`.
 */
const TextSwapComponent: React.FC<TextSwapProps> = (props) => {
  const {
    swapKey,
    children,
    className,
    style,
    durationMs,
    'data-testid': dataTestId,
    ...rest
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('text-swap');
  const { hashId } = useTextSwapStyle(prefixCls);

  const resolvedDuration = durationMs ?? DEFAULT_TEXT_SWAP_DURATION_MS;

  const [displayKey, setDisplayKey] = useState(swapKey);
  const [displayContent, setDisplayContent] = useState(children);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enterStart'>('idle');

  const latestChildrenRef = useRef(children);
  latestChildrenRef.current = children;

  // While not transitioning (swapKey matches rendered key), always mirror latest children.
  useEffect(() => {
    if (swapKey !== displayKey) {
      return;
    }
    setDisplayContent(latestChildrenRef.current);
  }, [swapKey, displayKey, children]);

  useEffect(() => {
    if (swapKey === displayKey) {
      return;
    }

    if (prefersReducedMotion()) {
      setDisplayKey(swapKey);
      setDisplayContent(latestChildrenRef.current);
      setPhase('idle');
      return;
    }

    setPhase('exit');

    const timer = window.setTimeout(() => {
      setDisplayKey(swapKey);
      setDisplayContent(latestChildrenRef.current);
      setPhase('enterStart');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('idle');
        });
      });
    }, resolvedDuration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [swapKey, displayKey, resolvedDuration]);

  const mergedStyle: React.CSSProperties = {
    ...(durationMs !== undefined
      ? ({ '--text-swap-dur': `${durationMs}ms` } as React.CSSProperties)
      : {}),
    ...style,
  };

  return (
    <span
      {...rest}
      className={classNames(prefixCls, hashId, className, {
        [`${prefixCls}-exit`]: phase === 'exit',
        [`${prefixCls}-enter-start`]: phase === 'enterStart',
      })}
      style={mergedStyle}
      data-testid={dataTestId ?? 'text-swap'}
    >
      {displayContent}
    </span>
  );
};

export const TextSwap = memo(TextSwapComponent);

TextSwap.displayName = 'TextSwap';
