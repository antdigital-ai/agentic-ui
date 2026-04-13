import type { Processor } from 'unified';
import React, { memo, useMemo, useRef } from 'react';

import { renderMarkdownBlock } from '../markdownReactShared';
import { StreamingAnimationContext } from '../StreamingAnimationContext';
import { StreamingCursor } from '../StreamingCursor';
import { shouldReparseLastBlock } from './lastBlockThrottle';

export interface MarkdownBlockPieceProps {
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  components: Record<string, any>;
  streaming: boolean;
}

/**
 * 块级渲染单元：sealed 块缓存不动，tail 块节流重解析 + 闪烁光标。
 */
export const MarkdownBlockPiece = memo(function MarkdownBlockPiece({
  variant,
  blockSource,
  processor,
  components,
  streaming,
}: MarkdownBlockPieceProps) {
  const lastParsedRef = useRef<{ source: string; node: React.ReactNode } | null>(null);
  const cacheRef = useRef<Map<string, React.ReactNode>>(new Map());

  const node = useMemo(() => {
    const cached = cacheRef.current.get(blockSource);
    if (cached && variant === 'sealed') return cached;

    if (variant === 'sealed' || !streaming) {
      const el = renderMarkdownBlock(blockSource, processor, components);
      cacheRef.current.set(blockSource, el);
      if (variant === 'tail') lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const prev = lastParsedRef.current;
    if (prev && !shouldReparseLastBlock(prev.source, blockSource, true)) {
      return prev.node;
    }

    const el = renderMarkdownBlock(blockSource, processor, components);
    cacheRef.current.set(blockSource, el);
    lastParsedRef.current = { source: blockSource, node: el };
    return el;
  }, [variant, blockSource, processor, components, streaming]);

  const animateBlock = variant === 'tail' && streaming;

  return (
    <StreamingAnimationContext.Provider value={{ animateBlock }}>
      {node}
      {animateBlock && <StreamingCursor />}
    </StreamingAnimationContext.Provider>
  );
});

MarkdownBlockPiece.displayName = 'MarkdownBlockPiece';
