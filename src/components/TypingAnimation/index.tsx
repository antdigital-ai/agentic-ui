import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { motion, MotionProps, useInView } from 'framer-motion';
import { isString } from 'lodash';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { resolveSegments } from '../TextAnimate';
import { useTypingAnimationStyle } from './style';

export interface TypingAnimationProps extends MotionProps {
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

export function TypingAnimation({
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
}: TypingAnimationProps) {
  const MotionComponent = motion(Component, {
    forwardMotionProps: true,
  });

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('typing-animation');
  const { wrapSSR, hashId } = useTypingAnimationStyle(prefixCls);

  const [displayedText, setDisplayedText] = useState<React.ReactNode[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const elementRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(elementRef, {
    amount: 0.3,
    once: true,
  });

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

  return wrapSSR(
    <MotionComponent
      ref={elementRef}
      className={classNames(prefixCls, hashId, className)}
      {...props}
    >
      {displayedText}
      {shouldShowCursor && (
        <span
          className={classNames(
            `${prefixCls}-cursor`,
            hashId,
            blinkCursor && `${prefixCls}-cursor-blinking`,
          )}
        >
          {getCursorChar()}
        </span>
      )}
    </MotionComponent>,
  );
}
