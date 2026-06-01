import { useEffect, useRef, useState } from 'react';
import { ContentThrottle } from './ContentThrottle';
import type { ContentThrottleOptions } from './types';

/**
 * 流式模式下按帧推进已展示内容，避免 SSE 一次推送过多导致 Markdown 整段突变。
 */
export function useContentThrottle(
  content: string,
  enabled: boolean,
  options?: ContentThrottleOptions,
  isFinished?: boolean,
): string {
  const [displayed, setDisplayed] = useState(() =>
    enabled && !isFinished ? '' : content,
  );
  const engineRef = useRef<ContentThrottle | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) {
      engineRef.current?.dispose();
      engineRef.current = null;
      setDisplayed(content);
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new ContentThrottle(setDisplayed, optionsRef.current);
    } else {
      engineRef.current.setOptions(optionsRef.current);
    }
    engineRef.current.push(content);
    if (isFinished) engineRef.current.complete();
  }, [content, enabled, isFinished]);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    },
    [],
  );

  // isFinished 时直绕过限流，保证「挂载即结束」的场景首帧就有完整内容（无需等 effect）。
  return !enabled || isFinished ? content : displayed;
}
