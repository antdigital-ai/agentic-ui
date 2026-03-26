import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { lazy, Suspense, useContext } from 'react';
import { CodeNode } from '../../MarkdownEditor/el';
import { isBrowser } from './env';
import { MermaidFallback } from './MermaidFallback';
import { MermaidRendererImpl } from './MermaidRendererImpl';
import { useStyle } from './style';
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
 * 代码块未闭合时的占位组件，展示原始 Mermaid 代码
 */
const MermaidUnfinished = (props: { element: CodeNode }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'plugin-mermaid';
  const { wrapSSR, hashId } = useStyle(baseCls);

  return wrapSSR(
    <div
      className={classNames(baseCls, hashId)}
      contentEditable={false}
    >
      <div className={classNames(`${baseCls}-empty`, hashId)}>
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {props.element.value || ''}
        </pre>
      </div>
    </div>,
  );
};

/**
 * Mermaid 组件 - Mermaid图表渲染组件
 *
 * 仅在代码块闭合（otherProps.finished !== false）时才渲染图表，
 * 否则展示原始代码。各状态通过 CSS animation（fadeIn）实现平滑过渡，
 * 渲染容器内部通过 opacity/height transition 避免视觉抖动。
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
    return <MermaidUnfinished element={props.element} />;
  }

  return (
    <Suspense fallback={<MermaidFallback />}>
      <MermaidRenderer element={props.element} />
    </Suspense>
  );
};
