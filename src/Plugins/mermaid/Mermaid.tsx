import React, { lazy, Suspense } from 'react';
import { CodeNode } from '../../MarkdownEditor/el';
import { MermaidFallback } from './MermaidFallback';
import { MermaidRendererImpl } from './MermaidRendererImpl';
import { loadMermaid } from './utils';

/**
 * Mermaid 渲染器组件
 * 使用 React.lazy 延迟加载，仅在需要时加载 mermaid 库
 */
const MermaidRenderer = lazy(async () => {
  await loadMermaid();
  return { default: MermaidRendererImpl };
});

/**
 * Mermaid 组件 - Mermaid图表渲染组件
 *
 * 该组件使用Mermaid库渲染图表，支持流程图、时序图、甘特图等。
 * 使用 React.lazy 和 Suspense 实现代码分割和延迟加载，优化性能。
 *
 * @component
 * @description Mermaid图表渲染组件，支持各种Mermaid图表类型
 * @param {Object} props - 组件属性
 * @param {CodeNode} props.element - 代码节点，包含Mermaid图表代码
 * @param {string} [props.element.value] - Mermaid图表代码字符串
 *
 * @example
 * ```tsx
 * <Mermaid
 *   element={{
 *     type: 'code',
 *     value: 'graph TD\nA[开始] --> B[处理] --> C[结束]'
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Mermaid图表组件
 *
 * @remarks
 * - 基于Mermaid库实现图表渲染
 * - 支持多种图表类型（流程图、时序图、甘特图等）
 * - 使用 React.lazy 和 Suspense 实现代码分割
 * - 提供延迟渲染优化性能
 * - 包含错误处理机制
 * - 支持空状态显示
 * - 提供美观的样式设计
 * - 禁用文本选择
 * - 居中显示图表
 * - 自动生成唯一ID
 */
export const Mermaid = (props: { element: CodeNode }) => {
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) {
    return null;
  }

  return (
    <Suspense fallback={<MermaidFallback />}>
      <MermaidRenderer element={props.element} />
    </Suspense>
  );
};
