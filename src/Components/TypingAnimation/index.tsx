import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { isString } from 'lodash-es';
import React, {
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { resolveSegments } from '../TextAnimate';
import { useTypingAnimationStyle } from './style';

/**
 * TypingAnimation 组件 props。
 *
 * 历史上继承自 framer-motion `MotionProps`，去除 framer-motion 后改为继承
 * 原生 HTML 属性子集（仅保留实际使用的 className/style 等），并允许任意
 * 透传到底层元素，避免破坏外部调用。
 */
export interface TypingAnimationProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: React.ReactNode;
  words?: string[];
  className?: string;
  duration?: number;
  typeSpeed?: number;
  deleteSpeed?: number;
  delay?: number;
  pauseDelay?: number;
  loop?: boolean;
  as?: React.ElementType;
  startOnView?: boolean;
  showCursor?: boolean;
  blinkCursor?: boolean;
  cursorStyle?: 'line' | 'block' | 'underscore';
}

/**
 * 等价 framer-motion 的 useInView({ amount: 0.3, once: true })。
 *
 * 使用原生 IntersectionObserver 实现：
 * - threshold: 0.3 → 元素至少 30% 可见时触发
 * - once: true → 触发后立即断开 observer，不再回退为 false
 * - SSR/无 IntersectionObserver 环境下默认返回 true（与原行为兼容，
 *   避免在测试或老旧环境中动画永不开始）
 */
function useInViewOnce(ref: React.RefObject<Element>, amount: number): boolean {
  const [inView, setInView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (typeof IntersectionObserver === 'undefined') return true;
    return false;
  });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      // 环境不支持时直接置为 true，等价 framer-motion 的 fallback 行为
      setInView(true);
      return;
    }
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: amount },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [ref, amount]);

  return inView;
}

const TypingAnimationBase = ({
  children,
  words,
  className,
  duration = 100,
  typeSpeed,
  deleteSpeed,
  delay = 0,
  pauseDelay = 1000,
  loop = false,
  as: Component = 'span',
  startOnView = true,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = 'line',
  ...props
}: TypingAnimationProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('typing-animation');
  const { hashId } = useTypingAnimationStyle(prefixCls);

  const [displayedText, setDisplayedText] = useState<React.ReactNode[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const elementRef = useRef<HTMLElement | null>(null);
  // 等价 framer-motion 的 useInView({ amount: 0.3, once: true })
  const isInView = useInViewOnce(elementRef, 0.3);

  const wordsToAnimate = useMemo(
    () => words || [resolveSegments(children, 'character')],
    [words, children],
  );
  const hasMultipleWords = wordsToAnimate.length > 1;

  const typingSpeed = typeSpeed || duration;
  const deletingSpeed = deleteSpeed || typingSpeed / 2;

  const shouldStart = startOnView ? isInView : true;

  useEffect(() => {
    if (!shouldStart || wordsToAnimate.length === 0) return;

    const timeoutDelay =
      delay > 0 && displayedText.length === 0
        ? delay
        : phase === 'typing'
          ? typingSpeed
          : phase === 'deleting'
            ? deletingSpeed
            : pauseDelay;

    const timeout = setTimeout(() => {
      const currentWord = wordsToAnimate[currentWordIndex] || '';
      const graphemes = isString(currentWord)
        ? Array.from(currentWord)
        : currentWord;

      switch (phase) {
        case 'typing':
          if (currentCharIndex < graphemes.length) {
            setDisplayedText(graphemes.slice(0, currentCharIndex + 1));
            setCurrentCharIndex(currentCharIndex + 1);
          } else {
            if (hasMultipleWords || loop) {
              const isLastWord = currentWordIndex === wordsToAnimate.length - 1;
              if (!isLastWord || loop) {
                setPhase('pause');
              }
            }
          }
          break;

        case 'pause':
          setPhase('deleting');
          break;

        case 'deleting':
          if (currentCharIndex > 0) {
            setDisplayedText(graphemes.slice(0, currentCharIndex - 1));
            setCurrentCharIndex(currentCharIndex - 1);
          } else {
            const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length;
            setCurrentWordIndex(nextIndex);
            setPhase('typing');
          }
          break;
      }
    }, timeoutDelay);

    return () => clearTimeout(timeout);
  }, [
    shouldStart,
    phase,
    currentCharIndex,
    currentWordIndex,
    displayedText,
    wordsToAnimate,
    hasMultipleWords,
    loop,
    typingSpeed,
    deletingSpeed,
    pauseDelay,
    delay,
  ]);

  const currentWordGraphemes = isString(wordsToAnimate[currentWordIndex])
    ? Array.from(wordsToAnimate[currentWordIndex])
    : [wordsToAnimate[currentWordIndex]];
  const isComplete =
    !loop &&
    currentWordIndex === wordsToAnimate.length - 1 &&
    currentCharIndex >= currentWordGraphemes.length &&
    phase !== 'deleting';

  const shouldShowCursor =
    showCursor &&
    !isComplete &&
    (hasMultipleWords ||
      loop ||
      currentCharIndex < currentWordGraphemes.length);

  const getCursorChar = () => {
    switch (cursorStyle) {
      case 'block':
        return '▌';
      case 'underscore':
        return '_';
      case 'line':
      default:
        return '|';
    }
  };

  // 替代 framer-motion 的 motion(Component) HOC：
  // 由于 TypingAnimation 仅用 motion 作为 ref 容器（无 variants/animate 等动画属性），
  // 直接 createElement(Component) 即可，行为完全等价。
  return React.createElement(
    Component,
    {
      ref: elementRef,
      className: classNames(prefixCls, hashId, className),
      'data-testid': prefixCls,
      ...props,
    },
    displayedText,
    shouldShowCursor && (
      <span
        key="__typing-cursor__"
        className={classNames(
          `${prefixCls}-cursor`,
          hashId,
          blinkCursor && `${prefixCls}-cursor-blinking`,
        )}
      >
        {getCursorChar()}
      </span>
    ),
  );
};

TypingAnimationBase.displayName = 'TypingAnimation';

export const TypingAnimation = memo(TypingAnimationBase);
