import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider } from 'antd';
import clsx from 'clsx';
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

let mermaidIdCounter = 0;

/**
 * Mermaid 图表渲染器，按需加载 mermaid 库。
 */
export const MermaidBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { children, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-renderer');

  const code = extractTextContent(children);

  useEffect(() => {
    if (!code.trim()) return;

    let cancelled = false;
    const renderMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        });

        const id = `mermaid-renderer-${++mermaidIdCounter}`;
        const { svg: renderedSvg } = await mermaid.default.render(id, code.trim());
        if (!cancelled) {
          setSvg(renderedSvg);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
          setSvg('');
        }
      }
    };

    renderMermaid();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div className={clsx(`${prefixCls}-mermaid-block`, `${prefixCls}-mermaid-block--error`, className)}>
        <pre>{code}</pre>
        <div className={`${prefixCls}-mermaid-block-error`}>{error}</div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={clsx(`${prefixCls}-mermaid-block`, `${prefixCls}-mermaid-block--loading`, className)}>
        <div className={`${prefixCls}-mermaid-block-placeholder`}>
          Loading diagram...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(`${prefixCls}-mermaid-block`, className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

MermaidBlockRenderer.displayName = 'MermaidBlockRenderer';
