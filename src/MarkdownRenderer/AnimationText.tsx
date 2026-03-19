import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface AnimationConfig {
  /** 淡入动画持续时间（ms），默认 200 */
  fadeDuration?: number;
  /** 缓动函数，默认 ease-in-out */
  easing?: string;
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

/**
 * 流式文字淡入动画组件。
 *
 * 移植自 @ant-design/x-markdown 的 AnimationText。
 * 追踪 children 的文本变化，只给新增的部分加淡入动画 span，
 * 已有的部分保持不动——不会触发整段重绘。
 *
 * 仅对纯文本增量有效；如果内容不是简单追加（删除/替换），直接替换所有 chunks。
 */
const AnimationText = React.memo<AnimationTextProps>(
  ({ children, animationConfig }) => {
    const { fadeDuration = 200, easing = 'ease-in-out' } =
      animationConfig || {};
    const [chunks, setChunks] = useState<React.ReactNode[]>([]);
    const prevTextRef = useRef('');

    const text = extractText(children);

    useEffect(() => {
      if (text === prevTextRef.current) return;

      if (!prevTextRef.current || !text.startsWith(prevTextRef.current)) {
        setChunks([children]);
        prevTextRef.current = text;
        return;
      }

      const prevLen = prevTextRef.current.length;
      setChunks((prev) => [...prev, text.slice(prevLen)]);
      prevTextRef.current = text;
    }, [text, children]);

    const animationStyle = useMemo(
      () => ({
        animation: `markdownRendererFadeIn ${fadeDuration}ms ${easing} forwards`,
        willChange: 'opacity',
        color: 'inherit',
      }),
      [fadeDuration, easing],
    );

    return (
      <>
        {chunks.map((chunk, index) => (
          <span style={animationStyle} key={`anim-${index}`}>
            {chunk}
          </span>
        ))}
      </>
    );
  },
);

AnimationText.displayName = 'AnimationText';

export default AnimationText;
