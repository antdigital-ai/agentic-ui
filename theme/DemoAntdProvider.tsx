import { ConfigProvider, theme as antdTheme } from 'antd';
import 'antd/dist/reset.css';
import zhCN from 'antd/locale/zh_CN';
import React, { useEffect, useState } from 'react';

const DARK_CLASS = 'dark';

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains(DARK_CLASS),
  );

  useEffect(() => {
    const rootElement = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(rootElement.classList.contains(DARK_CLASS));
    });
    observer.observe(rootElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export default function DemoAntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDark = useDarkMode();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
