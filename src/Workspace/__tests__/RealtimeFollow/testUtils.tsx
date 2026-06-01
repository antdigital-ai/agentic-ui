/**
 * 共享测试工具：供 RealtimeFollow.test.tsx 与 RealtimeFollow/*.test.tsx 复用
 * 消除 mockLocale、TestWrapper 等重复定义
 */

import { ConfigProvider } from 'antd';
import React from 'react';
import { I18nContext } from '../../../src/I18n';

export const mockRealtimeFollowLocale = {
  'workspace.terminalExecution': '终端执行',
  'workspace.createHtmlFile': '创建 HTML 文件',
  'workspace.markdownContent': 'Markdown 内容',
  'htmlPreview.preview': '预览',
  'htmlPreview.code': '代码',
  'htmlPreview.renderFailed': '页面渲染失败',
} as const;

export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ConfigProvider>
    <I18nContext.Provider
      value={{ locale: mockRealtimeFollowLocale as any, language: 'zh-CN' }}
    >
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);
