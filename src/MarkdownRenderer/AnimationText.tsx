import React, { useEffect, useMemo, useRef, useState } from 'react';

/** 仅保留最近 N 个字符带 span 动画，其余合并为纯文本以瘦身 DOM */
const DEFAULT_COLLAPSE_THRESHOLD = 50;

export interface AnimationConfig {
  /** 淡入动画持续时间（ms），默认 250 */
  fadeDuration?: number;
  /** 缓动函数，默认 ease-out */
  easing?: string;
  /** 仅保留最近 N 字的 span，其余动画结束后合并为纯文本，默认 50，0 表示不瘦身 */
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

interface ChunkState {
  key: string;
  text: string;
  /** 富文本内容（重置时保留），否则用 text */
  content?: React.ReactNode;
  /** 是否已完成动画，可合并为纯文本 */
  done: boolean;
}

/**
 * 流式文字淡入动画组件。
 *
 * 采用 opacity + translateY（GPU 硬件加速），清爽流派。
 * 动画结束后通过 animationend 移除 span，合并为纯文本，实现 DOM 瘦身。
 */
const AnimationText = React.memo<AnimationTextProps>(
  ({ children, animationConfig }) => {
    const {
      fadeDuration = 250,
      easing = 'ease-out',
      collapseThreshold = DEFAULT_COLLAPSE_THRESHOLD,
    } = animationConfig || {};
    const [chunks, setChunks] = useState<ChunkState[]>([]);
    const prevTextRef = useRef('');

    const text = extractText(children);

    useEffect(() => {
      if (text === prevTextRef.current) return;

      if (!prevTextRef.current || !text.startsWith(prevTextRef.current)) {
        setChunks([{ key: '0', text, content: children, done: false }]);
        prevTextRef.current = text;
        return;
      }

      const prevLen = prevTextRef.current.length;
      const newText = text.slice(prevLen);
      const newKey = `anim-${Date.now()}-${prevLen}`;
      setChunks((prev) => [...prev, { key: newKey, text: newText, done: false }]);
      prevTextRef.current = text;
    }, [text, children]);

    const handleAnimationEnd = (key: string) => {
      setChunks((prev) =>
        prev.map((c) => (c.key === key ? { ...c, done: true } : c)),
      );
    };

    const animationStyle = useMemo(
      () => ({
        display: 'inline-block',
        animation: `markdownRendererSlideFadeIn ${fadeDuration}ms ${easing} forwards`,
        willChange: 'opacity, transform',
        color: 'inherit',
      }),
      [fadeDuration, easing],
    );

    const threshold = collapseThreshold > 0 ? collapseThreshold : Infinity;
    let charCount = 0;
    const staticParts: string[] = [];
    const animatingParts: ChunkState[] = [];

    for (let i = chunks.length - 1; i >= 0; i--) {
      const c = chunks[i];
      if (c.done && charCount >= threshold) {
        staticParts.unshift(c.text);
      } else {
        charCount += c.text.length;
        animatingParts.unshift(c);
      }
    }

    return (
      <>
        {staticParts.length > 0 && staticParts.join('')}
        {animatingParts.map((chunk) => {
          const rendered = chunk.content ?? chunk.text;
          return chunk.done ? (
            <React.Fragment key={chunk.key}>{rendered}</React.Fragment>
          ) : (
            <span
              key={chunk.key}
              style={animationStyle}
              onAnimationEnd={() => handleAnimationEnd(chunk.key)}
            >
              {rendered}
            </span>
          );
        })}
      </>
    );
  },
);

AnimationText.displayName = 'AnimationText';

export default AnimationText;
