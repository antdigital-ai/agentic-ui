import React, { useMemo } from 'react';
import { MermaidRendererImpl } from '../../Plugins/mermaid/MermaidRendererImpl';
import type { RendererBlockProps } from '../types';

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

/**
 * Mermaid 图表渲染器——复用 MarkdownEditor 的 MermaidRendererImpl。
 * 将代码块文本包装为 CodeNode 格式后直接传递给已有的 Mermaid 渲染组件。
 */
export const MermaidBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { children } = props;
  const code = extractTextContent(children);

  const fakeElement = useMemo(
    () => ({
      type: 'code' as const,
      language: 'mermaid',
      value: code,
      children: [{ text: code }],
    }),
    [code],
  );

  if (!code.trim()) return null;

  return (
    <div data-be="mermaid" style={{ margin: '1em 0' }}>
      <MermaidRendererImpl element={fakeElement as any} />
    </div>
  );
};

MermaidBlockRenderer.displayName = 'MermaidBlockRenderer';
