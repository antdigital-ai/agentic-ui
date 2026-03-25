import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import React from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

import {
  JINJA_DOLLAR_PLACEHOLDER,
  preprocessProtectTimeFromDirective,
} from '../MarkdownEditor/editor/parser/constants';
import type {
  MarkdownRemarkPlugin,
  MarkdownToHtmlConfig,
} from '../MarkdownEditor/editor/utils/markdownToHtml';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
} from './markdownReactShared';
import { useStreamingMarkdownReact } from './streaming/useStreamingMarkdownReact';
import type { RendererBlockProps } from './types';

export type { UseMarkdownToReactOptions } from './markdownReactShared';

export const useMarkdownToReact = useStreamingMarkdownReact;

/**
 * 同步将 markdown 转为 React 元素（非 hook 版本，用于测试或一次性转换）
 */
export const markdownToReactSync = (
  content: string,
  components?: Record<string, React.ComponentType<RendererBlockProps>>,
  remarkPlugins?: MarkdownRemarkPlugin[],
  htmlConfig?: MarkdownToHtmlConfig,
): React.ReactNode => {
  if (!content) return null;

  try {
    const processor = createHastProcessor(remarkPlugins, htmlConfig);
    const preprocessed = content.replace(
      new RegExp(JINJA_DOLLAR_PLACEHOLDER, 'g'),
      '$',
    );

    const mdast = processor.parse(
      preprocessProtectTimeFromDirective(preprocessed),
    );
    const hast = processor.runSync(mdast);

    const userComps = components || {};
    const allComponents = buildEditorAlignedComponents(
      'ant-agentic-md-editor',
      userComps,
      false,
      undefined,
      false,
    );

    return toJsxRuntime(hast as any, {
      Fragment,
      jsx: jsx as any,
      jsxs: jsxs as any,
      components: allComponents as any,
      passNode: true,
    });
  } catch (error) {
    console.error('Failed to render markdown:', error);
    return null;
  }
};
