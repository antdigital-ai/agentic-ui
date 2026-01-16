'use client';

import {
  motion,
  useInView,
  type Transition,
  type UseInViewOptions,
} from 'framer-motion';
import * as React from 'react';

const ENTRY_ANIMATION = {
  initial: { rotateX: 0 },
  animate: { rotateX: 90 },
};

const EXIT_ANIMATION = {
  initial: { rotateX: 90 },
  animate: { rotateX: 0 },
};

const formatCharacter = (char: string) => (char === ' ' ? '\u00A0' : char);

// 屏幕阅读器专用样式 (替代 Tailwind 的 sr-only)
const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
};

export type RollingTextProps = Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'children'
> & {
  transition?: Transition;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  text: string;
};

const RollingText = React.forwardRef<HTMLSpanElement, RollingTextProps>(
  (
    {
      transition = { duration: 0.5, delay: 0.1, ease: 'easeOut' },
      inView = false,
      inViewMargin = '0px',
      inViewOnce = true,
      text,
      style,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLSpanElement>(null);

    // 合并外部 ref 和内部 ref
    React.useImperativeHandle(ref, () => localRef.current!);

    const inViewResult = useInView(localRef, {
      once: inViewOnce,
      margin: inViewMargin,
    });
    const isInView = !inView || inViewResult;

    const characters = React.useMemo(() => text.split(''), [text]);

    // 循环控制：使用 key 来强制重新渲染动画
    const [animationKey, setAnimationKey] = React.useState(0);

    // 计算动画总时长（最后一个字符的 exit 动画完成时间）
    const transitionDuration =
      typeof transition === 'object' && 'duration' in transition
        ? transition.duration
        : 0.5;
    const transitionDelay =
      typeof transition === 'object' && 'delay' in transition
        ? transition.delay
        : 0.1;
    const totalDuration =
      transitionDuration +
      (characters.length - 1) * transitionDelay +
      0.3 + // exit delay
      transitionDuration; // exit duration

    // 动画完成后重新播放
    React.useEffect(() => {
      if (!isInView) return;

      const timer = setTimeout(
        () => {
          setAnimationKey((prev) => prev + 1);
        },
        totalDuration * 1000 + 500,
      ); // 动画总时长 + 500ms 等待

      return () => clearTimeout(timer);
    }, [isInView, animationKey, totalDuration]); // 当 animationKey 更新时，重新启动定时器

    return (
      <span
        ref={localRef}
        data-slot="rolling-text"
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          ...style,
        }}
        {...props}
      >
        {characters.map((char, idx) => (
          <span
            key={`${animationKey}-${idx}`}
            aria-hidden="true"
            style={{
              position: 'relative',
              display: 'inline-block',
              perspective: '1000px',
              transformStyle: 'preserve-3d',
              width: 'auto',
              height: '1em',
              lineHeight: '1em',
              overflow: 'hidden',
            }}
          >
            {/* 第一层文字 */}
            <motion.span
              key={`entry-${animationKey}-${idx}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'inline-block',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: '50% 25%',
                overflow: 'hidden',
                height: '1em',
                lineHeight: '1em',
              }}
              initial={ENTRY_ANIMATION.initial}
              animate={isInView ? ENTRY_ANIMATION.animate : undefined}
              transition={{
                ...transition,
                delay: idx * (transition?.delay ?? 0.1),
              }}
            >
              {formatCharacter(char)}
            </motion.span>

            {/* 第二层文字 */}
            <motion.span
              key={`exit-${animationKey}-${idx}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'inline-block',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: '50% 100%',
                overflow: 'hidden',
                height: '1em',
                lineHeight: '1em',
              }}
              initial={{ ...EXIT_ANIMATION.initial, y: '1px' }}
              animate={
                isInView
                  ? { ...EXIT_ANIMATION.animate, opacity: 1 }
                  : { ...EXIT_ANIMATION.initial, opacity: 0 }
              }
              transition={{
                ...transition,
                delay: idx * (transition?.delay ?? 0.1) + 0.3,
              }}
            >
              {formatCharacter(char)}
            </motion.span>

            {/* 占位符，用于撑起高度 */}
            <span
              style={{
                visibility: 'hidden',
                display: 'inline-block',
                height: '1em',
                lineHeight: '1em',
              }}
            >
              {formatCharacter(char)}
            </span>
          </span>
        ))}

        {/* 辅助功能：文本读取 */}
        <span style={srOnlyStyle}>{text}</span>
      </span>
    );
  },
);

RollingText.displayName = 'RollingText';

export { RollingText };
