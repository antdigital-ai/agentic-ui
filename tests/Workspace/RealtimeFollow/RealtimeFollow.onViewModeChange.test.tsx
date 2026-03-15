/**
 * 单独测试 RealtimeFollow 在 type=html 时传入 HtmlPreview 的 onViewModeChange 回调 (index.tsx 346)
 * 通过 mock HtmlPreview 在 mount 时调用 onViewModeChange，覆盖 data.onViewModeChange?.(m) 分支
 */

import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../src/I18n';
import { RealtimeFollow } from '../../../src/Workspace/RealtimeFollow';

vi.mock('../../../src/Workspace/RealtimeFollow/style', () => ({
  useRealtimeFollowStyle: vi.fn(() => undefined),
}));

vi.mock('../../../src/Workspace/HtmlPreview', () => {
  const React = require('react');
  return {
    HtmlPreview: (props: { onViewModeChange?: (mode: 'preview' | 'code') => void }) => {
      React.useEffect(() => {
        props.onViewModeChange?.('code');
      }, []);
      return React.createElement('div', { 'data-testid': 'mock-html-preview' }, React.createElement('iframe', { title: 'preview' }));
    },
  };
});

const mockLocale = {
  'workspace.terminalExecution': '终端执行',
  'workspace.createHtmlFile': '创建 HTML 文件',
  'workspace.markdownContent': 'Markdown 内容',
} as any;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('RealtimeFollow onViewModeChange (346)', () => {
  it('type=html 时 HtmlPreview 调用 onViewModeChange 会触发 data.onViewModeChange', () => {
    const onViewModeChange = vi.fn();

    render(
      <TestWrapper>
        <RealtimeFollow
          data={{
            type: 'html',
            content: '<h1>Test</h1>',
            onViewModeChange,
            status: 'done',
          }}
          htmlViewMode="preview"
        />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-testid="mock-html-preview"]')).toBeInTheDocument();
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });
});
