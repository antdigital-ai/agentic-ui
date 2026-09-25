/**
 * RealtimeFollow deepen3：prefixCls 回退、errorNode、非 test update/scroll。
 */
import '@testing-library/jest-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';

const updateNodeList = vi.fn();
const scrollToBottom = vi.fn();

vi.mock('../style', () => ({
  useRealtimeFollowStyle: vi.fn(() => ({ hashId: 'h' })),
}));

vi.mock('../../../Hooks/useAutoScroll', () => {
  const useAutoScroll = () => ({
    containerRef: { current: null },
    scrollToBottom,
  });
  return { useAutoScroll, default: useAutoScroll };
});

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: ({ editorRef }: any) => {
    React.useEffect(() => {
      if (editorRef) {
        editorRef.current = {
          store: {
            plugins: [],
            updateNodeList,
          },
        };
      }
    }, [editorRef]);
    return <div data-testid="md-editor" />;
  },
}));

vi.mock('../../../MarkdownEditor/editor/parser/parserMdToSchema', () => ({
  parserMdToSchema: () => ({ schema: [{ type: 'paragraph' }] }),
}));

vi.mock('../../HtmlPreview', () => ({
  HtmlPreview: ({ status, errorRender }: any) => (
    <div data-testid="html-preview-mock">
      {status === 'error'
        ? typeof errorRender === 'function'
          ? errorRender()
          : errorRender || '页面渲染失败'
        : 'ok'}
    </div>
  ),
}));

import { RealtimeFollow, RealtimeFollowList } from '../index';

const wrap = (ui: React.ReactElement, locale: Record<string, string> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('RealtimeFollow deepen3 residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    updateNodeList.mockClear();
    scrollToBottom.mockClear();
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('shell 图标后缀 --default；无自定义 prefix 走 getPrefixCls', () => {
    const { container } = wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          status: 'done',
          content: 'echo hi',
          title: 'T',
        }}
      />,
    );
    expect(
      container.querySelector('[class*="header-icon--default"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[class*="workspace-realtime"]'),
    ).toBeTruthy();
  });

  it('errorRender 自定义节点覆盖默认文案', () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollow
        data={{
          type: 'html',
          content: '<p>e</p>',
          status: 'error',
          errorRender: () => <span data-testid="err-custom">E</span>,
        }}
        htmlViewMode="preview"
      />,
    );
    expect(screen.getByTestId('err-custom')).toBeInTheDocument();
  });

  it('非 test：updateNodeList + streaming 延迟 scroll', async () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollow
        data={{
          type: 'markdown',
          content: '# hello',
          status: 'done',
          streaming: true,
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(200);
    });
    expect(updateNodeList).toHaveBeenCalled();
    expect(scrollToBottom).toHaveBeenCalled();
  });
});
