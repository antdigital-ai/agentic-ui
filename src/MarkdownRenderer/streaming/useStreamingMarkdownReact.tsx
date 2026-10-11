import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildEditorAlignedComponents,
  createHastProcessor,
  type UseMarkdownToReactOptions,
} from '../markdownReactShared';

import {
  createMarkdownBlockElements,
  type MarkdownBlockElements,
} from './markdownBlockElements';
import type { StreamingTokenState } from './rehypeStreamingTokens';
import { shouldResetRevisionProgress } from './revisionPolicy';
import {
  splitStreamingMarkdownBlocks,
  type StreamingMarkdownBlocks,
} from './splitStreamingMarkdownBlocks';
import { useProgressiveBlocks } from './useProgressiveBlocks';
import { useShallowMemo } from './useShallowMemo';
import {
  MarkdownComponentContext,
  useStableMarkdownComponents,
} from './useStableMarkdownComponents';

interface RevisionState {
  prevRevision: string | undefined;
  generation: number;
}

const INITIAL_REVISION_STATE: RevisionState = {
  prevRevision: undefined,
  generation: 0,
};

/**
 * 流式优先的 Markdown → React：每块独立 MarkdownBlockPiece，末块 tail、其余 sealed。
 * 块 key 仅用修订代 + 下标，使「末块晋升为 sealed」时外层组件类型不变，避免子树卸载重挂。
 *
 * 非流式大文档启用分帧渐进渲染：首批只渲染前 N 个块，后续空闲帧逐步追加，
 * 标签页不可见时降级为全量渲染。
 */
export const useStreamingMarkdownReact = (
  content: string,
  options?: UseMarkdownToReactOptions,
): React.ReactNode => {
  const revisionSource =
    options?.contentRevisionSource !== undefined
      ? options.contentRevisionSource
      : content;

  // GPT 风格逐词淡入开关：用稳定对象承载，processor 在流式会话内保持同一实例，
  // 避免随 streaming 变化重建导致 chart / 代码块卸载重挂。
  const tokenStateRef = useRef<StreamingTokenState>({ enabled: false });
  tokenStateRef.current.enabled = !!options?.fadeTokens;
  // useFormulaConfig resolves a fresh flat object on every render. Equal
  // settings must preserve the processor and its parsed block caches.
  const stableFormula = useShallowMemo(options?.formula);
  const stableHtmlConfig = useShallowMemo(options?.htmlConfig);
  const remarkPlugins = options?.remarkPlugins?.length
    ? options.remarkPlugins
    : undefined;
  const rehypePlugins = options?.rehypePlugins?.length
    ? options.rehypePlugins
    : undefined;

  const processor = useMemo(
    () =>
      createHastProcessor(
        remarkPlugins,
        stableHtmlConfig,
        stableFormula,
        rehypePlugins,
        tokenStateRef.current,
      ),
    [
      remarkPlugins,
      stableHtmlConfig,
      stableFormula,
      rehypePlugins,
      // fade 配置切换需重建 processor：块缓存键不含 fade，仅改 tokenStateRef
      // 会让 sealed 块复用旧 token 树（反之流式结束不重建，保住性能优化）。
      options?.fadeTokensConfig,
    ],
  );

  const prefixCls = options?.prefixCls ?? 'ant-agentic-md-editor';

  const stableComponents = useShallowMemo(options?.components);
  const stableFncProps = useShallowMemo(options?.fncProps);
  const stableLinkConfig = useShallowMemo(options?.linkConfig);

  const renderers = useMemo(
    () =>
      buildEditorAlignedComponents(
        prefixCls,
        stableComponents ?? {},
        // 逐词动画由 processor 控制；切换 streaming 不应替换组件类型，
        // 否则活动末块中的代码、图表和媒体会在结束流式时重挂。
        undefined,
        stableLinkConfig,
        stableFncProps,
        options?.eleRender,
      ),
    [
      prefixCls,
      stableComponents,
      stableLinkConfig,
      stableFncProps,
      options?.eleRender,
    ],
  );
  const { components, runtime } = useStableMarkdownComponents(
    renderers,
    stableComponents,
  );

  // 修订代用 useState 承载：渲染阶段对比 props 派生 next state，并通过
  // setState-in-render 让 React 在 commit 时持久化。避免在 useMemo 里写 ref
  // 触发 StrictMode 双调用与 Concurrent 渲染下的脏读。
  const [revisionState, setRevisionState] = useState<RevisionState>(
    INITIAL_REVISION_STATE,
  );

  let nextPrevRevision = revisionState.prevRevision;
  let nextGeneration = revisionState.generation;

  if (!content) {
    nextPrevRevision = '';
  } else {
    if (
      revisionState.prevRevision !== undefined &&
      shouldResetRevisionProgress(revisionState.prevRevision, revisionSource)
    ) {
      nextGeneration = revisionState.generation + 1;
    }
    nextPrevRevision = revisionSource;
  }

  if (
    nextPrevRevision !== revisionState.prevRevision ||
    nextGeneration !== revisionState.generation
  ) {
    setRevisionState({
      prevRevision: nextPrevRevision,
      generation: nextGeneration,
    });
  }

  const generation = nextGeneration;

  const committedBlocks = useRef<StreamingMarkdownBlocks | undefined>(
    undefined,
  );
  const splitState = useMemo(
    () => splitStreamingMarkdownBlocks(content, committedBlocks.current),
    [content],
  );
  // An abandoned concurrent render must not replace the committed prefix.
  useEffect(() => {
    committedBlocks.current = splitState;
  }, [splitState]);
  const blocks = splitState.blocks;

  // 第二步：分帧渐进——非流式大文档首批只渲染部分块，后续空闲帧追加
  const visibleCount = useProgressiveBlocks(
    blocks.length,
    !!(options?.streaming || options?.isFinished),
    generation,
  );

  // Reuse the actual React elements, not only the parsed contents behind memo.
  const committedElements = useRef<MarkdownBlockElements | undefined>(
    undefined,
  );
  const elementState = useMemo(
    () =>
      createMarkdownBlockElements(
        blocks,
        visibleCount,
        generation,
        processor,
        components,
        !!options?.streaming,
        committedElements.current,
      ),
    [
      blocks,
      generation,
      visibleCount,
      processor,
      components,
      options?.streaming,
    ],
  );
  useEffect(() => {
    committedElements.current = elementState;
  }, [elementState]);
  const renderedBlocks = elementState.node;
  if (renderedBlocks === null) return null;
  return (
    <MarkdownComponentContext.Provider value={runtime}>
      {renderedBlocks}
    </MarkdownComponentContext.Provider>
  );
};
