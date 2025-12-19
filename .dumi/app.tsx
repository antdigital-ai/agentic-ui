import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import React from 'react';
import './reset-ant.css';

export function rootContainer(container: any) {
  return React.createElement(
    ConfigProvider,
    {
      locale: zhCN,
      prefixCls: 'otk',
    },
    container,
  );
}
