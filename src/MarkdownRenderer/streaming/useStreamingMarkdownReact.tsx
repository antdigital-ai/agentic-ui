import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../MarkdownEditor/editor/parser/constants';

import {
  buildEditorAlignedComponents,
  createHastProcessor,
  renderMarkdownBlock,
  splitMarkdownBlocks,
  type UseMarkdownToReactOptions,
} from '../markdownReactShared';
import { StreamingAnimationContext } from '../StreamingAnimationContext';

import { MarkdownBlockPiece } from './MarkdownBlockPiece';
import { shouldResetRevisionProgress } from './revisionPolicy';

interface SealedSubtreeProps {
  children: React.ReactNode;
}

/** 已密封块：子树在 hook 层缓存，避免父 Fragment 重建时整段子树 reconcile */
const SealedMarkdownSubtree = memo(function SealedMarkdownSubtree({
  children,
}: SealedSubtreeProps) {
  return (
    <StreamingAnimationContext.Provider value={{ animateBlock: false }}>
      {children}
    </StreamingAnimationContext.Provider>
  );
});

SealedMarkdownSubtree.displayName = 'SealedMarkdownSubtree';

/**
 * 流式优先的 Markdown → React：每块独立 memo 组件；tail 与 sealed 共用组件类型以便块晋升时复用实例。
 */
export const useStreamingMarkdownReact = (
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode => {
  const revisionSource =
    options?.contentRevisionSource !== undefined
      ? options.contentRevisionSource
      : content;

  const prevRevisionRef = useRef<string | undefined>(undefined);
  const revisionGenerationRef = useRef(0);
  /** 修订代 + 块下标 → 已解析子树，供密封块跨父级 useMemo 周期复用同一 React 元素引用 */
  const sealedSubtreeCacheRef = useRef<
    Map<string, { source: string; node: React.ReactNode }>
  >(new Map());

  const processor = useMemo(
    () => createHastProcessor(options?.remarkPlugins, options?.htmlConfig),
    [options?.remarkPlugins, options?.htmlConfig],
  );

  const prefixCls = options?.prefixCls || 'ant-agentic-md-editor';

  const components = useMemo(
    () =>
      buildEditorAlignedComponents(
        prefixCls,
        options?.components || {},
        options?.streaming,
        options?.linkConfig,
        options?.fncProps,
        options?.streamingParagraphAnimation,
        options?.eleRender,
      ),
    [
      prefixCls,
      options?.components,
      options?.streaming,
      options?.linkConfig,
      options?.fncProps,
      options?.streamingParagraphAnimation,
      options?.eleRender,
    ],
  );

  useEffect(() => {
    sealedSubtreeCacheRef.current.clear();
  }, [processor, components]);

  return useMemo(() => {
    if (!content) {
      prevRevisionRef.current = '';
      sealedSubtreeCacheRef.current.clear();
      return null;
    }

    const prevRev = prevRevisionRef.current;
    if (
      prevRev !== undefined &&
      shouldResetRevisionProgress(prevRev, revisionSource)
    ) {
      revisionGenerationRef.current += 1;
      sealedSubtreeCacheRef.current.clear();
    }
    prevRevisionRef.current = revisionSource;

    try {
      const preprocessed = preprocessNormalizeLeafToContainerDirective(
        content.replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$'),
      );

      const blocks = splitMarkdownBlocks(preprocessed);
      if (blocks.length === 0) return null;

      const gen = revisionGenerationRef.current;

      const elements = blocks.map((blockSource, index) => {
        const isLast = index === blocks.length - 1;
        // 仅用修订代 + 块下标作 key，避免末块随文本增长导致 identity 变化而整段 remount
        const key = `b-${gen}-${index}`;
        if (isLast) {
          return jsx(
            MarkdownBlockPiece,
            {
              variant: 'tail',
              blockSource,
              processor,
              components,
              streaming: !!options?.streaming,
            },
            key,
          );
        }

        const cacheKey = `${gen}:${index}`;
        const cache = sealedSubtreeCacheRef.current;
        const hit = cache.get(cacheKey);
        const node =
          hit && hit.source === blockSource
            ? hit.node
            : renderMarkdownBlock(blockSource, processor, components);
        cache.set(cacheKey, { source: blockSource, node });

        return jsx(SealedMarkdownSubtree, { children: node }, key);
      });

      const maxSealedIndex = blocks.length - 2;
      if (maxSealedIndex >= 0) {
        const cachePrefix = `${gen}:`;
        for (const k of [...sealedSubtreeCacheRef.current.keys()]) {
          if (!k.startsWith(cachePrefix)) continue;
          const idx = Number(k.slice(cachePrefix.length));
          if (Number.isNaN(idx) || idx > maxSealedIndex) {
            sealedSubtreeCacheRef.current.delete(k);
          }
        }
      }

      return jsxs(Fragment, { children: elements });
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, revisionSource, processor, components, options?.streaming]);
};
