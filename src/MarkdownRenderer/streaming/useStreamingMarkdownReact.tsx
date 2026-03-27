import { JINJA_DOLLAR_PLACEHOLDER } from '../../MarkdownEditor/editor/parser/constants';
import React, { useMemo, useRef } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import {
  buildEditorAlignedComponents,
  createHastProcessor,
  splitMarkdownBlocks,
  type UseMarkdownToReactOptions,
} from '../markdownReactShared';

import { MarkdownBlockPiece } from './MarkdownBlockPiece';
import { shouldResetRevisionProgress } from './revisionPolicy';

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
        options?.streamingParagraphAnimation,
        options?.eleRender,
      ),
    [
      prefixCls,
      options?.components,
      options?.streaming,
      options?.linkConfig,
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
      const preprocessed = content.replace(
        new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'),
        '$',
      );

      const blocks = splitMarkdownBlocks(preprocessed);
      if (blocks.length === 0) return null;

      const gen = revisionGenerationRef.current;

      const elements = blocks.map((blockSource, index) => {
        const isLast = index === blocks.length - 1;
        // 仅用修订代 + 块下标作 key，避免末块随文本增长导致 identity 变化而整段 remount
        const key = `b-${gen}-${index}`;
        return jsx(
          MarkdownBlockPiece,
          {
            variant: isLast ? 'tail' : 'sealed',
            blockSource,
            processor,
            components,
            streaming: !!(options?.streaming && isLast),
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
