import React, { lazy, Suspense, useMemo } from 'react';
import { isBrowser } from '../../Plugins/mermaid/env';
import { MermaidCodePreview } from '../../Plugins/mermaid/MermaidFallback';
import { MermaidRendererImpl } from '../../Plugins/mermaid/MermaidRendererImpl';
import { loadMermaid } from '../../Plugins/mermaid/utils';
import { extractBlockTextContent } from '../extractBlockTextContent';
import type { RendererBlockProps } from '../types';

const LazyMermaidRenderer = lazy(async () => {
  await loadMermaid();
  return { default: MermaidRendererImpl };
});

/**
 * Mermaid 图表渲染器
 * 加载 mermaid 库期间展示源码预览，加载完成后渲染图表。
 */
export const MermaidBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { children } = props;
  const code = extractBlockTextContent(children);

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
