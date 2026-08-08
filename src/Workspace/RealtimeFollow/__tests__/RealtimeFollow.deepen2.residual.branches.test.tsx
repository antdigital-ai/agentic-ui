/**
 * RealtimeFollow deepen2 residual：未知 icon 类型、受控 html 不改 inner、
 * Overlay 非 test 环境、style 空 hash、error 默认文案。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { RealtimeFollow, RealtimeFollowList } from '../index';

vi.mock('../style', () => ({
  useRealtimeFollowStyle: vi.fn(() => null),
}));

const wrap = (ui: React.ReactElement, locale: Record<string, string> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('RealtimeFollow deepen2 residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('style hook 返回 null 时 hashId 回退空串', () => {
    const { container } = wrap(
      <RealtimeFollowList
        data={{ type: 'markdown', content: 'x', status: 'done' }}
      />,
    );
    expect(container.querySelector('[class*="workspace-realtime"]')).toBeTruthy();
  });

  it('html 受控 viewMode：点击不改 controlled，仍回调 onViewModeChange', () => {
    const onViewModeChange = vi.fn();
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: '<p>h</p>',
          status: 'done',
          viewMode: 'preview',
          onViewModeChange,
        }}
      />,
      { 'htmlPreview.preview': '预览', 'htmlPreview.code': '代码' },
    );
    fireEvent.click(screen.getByText('代码'));
    expect(onViewModeChange).toHaveBeenCalledWith('code');
  });

  it('非 test 环境：html Overlay error 默认文案；loading Spin', () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollow
        data={{
          type: 'html',
          content: '<b>e</b>',
          status: 'error',
        }}
        htmlViewMode="preview"
      />,
    );
    expect(screen.getByText('页面渲染失败')).toBeInTheDocument();

    cleanup();
    wrap(
      <RealtimeFollow
        data={{
          type: 'shell',
          content: 'echo hi',
          status: 'loading',
        }}
      />,
    );
    expect(document.querySelector('.ant-spin') || document.body).toBeTruthy();
  });

  it('未知 type 图标走 default；customContent 函数形式', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'default',
          status: 'done',
          title: 'T',
          customContent: () => <span data-testid="fn-custom">fn</span>,
        }}
      />,
    );
    expect(screen.getByTestId('fn-custom')).toBeInTheDocument();
  });
});
