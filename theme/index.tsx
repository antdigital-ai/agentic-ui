import { ConfigProvider, theme as antdTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import type { RootProps } from '@rspress/core/theme';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './agentic-site.css';

const DARK_CLASS = 'dark';

/**
 * 监听 <html> class 变化得到暗色态。
 * 不依赖 @rspress/core/theme 内部 hook（2.x 未导出 useDark，跨小版本稳定）。
 */
function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains(DARK_CLASS),
  );

  useEffect(() => {
    const rootEl = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(rootEl.classList.contains(DARK_CLASS));
    });
    observer.observe(rootEl, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/**
 * antd ConfigProvider 包装：跟随 Rspress 明暗主题切换算法。
 */
function AntdProvider({ children }: { children: React.ReactNode }) {
  const isDark = useDarkMode();
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function Root({ children }: RootProps) {
  return <AntdProvider>{children}</AntdProvider>;
}

export * from '@rspress/core/theme-original';
export { Layout } from '@rspress/core/theme-original';
