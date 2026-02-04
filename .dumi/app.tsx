import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import React, { useEffect } from 'react';

// quicklink for prefetching in-viewport links when network is good
//@ts-ignore
import { listen } from 'quicklink';
import './reset-ant.css';

// 包装组件，用于在应用级别使用 useAppData
const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      listen({ limit: 5 });
    } catch (e) {
      // ignore errors from quicklink
    }
  }, []);

  return <>{children}</>;
};

export function rootContainer(container: any) {
  return React.createElement(
    ConfigProvider,
    {
      locale: zhCN,
      prefixCls: 'otk',
    },
    React.createElement(AppWrapper, null, container),
  );
}
