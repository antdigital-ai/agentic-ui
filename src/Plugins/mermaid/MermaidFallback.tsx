import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext } from 'react';
import { useStyle } from './style';

/**
 * Mermaid 源码预览组件
 * 在加载 / 未闭合 / 等待渲染等阶段展示原始 Mermaid 代码
 */
export const MermaidCodePreview = (props: { code: string }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'agentic-plugin-mermaid';
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
          {props.code}
        </pre>
      </div>
    </div>,
  );
};
