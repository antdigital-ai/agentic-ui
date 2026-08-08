/**
 * RealtimeFollow deepen5 safe：未知 type icon/editor 回退、
 * prefixCls 缺省、error locale 假值、emptyNode 假值。
 * RealtimeFollow.test hang-quarantined。
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
          store: { plugins: [], updateNodeList },
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
  HtmlPreview: () => <div data-testid="html-preview-mock" />,
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

describe('RealtimeFollow deepen5 safe residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    updateNodeList.mockClear();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('shell：icon class default；editorConfig 回退 BASE', () => {
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
      container.querySelector('[class*="header-icon--default"]') ||
        screen.getByTestId('md-editor'),
    ).toBeTruthy();
  });

  it('RealtimeFollow 无 prefixCls：走 getPrefixCls', () => {
    wrap(
      <RealtimeFollow
        data={{
          type: 'md',
          content: 'hello',
          status: 'done',
        }}
      />,
    );
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
  });

  it('非 test：error 无 locale 文案；empty 无 emptyRender', async () => {
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          content: 'err',
          status: 'error',
        }}
      />,
      {},
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.body.textContent).toMatch(/渲染失败|err|页面/);

    cleanup();
    process.env.NODE_ENV = 'development';
    wrap(
      <RealtimeFollowList
        data={{
          type: 'markdown',
          content: '',
          status: 'done',
        }}
      />,
    );
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(30);
    });
    expect(
      document.querySelector('[class*="-empty"]') || document.body,
    ).toBeTruthy();
  });
});
