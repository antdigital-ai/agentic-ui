import React, { lazy, Suspense, useMemo } from 'react';
import { isBrowser } from '../../Plugins/mermaid/env';
import { MermaidCodePreview } from '../../Plugins/mermaid/MermaidFallback';
import { MermaidRendererImpl } from '../../Plugins/mermaid/MermaidRendererImpl';
import { loadMermaid } from '../../Plugins/mermaid/utils';
import type { RendererBlockProps } from '../types';

const LazyMermaidRenderer = lazy(async () => {
  await loadMermaid();
  return { default: MermaidRendererImpl };
});

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
 * Mermaid 图表渲染器
 * 加载 mermaid 库期间展示源码预览，加载完成后渲染图表。
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
  if (!isBrowser()) return null;

  return (
    <div data-be="mermaid" style={{ margin: '1em 0' }}>
      <Suspense fallback={<MermaidCodePreview code={code} />}>
        <LazyMermaidRenderer element={fakeElement as any} />
      </Suspense>
    </div>
  );
};

MermaidBlockRenderer.displayName = 'MermaidBlockRenderer';
