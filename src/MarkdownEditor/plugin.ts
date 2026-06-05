import { Node } from 'mdast';
import React from 'react';
import { Editor, NodeEntry } from 'slate';
import type { Plugin } from 'unified';
import type { MarkdownRemarkPlugin } from './editor/utils/markdownToHtml';
import { ElementProps, Elements } from './el';
import type { JinjaConfig } from './types';

/**
 * MarkdownRenderer 渲染模式下的插件配置。
 * 与 Slate 编辑器侧的 `elements` 并行，用于 HTML/React 渲染模式。
 *
 * ### 自定义 fence 代码块
 * 使用 `createRendererCodeBlockPlugin` 按 language 注册，例如 `insight-card`。
 * `DefaultCodeRouter` 会优先匹配 `rendererComponents[language]`。
 *
 * ### 覆盖内置块（table / img 等）
 * 在 `rendererComponents` 中注册同名 hast 标签（如 `table`、`img`），
 * 会覆盖默认渲染；若需保留默认 DOM 再包装，请使用 props `eleRender`。
 */
export interface RendererPlugin {
  /** 用于 HTML/React 渲染模式的组件映射（tagName → Component） */
  rendererComponents?: Record<string, React.ComponentType<any>>;
  /** 自定义 rehype 插件 */
  rehypePlugins?: Plugin[];
  /** 自定义 remark 插件（与 `markdownToHtmlOptions` 同形） */
  remarkPlugins?: MarkdownRemarkPlugin[];
}

export type MarkdownEditorPlugin = {
  // ------------------ 自定义节点渲染 ------------------
  elements?: Record<string, React.ComponentType<ElementProps<any>>>;

  // ------------------ Markdown 双向转换 ------------------
  parseMarkdown?: {
    // 匹配 Markdown 语法（如 ```code, > quote 等）
    match: (node: Node) => boolean;
    // 将 Markdown 节点转换为 Slate Element
    convert: (node: Node) => Elements | NodeEntry<Text>;
  }[];

  toMarkdown?: {
    // 匹配 Slate 元素类型
    match: (node: Elements) => boolean;
    convert: (node: Elements) => Node;
  }[];

  // ------------------ 编辑器行为扩展 ------------------
  withEditor?: (editor: Editor) => Editor; // 扩展编辑器实例
  /**
   * 参与 `getPluginsEditorCompositionKey`；替换匿名 `withEditor` 时若需 remount 请显式设置
   */
  withEditorKey?: string;

  hotkeys?: Record<string, (editor: Editor) => void>; // 自定义快捷键

  onPaste?: (text: string) => boolean; // 自定义粘贴处理

  /** 启用 Jinja 能力（模板面板 + 语法高亮），与 props.jinja?.enable 二选一 */
  jinja?: true;
  /** 通过插件启用时的默认 Jinja 配置（当未传 props.jinja 时使用） */
  jinjaConfig?: JinjaConfig;

  // ------------------ 渲染器模式（MarkdownRenderer）------------------
  /** MarkdownRenderer 渲染模式下的配置 */
  renderer?: RendererPlugin;
};

// 使用 Context 传递插件配置
export const PluginContext = React.createContext<MarkdownEditorPlugin[]>([]);
