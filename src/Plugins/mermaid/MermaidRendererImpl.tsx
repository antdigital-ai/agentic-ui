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

  return wrapSSR(
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
        style={{
          visibility: renderedCode && !error ? 'visible' : 'hidden',
          pointerEvents: renderedCode && !error ? 'auto' : 'none',
        }}
        data-mermaid-container="true"
      ></div>
      {/* 错误状态显示 */}
      {error && (
        <div className={classNames(`${baseCls}-error`, hashId)}>{error}</div>
      )}
      {/* 空状态显示 */}
      {!renderedCode && !error && (
        <div className={classNames(`${baseCls}-empty`, hashId)}>Empty</div>
      )}
    </div>,
  );
};
