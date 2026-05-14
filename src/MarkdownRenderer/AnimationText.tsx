import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_TEXT_SWAP_DURATION_MS,
  TEXT_SWAP_EASING,
} from '../Components/TextSwap/constants';
import { textSwapEnterAnimationForwards } from '../Components/TextSwap/textSwapMotion';

export interface AnimationConfig {
  /** 淡入动画持续时间（ms），默认与 TextSwap 一致 */
  fadeDuration?: number;
  /** 缓动函数，默认 ease-out */
  easing?: string;
  /**
   * 已废弃：单段入场动画模式下不再按 chunk 瘦身 DOM，保留仅为类型兼容
   * @deprecated
   */
  collapseThreshold?: number;
}

export interface AnimationTextProps {
  children: React.ReactNode;
  animationConfig?: AnimationConfig;
}

const extractText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractText(children.props.children);
  }
  return '';
};

/** 两串互为前缀关系（任一是另一方的前缀）：流式同一段内的增长或尾部截断修正 */
const arePrefixRelated = (prev: string, next: string) =>
  prev.startsWith(next) || next.startsWith(prev);

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

/** 流式文字淡入，前缀追加只触发一次入场，非前缀替换时重播 */
const AnimationText = React.memo<AnimationTextProps>(
  ({ children, animationConfig }) => {
    const {
      fadeDuration = DEFAULT_TEXT_SWAP_DURATION_MS,
      easing = TEXT_SWAP_EASING,
    } = animationConfig || {};
    const [animComplete, setAnimComplete] = useState(false);
    const [animSession, setAnimSession] = useState(0);
    const prevTextRef = useRef('');

    const text = extractText(children);

    useEffect(() => {
      if (text === prevTextRef.current) return;

      const prev = prevTextRef.current;

      if (!prev) {
        if (!text) return;
        prevTextRef.current = text;
        setAnimComplete(false);
        return;
      }

      if (arePrefixRelated(prev, text)) {
        prevTextRef.current = text;
        return;
      }

      setAnimComplete(false);
      setAnimSession((s) => s + 1);
      prevTextRef.current = text;
    }, [text]);

    const handleAnimationEnd = () => setAnimComplete(true);

    const animationStyle = useMemo(
      () => ({
        display: 'inline-block',
        animation: textSwapEnterAnimationForwards(fadeDuration, easing),
        willChange: 'opacity, transform, filter',
        color: 'inherit',
      }),
      [fadeDuration, easing],
    );

    const doneChunkStyle = useMemo(
      () => ({
        display: 'contents' as const,
      }),
      [],
    );

    if (prefersReducedMotion()) {
      return <span style={doneChunkStyle}>{children}</span>;
    }

    return animComplete ? (
      <span style={doneChunkStyle}>{children}</span>
    ) : (
      <span
        key={animSession}
        style={animationStyle}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </span>
    );
  },
);

AnimationText.displayName = 'AnimationText';

export default AnimationText;
