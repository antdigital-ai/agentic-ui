import React, { memo } from 'react';
import { standardPlugins } from '../Plugins/defaultPlugins';
import { BaseMarkdownEditor, MarkdownEditorProps } from './BaseMarkdownEditor';
export * from './BaseMarkdownEditor';

/**
 * MarkdownEditor 组件 - Markdown编辑器组件
 *
 * 该组件是一个功能完整的Markdown编辑器，基于BaseMarkdownEditor构建，
 * 集成了标准插件集合，提供开箱即用的Markdown编辑功能。
 *
 * @component
 * @description Markdown编辑器组件，提供完整的Markdown编辑功能
 * @param {MarkdownEditorProps} props - 组件属性
 * @param {string} [props.initValue] - 初始值
 * @param {(value: string) => void} [props.onChange] - 内容变化回调
 * @param {React.RefObject} [props.editorRef] - 编辑器引用
 * @param {boolean} [props.readonly] - 是否只读模式
 * @param {Plugin[]} [props.plugins] - 自定义插件列表
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 *
 * @example
 * ```tsx
 * <MarkdownEditor
 *   initValue="# Hello World"
 *   onChange={(value) => console.log('内容变化:', value)}
 *   editorRef={editorRef}
 *   readonly={false}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Markdown编辑器组件
 *
 * @remarks
 * - 基于BaseMarkdownEditor构建
 * - 集成标准插件集合
 * - 支持自定义插件扩展
 * - 提供完整的Markdown编辑功能
 * - 支持只读模式
 * - 支持内容变化监听
 * - 提供编辑器引用
 */
const MarkdownEditorComponent: React.FC<MarkdownEditorProps> = (props) => {
  return (
    <BaseMarkdownEditor
      {...props}
      plugins={[...(standardPlugins || []), ...(props?.plugins || [])]}
    />
  );
};

MarkdownEditorComponent.displayName = 'MarkdownEditor';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const MarkdownEditor = memo(MarkdownEditorComponent);
