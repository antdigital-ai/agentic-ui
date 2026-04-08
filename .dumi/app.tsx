import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import React, { useEffect, useState } from 'react';

// quicklink for prefetching in-viewport links when network is good
//@ts-ignore
import { listen } from 'quicklink';
import './reset-ant.css';

const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.getAttribute('data-prefers-color') === 'dark';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(
        document.documentElement.getAttribute('data-prefers-color') === 'dark',
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-prefers-color'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useDarkMode();

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
