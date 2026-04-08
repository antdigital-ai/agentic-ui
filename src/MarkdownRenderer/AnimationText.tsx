import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface AnimationConfig {
  /** 淡入动画持续时间（ms），默认 250 */
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

/**
 * 提取 React children 的纯文本
 */
const extractText = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractText(children.props.children);
  }
  return '';
};

/** 流式同一段内：前后文案仅「前缀关系」变化（增长或尾部截断修正） */
const isStreamingCompatible = (prev: string, next: string) =>
  prev.startsWith(next) || next.startsWith(prev);

/**
 * 流式文字淡入动画组件。
 *
 * 同一段流式前缀追加（或尾部截断修正）只触发一次入场动画；非前缀替换时重播。
 */
const AnimationText = React.memo<AnimationTextProps>(
  ({ children, animationConfig }) => {
    const { fadeDuration = 250, easing = 'ease-out' } = animationConfig || {};
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

      if (isStreamingCompatible(prev, text)) {
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
        animation: `markdownRendererSlideFadeIn ${fadeDuration}ms ${easing} forwards`,
        willChange: 'opacity, transform',
        color: 'inherit',
      }),
      [fadeDuration, easing],
    );

    const doneChunkStyle = useMemo(
      () => ({
        display: 'inline-block' as const,
        color: 'inherit',
      }),
      [],
    );

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
