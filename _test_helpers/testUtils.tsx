import { ConfigProvider } from 'antd';
import React from 'react';
import { I18nProvide } from '../src/I18n';

/**
 * 测试环境的 ConfigProvider 配置
 * 设置正确的前缀以匹配组件期望
 */
export const TestConfigProvider: React.FC<{
  children: React.ReactNode;
  prefixCls?: string;
}> = ({ children, prefixCls = 'ant-agentic' }) => (
  <ConfigProvider prefixCls={prefixCls}>
    <I18nProvide>{children}</I18nProvide>
  </ConfigProvider>
);

/**
 * 默认的测试包装器
 * 提供 ConfigProvider 和 I18n 上下文
 */
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <TestConfigProvider>{children}</TestConfigProvider>;
