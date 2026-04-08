import React, { lazy, Suspense } from 'react';
import { CodeNode } from '../../MarkdownEditor/el';
import { isBrowser } from './env';
import { MermaidCodePreview } from './MermaidFallback';
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
 * 仅在代码块闭合（otherProps.finished !== false）时才渲染图表，
 * 否则展示原始代码。加载过程中同样展示源码预览而非骨架屏。
 *
 * @component
 * @param {Object} props - 组件属性
 * @param {CodeNode} props.element - 代码节点，包含Mermaid图表代码
 */
export const Mermaid = (props: { element: CodeNode }) => {
  if (!isBrowser()) {
    return null;
  }

  const isUnfinished = props.element.otherProps?.finished === false;
  if (isUnfinished) {
    return <MermaidCodePreview code={props.element.value || ''} />;
  }

  return (
    <Suspense
      fallback={<MermaidCodePreview code={props.element.value || ''} />}
    >
      <MermaidRenderer element={props.element} />
    </Suspense>
  );
};
