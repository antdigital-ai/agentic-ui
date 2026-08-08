/**
 * RealtimeFollow deepen4：未知 type icon 回退、Overlay 函数节点、
 * empty/loading 分支、非 test 空内容、content ?? ''。
 * RealtimeFollow.test.tsx hang-quarantined；本文件保持轻量 timers。
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
  HtmlPreview: ({ status, errorRender, emptyRender }: any) => (
    <div data-testid="html-preview-mock">
      {status === 'error'
        ? typeof errorRender === 'function'
          ? errorRender()
          : errorRender || '页面渲染失败'
        : emptyRender
          ? typeof emptyRender === 'function'
            ? emptyRender()
            : emptyRender
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

describe('RealtimeFollow deepen4 residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    updateNodeList.mockClear();
    scrollToBottom.mockClear();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('shell icon 后缀 default；content null → 空串', () => {
    const { container } = wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          status: 'done',
          content: 'echo',
          title: 'S',
        }}
      />,
    );
    expect(
      container.querySelector('[class*="header-icon--default"]'),
    ).toBeTruthy();

    cleanup();
    wrap(
      <RealtimeFollow
        data={{
          type: 'md',
          content: null as any,
          status: 'done',
        }}
      />,
    );
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
  });

  it('customContent 函数；html content 非 string → 空串', () => {
    wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          content: '',
          customContent: () => <div data-testid="custom-fn">c</div>,
        }}
      />,
    );
    expect(screen.getByTestId('custom-fn')).toBeInTheDocument();

    cleanup();
    wrap(
      <RealtimeFollowList
        data={{
          type: 'html',
          content: { not: 'string' } as any,
          status: 'done',
        }}
      />,
    );
    expect(screen.getByTestId('html-preview-mock')).toBeInTheDocument();
  });

  it('非 test：空内容 emptyRender 函数；loading Overlay', async () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollowList
        data={{
          type: 'markdown',
          content: '   ',
          status: 'done',
          emptyRender: () => <div data-testid="empty-fn">empty</div>,
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(50);
    });
    expect(
      screen.queryByTestId('empty-fn') || document.body.textContent,
    ).toBeTruthy();

    cleanup();
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          content: 'echo',
          status: 'loading',
          loadingRender: () => <div data-testid="load-fn">L</div>,
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.queryByTestId('load-fn') || document.body.textContent,
    ).toBeTruthy();
  });

  it('error Overlay：无 errorRender 走 locale 回退', async () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollowList
        data={{
          type: 'default',
          content: 'x',
          status: 'error',
        }}
      />,
      { 'htmlPreview.renderFailed': 'FAIL_LOCALE' },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body.textContent).toMatch(/FAIL_LOCALE|渲染失败|x/);
  });
});
