import { useLocation } from '@rspress/core/runtime';
import { type RootProps } from '@rspress/core/theme';
import { Layout } from '@rspress/core/theme-original';
import React, { lazy, Suspense } from 'react';
import './agentic-site.css';

const DemoAntdProvider = lazy(() => import('./DemoAntdProvider'));

export function Root({ children }: RootProps) {
  const { pathname } = useLocation();

  // 普通文档页只渲染 Rspress 主题和 iframe 容器，无需加载完整 antd。
  // ConfigProvider 及 reset.css 仅在独立 demo 路由中按需加载。
  if (pathname.includes('/~demos/')) {
    return (
      <Suspense fallback={null}>
        <DemoAntdProvider>{children}</DemoAntdProvider>
      </Suspense>
    );
  }

  return children;
}

export * from '@rspress/core/theme-original';
export { Layout };
