import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [displayed, setDisplayed] = useState(content);
  const engineRef = useRef<ContentThrottle | null>(null);
  // 父组件常以新对象字面量传入 options。用稳定签名比对，避免 effect 每渲染都重跑。
  const optionsSig = useMemo(() => JSON.stringify(options ?? {}), [options]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current?.dispose();
      engineRef.current = null;
      setDisplayed(content);
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new ContentThrottle(setDisplayed, options);
    }
    engineRef.current.push(content);
    if (isFinished) engineRef.current.complete();
  }, [content, enabled, isFinished]);

  useEffect(() => {
    if (!enabled || !engineRef.current) return;
    engineRef.current.setOptions(options);
  }, [optionsSig, enabled]);

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
