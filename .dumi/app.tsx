import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { usePrefersColor } from 'dumi';
import React, { useEffect } from 'react';

// quicklink for prefetching in-viewport links when network is good
//@ts-ignore
import { listen } from 'quicklink';
import './reset-ant.css';

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [color] = usePrefersColor();
  const isDark = color === 'dark';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      listen({ limit: 5 });
    } catch (e) {
      // ignore errors from quicklink
    }
  }, []);

  return React.createElement(
    ConfigProvider,
    {
      locale: zhCN,
      prefixCls: 'otk',
      theme: {
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      },
    },
    children,
  );
};

export function rootContainer(container: any) {
  return React.createElement(AppWrapper, null, container);
}
