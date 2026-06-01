import type React from 'react';
import type { Plugin } from 'unified';
import type { MarkdownRemarkPlugin } from '../MarkdownEditor/editor/utils/markdownToHtml';
import type { MarkdownEditorPlugin } from '../MarkdownEditor/plugin';
import type { RendererBlockProps } from './types';

/**
 * 从插件列表收集 MarkdownRenderer 用的 React 组件映射。
 * 键可以是 fence language（如 `insight-card`）、`table`、`img`，或内置别名 `code` / `mermaid` 等。
 */
export const collectRendererComponents = (
  plugins?: MarkdownEditorPlugin[],
): Record<string, React.ComponentType<RendererBlockProps>> => {
  const components: Record<
    string,
    React.ComponentType<RendererBlockProps>
  > = {};
  if (!plugins) {
    return components;
  }
  for (const plugin of plugins) {
    const rendererComponents = plugin.renderer?.rendererComponents;
    if (rendererComponents) {
      Object.assign(components, rendererComponents);
    }
  }
  return components;
};

export const collectRendererRemarkPlugins = (
  plugins?: MarkdownEditorPlugin[],
): MarkdownRemarkPlugin[] => {
  const remarkPlugins: MarkdownRemarkPlugin[] = [];
  if (!plugins) {
    return remarkPlugins;
  }
  for (const plugin of plugins) {
    const entries = plugin.renderer?.remarkPlugins;
    if (entries?.length) {
      remarkPlugins.push(...entries);
    }
  }
  return remarkPlugins;
};

export const collectRendererRehypePlugins = (
  plugins?: MarkdownEditorPlugin[],
): Plugin[] => {
  const rehypePlugins: Plugin[] = [];
  if (!plugins) {
    return rehypePlugins;
  }
  for (const plugin of plugins) {
    const entries = plugin.renderer?.rehypePlugins;
    if (entries?.length) {
      rehypePlugins.push(...entries);
    }
  }
  return rehypePlugins;
};

export const mergeMarkdownRendererPlugins = (
  ...plugins: MarkdownEditorPlugin[]
): MarkdownEditorPlugin => {
  const rendererComponents: Record<
    string,
    React.ComponentType<RendererBlockProps>
  > = {};
  const remarkPlugins: MarkdownRemarkPlugin[] = [];
  const rehypePlugins: Plugin[] = [];

  for (const plugin of plugins) {
    const renderer = plugin.renderer;
    if (!renderer) {
      continue;
    }
    if (renderer.rendererComponents) {
      Object.assign(rendererComponents, renderer.rendererComponents);
    }
    if (renderer.remarkPlugins?.length) {
      remarkPlugins.push(...renderer.remarkPlugins);
    }
    if (renderer.rehypePlugins?.length) {
      rehypePlugins.push(...renderer.rehypePlugins);
    }
  }

  const renderer: NonNullable<MarkdownEditorPlugin['renderer']> = {};

  if (Object.keys(rendererComponents).length) {
    renderer.rendererComponents = rendererComponents;
  }
  if (remarkPlugins.length) {
    renderer.remarkPlugins = remarkPlugins;
  }
  if (rehypePlugins.length) {
    renderer.rehypePlugins = rehypePlugins;
  }

  return { renderer };
};
