import React, { memo, useEffect, useMemo, useRef } from 'react';
import type { Processor } from 'unified';

import { renderMarkdownBlock } from '../markdownReactShared';
import { compactStreamingTokens } from './compactStreamingTokens';

export interface MarkdownBlockPieceProps {
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  components: Record<string, any>;
  streaming: boolean;
}

interface ParsedMarkdownBlock {
  source: string;
  node: React.ReactNode;
  streaming: boolean;
  variant: MarkdownBlockPieceProps['variant'];
  processor: Processor;
}

/**
 * 块级渲染单元：sealed 块缓存不动，tail 随已展示正文更新。
 */
export const MarkdownBlockPiece = memo(function MarkdownBlockPiece({
  variant,
  blockSource,
  processor,
  components,
  streaming,
}: MarkdownBlockPieceProps) {
  // One position only needs its most recent tree. A source-keyed Map retains
  // every abandoned answer when a stream repeatedly rolls back and branches.
  const committedParse = useRef<ParsedMarkdownBlock | undefined>(undefined);
  /**
   * 宿主常把 `components: { __codeBlock: X }` 内联在每次 render，引用恒变。
   * 若列入 useMemo 依赖，末块晋升为 sealed 时会误触发重 parse，子树卸载重挂。
   * 密封命中缓存时故意不随 components 引用抖动；需重算时由 variant / blockSource / processor 驱动。
   */
  const componentsRef = useRef(components);
  componentsRef.current = components;

  const parsed = useMemo<ParsedMarkdownBlock>(() => {
    const prev = committedParse.current;
    if (prev?.processor === processor && prev.source === blockSource) {
      if (variant === 'sealed' && prev.variant === 'sealed') return prev;
      if (variant === 'tail' && prev.variant === 'tail') {
        if (prev.streaming === streaming) return prev;
      }
      if (variant === 'sealed' || !streaming) {
        return {
          ...prev,
          variant,
          streaming,
          node: compactStreamingTokens(prev.node),
        };
      }
    }

    // ContentThrottle already controls the displayed source. Parse every new
    // tail source once; a second character threshold can hide short updates.
    const node = renderMarkdownBlock(
      blockSource,
      processor,
      componentsRef.current,
    );
    return {
      source: blockSource,
      node:
        variant === 'sealed' && streaming ? compactStreamingTokens(node) : node,
      streaming,
      variant,
      processor,
    };
  }, [variant, blockSource, processor, streaming]);

  // Publishing after commit keeps abandoned concurrent renders out of cache.
  useEffect(() => {
    committedParse.current = parsed;
  }, [parsed]);

  return <>{parsed.node}</>;
});

MarkdownBlockPiece.displayName = 'MarkdownBlockPiece';
