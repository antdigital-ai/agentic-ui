import React, { memo, useMemo, useRef } from 'react';
import type { Processor } from 'unified';

import { renderMarkdownBlock } from '../markdownReactShared';
import { shouldReparseLastBlock } from './lastBlockThrottle';

export interface MarkdownBlockPieceProps {
  variant: 'sealed' | 'tail';
  blockSource: string;
  processor: Processor;
  components: Record<string, any>;
  streaming: boolean;
}

/**
 * 块级渲染单元：sealed 块缓存不动，tail 块节流重解析。
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
  const cacheRef = useRef<Map<string, React.ReactNode>>(new Map());
  const processorRef = useRef<Processor | null>(null);
  /**
   * 宿主常把 `components: { __codeBlock: X }` 内联在每次 render，引用恒变。
   * 若列入 useMemo 依赖，末块晋升为 sealed 时会误触发重 parse，子树卸载重挂。
   * 密封命中缓存时故意不随 components 引用抖动；需重算时由 variant / blockSource / processor 驱动。
   */
  const componentsRef = useRef(components);
  componentsRef.current = components;

  const node = useMemo(() => {
    if (processorRef.current !== processor) {
      processorRef.current = processor;
      cacheRef.current.clear();
      lastParsedRef.current = null;
    }

    const comps = componentsRef.current;

    if (variant === 'sealed') {
      const cached = cacheRef.current.get(blockSource);
      if (cached) return cached;
      // 末块刚晋升为 sealed 时 cacheRef 通常未命中（tail 路径只写 lastParsedRef）。
      // 直接复用 lastParsedRef 上一次 parse 的结果，避免再走一次 renderMarkdownBlock
      // 触发不必要的子树替换（chart / agentar-card 等重组件依赖 React 同位置同
      // 类型 reconciliation 来保留实例）。
      if (lastParsedRef.current?.source === blockSource) {
        const el = lastParsedRef.current.node;
        cacheRef.current.set(blockSource, el);
        return el;
      }
      const el = renderMarkdownBlock(blockSource, processor, comps);
      cacheRef.current.set(blockSource, el);
      return el;
    }

    // tail 块：不写入 cacheRef，仅用 lastParsedRef
    if (!streaming) {
      const el = renderMarkdownBlock(blockSource, processor, comps);
      lastParsedRef.current = { source: blockSource, node: el };
      return el;
    }

    const prev = lastParsedRef.current;
    if (prev && !shouldReparseLastBlock(prev.source, blockSource, true)) {
      return prev.node;
    }

    const el = renderMarkdownBlock(blockSource, processor, comps);
    lastParsedRef.current = { source: blockSource, node: el };
    return el;
  }, [variant, blockSource, processor, streaming]);

  return <>{node}</>;
});

MarkdownBlockPiece.displayName = 'MarkdownBlockPiece';
