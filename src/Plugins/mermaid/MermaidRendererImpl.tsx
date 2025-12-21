import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo, useRef } from 'react';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { CodeNode } from '../../MarkdownEditor/el';
import { useStyle } from './style';
import { useMermaidRender } from './useMermaidRender';

/**
 * Mermaid 渲染器组件实现
 * 负责实际的图表渲染逻辑
 */
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
  const style = useMemo(
    () =>
      ({
        visibility: isRendered ? 'visible' : 'hidden',
        pointerEvents: isRendered ? 'auto' : 'none',
        width: '100%',
        height: isRendered ? '100%' : '0',
        overflow: isRendered ? 'auto' : 'hidden',
        maxHeight: isRendered ? '100%' : '0',
        minHeight: isRendered ? '200px' : '0',
      }) as React.CSSProperties,
    [isRendered],
  );

  const renderCode = props.element.value || '';

  const dom = (
    <div
      ref={containerRef}
      className={classNames(baseCls, hashId)}
      contentEditable={false}
    >
      {/* 渲染容器：增加多层隔离 */}
      <div
        contentEditable={false}
        ref={divRef}
        className={classNames(hashId)}
        style={style}
        data-mermaid-container="true"
      ></div>
      {/* 错误状态显示：展示原始代码 */}
      {error && (
        <div className={classNames(`${baseCls}-error`, hashId)}>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {renderCode}
          </pre>
        </div>
      )}
      {/* 空状态显示 */}
      {!renderedCode && !error && (
        <div className={classNames(`${baseCls}-empty`, hashId)}>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {renderCode}
          </pre>
        </div>
      )}
    </div>
  );

  return wrapSSR(dom);
};

