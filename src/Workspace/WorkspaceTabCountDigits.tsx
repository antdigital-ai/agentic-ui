import classNames from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

/** 与样式中 `--workspace-tab-count-digit-stagger` 一致（ms） */
const TAB_COUNT_DIGIT_STAGGER_MS = 70;

export interface WorkspaceTabCountDigitsProps {
  /** 与 Workspace 标签 `key` 一致，用于拼接稳定的 data-testid */
  tabKey: string;
  value: number;
  prefixCls: string;
  hashId?: string;
}

export const WorkspaceTabCountDigits: React.FC<
  WorkspaceTabCountDigitsProps
> = ({ tabKey, value, prefixCls, hashId }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const lastSerializedRef = useRef<string | null>(null);
  const digits = String(value).split('');

  useEffect(() => {
    const serialized = String(value);
    if (process.env.NODE_ENV === 'test') {
      lastSerializedRef.current = serialized;
      return;
    }
    if (lastSerializedRef.current === null) {
      lastSerializedRef.current = serialized;
      return;
    }
    if (lastSerializedRef.current === serialized) {
      return;
    }
    lastSerializedRef.current = serialized;
    setIsAnimating(false);
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => setIsAnimating(true));
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      if (innerRaf) {
        cancelAnimationFrame(innerRaf);
      }
    };
  }, [value]);

  return (
    <span
      aria-label={String(value)}
      className={classNames(
        `${prefixCls}-tab-count-digits`,
        hashId,
        isAnimating && `${prefixCls}-tab-count-digits--animating`,
      )}
      data-testid={`workspace-tab-count-digits--${tabKey}`}
    >
      {digits.map((ch, index) => (
        <span
          key={`${index}-${ch}`}
          className={classNames(`${prefixCls}-tab-count-digit`, hashId)}
          data-testid={`workspace-tab-count-digit--${tabKey}--${index}`}
          style={
            index > 0
              ? {
                  animationDelay: `${index * TAB_COUNT_DIGIT_STAGGER_MS}ms`,
                }
              : undefined
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
};

WorkspaceTabCountDigits.displayName = 'WorkspaceTabCountDigits';
