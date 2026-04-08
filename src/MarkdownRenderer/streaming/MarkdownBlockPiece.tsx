import type { Processor } from 'unified';
import React, { memo, useMemo, useRef } from 'react';

import { renderMarkdownBlock } from '../markdownReactShared';
import { StreamingAnimationContext } from '../StreamingAnimationContext';

import { shouldReparseLastBlock } from './lastBlockThrottle';

export interface MarkdownBlockPieceProps {
  /** 末块为 tail（生长中）；一旦其后出现新块，同一段内容变为 sealed，保持同一 React key 可避免重组件卸载 */
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  components: Record<string, any>;
  /** 仅末块且处于流式模式时为 true，用于节流与末段动画 */
  streaming: boolean;
}

/**
 * 统一的块级渲染：封版与末块使用同一组件类型；按 blockSource 缓存解析结果引用，使 tail→sealed 时与旧 Map 缓存一样复用同一棵 React 子树。
 */
export const MarkdownBlockPiece = memo(function MarkdownBlockPiece({
  variant,
  blockSource,
  processor,
  components,
  streaming,
}: MarkdownBlockPieceProps) {
  const lastParsedRef = useRef<{
    source: string;
    node: React.ReactNode;
  } | null>(null);

  /** 完整 parse 结果缓存：键为 block 源串，供 sealed 与 tail 晋升时复用同一引用 */
  const parseBySourceRef = useRef<Map<string, React.ReactNode>>(new Map());

  const node = useMemo(() => {
    const cached = parseBySourceRef.current.get(blockSource);
    if (cached && variant === 'sealed') {
      return cached;
    }

    if (variant === 'sealed') {
      const el = renderMarkdownBlock(blockSource, processor, components, {
        markStreamingTailParagraph: false,
      });
      parseBySourceRef.current.set(blockSource, el);
      return el;
    }

    if (!streaming) {
      const el = renderMarkdownBlock(blockSource, processor, components, {
        markStreamingTailParagraph: false,
      });
      parseBySourceRef.current.set(blockSource, el);
      lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const prev = lastParsedRef.current;
    if (prev && !shouldReparseLastBlock(prev.source, blockSource, true)) {
      return prev.node;
    }

    const el = renderMarkdownBlock(blockSource, processor, components, {
      markStreamingTailParagraph: true,
    });
    parseBySourceRef.current.set(blockSource, el);
    lastParsedRef.current = { source: blockSource, node: el };
    return el;
  }, [variant, blockSource, processor, components, streaming]);

  const animateBlock = variant === 'tail' && streaming;

  return (
    <StreamingAnimationContext.Provider value={{ animateBlock }}>
      {node}
    </StreamingAnimationContext.Provider>
  );
});

MarkdownBlockPiece.displayName = 'MarkdownBlockPiece';
