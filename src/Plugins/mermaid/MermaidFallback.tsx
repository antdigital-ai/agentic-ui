import { ConfigProvider, Skeleton } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

/**
 * 加载中的占位组件
 */
export const MermaidFallback = () => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls =
    context?.getPrefixCls('agentic-plugin-mermaid') || 'agentic-plugin-mermaid';
  const { wrapSSR, hashId } = useStyle(baseCls);

  return wrapSSR(
    <div className={classNames(`${baseCls}-fallback`, hashId)}>
      <Skeleton.Image
        active
        style={{
          width: '100%',
          minHeight: '200px',
          maxWidth: '800px',
        }}
      />
    </div>,
  );
};

