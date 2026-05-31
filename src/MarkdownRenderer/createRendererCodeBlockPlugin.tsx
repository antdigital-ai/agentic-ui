import React from 'react';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import { extractBlockTextContent } from './extractBlockTextContent';
import type { RendererBlockProps } from './types';

export interface CodeBlockRenderContext {
  language: string;
  code: string;
  props: RendererBlockProps;
}

export type CodeBlockRenderFn = (
  context: CodeBlockRenderContext,
) => React.ReactNode;

const wrapCodeBlockRenderer = (
  language: string,
  render: CodeBlockRenderFn,
): React.FC<RendererBlockProps> => {
  const CodeBlockRenderer = (props: RendererBlockProps) => {
    const code = extractBlockTextContent(props.children);
    return <>{render({ language, code, props })}</>;
  };
  CodeBlockRenderer.displayName = `CodeBlockRenderer(${language})`;
  return CodeBlockRenderer;
};

/**
 * 将按 fence language 注册的渲染函数转为 MarkdownRenderer 插件。
 * 需在 DefaultCodeRouter 中按 `pluginComponents[language]` 路由。
 */
export const createRendererCodeBlockPlugin = (
  renderers: Record<string, CodeBlockRenderFn>,
): MarkdownEditorPlugin => {
  const rendererComponents: Record<
    string,
    React.ComponentType<RendererBlockProps>
  > = {};

  for (const [language, render] of Object.entries(renderers)) {
    rendererComponents[language] = wrapCodeBlockRenderer(language, render);
  }

  return {
    renderer: {
      rendererComponents,
    },
  };
};
