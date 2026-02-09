import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext } from 'react';
import { useStyle } from './style';

export const TextStyleTag = (props: { children: React.ReactNode }) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-text-style-tag');
  const { wrapSSR, hashId } = useStyle(baseCls);
  return wrapSSR(
    <span className={classNames(baseCls, hashId)}>{props.children}</span>,
  );
};
