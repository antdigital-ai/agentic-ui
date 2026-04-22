import React, { useMemo, useRef } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessNormalizeLeafToContainerDirective,
} from '../../MarkdownEditor/editor/parser/constants';

import {
  buildEditorAlignedComponents,
  createHastProcessor,
  splitMarkdownBlocks,
  type UseMarkdownToReactOptions,
} from '../markdownReactShared';

import { MarkdownBlockPiece } from './MarkdownBlockPiece';
import { shouldResetRevisionProgress } from './revisionPolicy';
import { useShallowMemo } from './useShallowMemo';

/**
 * 流式优先的 Markdown → React：每块独立 MarkdownBlockPiece，末块 tail、其余 sealed。
 * 块 key 仅用修订代 + 下标，使「末块晋升为 sealed」时外层组件类型不变，避免子树卸载重挂。
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

  const processor = useMemo(
    () => createHastProcessor(options?.remarkPlugins, options?.htmlConfig),
    [options?.remarkPlugins, options?.htmlConfig],
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
        options?.streamingParagraphAnimation,
        options?.eleRender,
      ),
    [
      prefixCls,
      stableComponents,
      options?.streaming,
      options?.linkConfig,
      stableFncProps,
      options?.streamingParagraphAnimation,
      options?.eleRender,
    ],
  );

  return useMemo(() => {
    if (!content) {
      prevRevisionRef.current = '';
      return null;
    }

    const prevRev = prevRevisionRef.current;
    if (
      prevRev !== undefined &&
      shouldResetRevisionProgress(prevRev, revisionSource)
    ) {
      revisionGenerationRef.current += 1;
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
        const key = `b-${gen}-${index}`;
        return jsx(
          MarkdownBlockPiece,
          {
            variant: isLast ? 'tail' : 'sealed',
            blockSource,
            processor,
            components,
            streaming: !!options?.streaming,
          },
          key,
        );
      });

      return jsxs(Fragment, { children: elements });
    } catch (error) {
      console.error('Failed to render markdown:', error);
      return null;
    }
  }, [content, revisionSource, processor, components, options?.streaming]);
};
