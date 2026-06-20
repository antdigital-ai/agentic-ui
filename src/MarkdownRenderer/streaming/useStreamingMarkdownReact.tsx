import React, { useMemo, useRef, useState } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../MarkdownEditor/editor/parser/constants';
import { debugInfo } from '../../Utils/debugUtils';

import {
  buildEditorAlignedComponents,
  createHastProcessor,
  splitMarkdownBlocks,
  type UseMarkdownToReactOptions,
} from '../markdownReactShared';

import { MarkdownBlockPiece } from './MarkdownBlockPiece';
import type { StreamingTokenState } from './rehypeStreamingTokens';
import { shouldResetRevisionProgress } from './revisionPolicy';
import { useProgressiveBlocks } from './useProgressiveBlocks';
import { useShallowMemo } from './useShallowMemo';

/** 空块数组常量，避免每次返回新引用 */
const EMPTY_BLOCKS: string[] = [];

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

  const processor = useMemo(
    () =>
      createHastProcessor(
        options?.remarkPlugins,
        options?.htmlConfig,
        options?.formula,
        options?.rehypePlugins,
        tokenStateRef.current,
      ),
    [
      options?.remarkPlugins,
      options?.htmlConfig,
      options?.formula,
      options?.rehypePlugins,
    ],
  );

  const prefixCls = options?.prefixCls || 'ant-agentic-md-editor';

  const stableComponents = useShallowMemo(options?.components);
  const stableFncProps = useShallowMemo(options?.fncProps);

  const components = useMemo(
    () =>
      buildEditorAlignedComponents(
        prefixCls,
        stableComponents || {},
        options?.streaming,
        options?.linkConfig,
        stableFncProps,
        options?.eleRender,
      ),
    [
      prefixCls,
      stableComponents,
      options?.streaming,
      options?.linkConfig,
      stableFncProps,
      options?.eleRender,
    ],
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

  const blocks = useMemo(() => {
    if (!content) return EMPTY_BLOCKS;
    try {
      const preprocessed = preprocessNormalizeLeafToContainerDirective(
        content.replace(new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'), '$'),
      );
      const splitBlocks = splitMarkdownBlocks(preprocessed);
      return splitBlocks.length > 0 ? splitBlocks : EMPTY_BLOCKS;
    } catch (error) {
      debugInfo('[MarkdownRenderer] splitMarkdownBlocks failed', {
        error: (error as Error)?.message || String(error),
      });
      return EMPTY_BLOCKS;
    }
  }, [content]);

  // 第二步：分帧渐进——非流式大文档首批只渲染部分块，后续空闲帧追加
  const visibleCount = useProgressiveBlocks(
    blocks.length,
    !!options?.streaming,
    generation,
  );

  // 第三步：生成 React 元素
  return useMemo(() => {
    if (blocks.length === 0) return null;

    const renderCount = Math.min(visibleCount, blocks.length);
    const elements = [];

    for (let index = 0; index < renderCount; index++) {
      const blockSource = blocks[index];
      const isLast = index === blocks.length - 1;
      // key 必须与 variant 解耦——末块由 tail 晋升 sealed 时不能卸载重挂，
      // 否则 chart / agentar-card 等重组件会重复初始化。
      const key = `b-${generation}-${index}`;
      elements.push(
        jsx(
          MarkdownBlockPiece,
          {
            variant: isLast ? 'tail' : 'sealed',
            blockSource,
            processor,
            components,
            streaming: !!options?.streaming,
          },
          key,
        ),
      );
    }

    return jsxs(Fragment, { children: elements });
  }, [
    blocks,
    generation,
    visibleCount,
    processor,
    components,
    options?.streaming,
  ]);
};
