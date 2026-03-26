import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useMemo, useRef } from 'react';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { CodeNode } from '../../MarkdownEditor/el';
import { useStyle } from './style';
import { useMermaidRender } from './useMermaidRender';

const PRE_STYLE: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

export const MermaidRendererImpl = (props: { element: CodeNode }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'plugin-mermaid';
  const { wrapSSR, hashId } = useStyle(baseCls);
  const containerRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const id = useMemo(
    () => 'm' + (Date.now() + Math.ceil(Math.random() * 1000)),
    [],
  );
  const isVisible = useIntersectionOnce(containerRef);
  const { error, renderedCode } = useMermaidRender(
    props.element.value || '',
    divRef,
    id,
    isVisible,
  );

  const isError = useMemo(() => !!error && !!error.trim(), [error]);
  const isRendered = useMemo(
    () => renderedCode && !isError,
    [renderedCode, isError],
  );
  const containerStyle = useMemo(
    () =>
      ({
        opacity: isRendered ? 1 : 0,
        pointerEvents: isRendered ? 'auto' : 'none',
        width: '100%',
        height: isRendered ? '100%' : '0',
        overflow: isRendered ? 'auto' : 'hidden',
        maxHeight: isRendered ? '100%' : '0',
        minHeight: isRendered ? '200px' : '0',
      }) as React.CSSProperties,
    [isRendered],
  );

  const code = props.element.value || '';

  return wrapSSR(
    <div
      ref={containerRef}
      className={classNames(baseCls, hashId)}
      contentEditable={false}
    >
      <div
        contentEditable={false}
        ref={divRef}
        className={classNames(hashId)}
        style={containerStyle}
        data-mermaid-container="true"
      />
      {error && (
        <div className={classNames(`${baseCls}-error`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
      {!renderedCode && !error && (
        <div className={classNames(`${baseCls}-empty`, hashId)}>
          <pre style={PRE_STYLE}>{code}</pre>
        </div>
      )}
    </div>,
  );
};
