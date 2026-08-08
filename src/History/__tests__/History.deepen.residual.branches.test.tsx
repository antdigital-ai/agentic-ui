/**
 * History deepen：standalone 空搜/emptyRender、LoadMore 早退、
 * NewChat/Search、getPopupContainer、locale 缺省标题。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';

vi.mock('../components', () => ({
  HistoryLoadMore: ({ onLoadMore }: { onLoadMore: () => void }) => (
    <button type="button" data-testid="load-more" onClick={onLoadMore}>
      加载更多
    </button>
  ),
  HistoryNewChat: ({ onNewChat }: { onNewChat: () => void }) => (
    <button type="button" data-testid="new-chat" onClick={onNewChat}>
      新对话
    </button>
  ),
  HistorySearch: ({ onSearch }: { onSearch: (value: string) => void }) => (
    <input
      data-testid="search-input"
      onChange={(e) => onSearch(e.target.value)}
      placeholder="搜索"
    />
  ),
  HistoryEmpty: () => <div data-testid="history-empty">找不到相关结果</div>,
  generateHistoryItems: vi.fn(({ filteredList }: { filteredList?: unknown[] }) => {
    if (!filteredList?.length) return [];
    return [
      {
        key: 'g1',
        label: '今日',
        type: 'group',
        children: [
          {
            key: 's1',
            label: '会话1',
            onClick: () => {},
          },
        ],
      },
    ];
  }),
}));

vi.mock('../menu', () => ({
  default: () => <div data-testid="group-menu">menu</div>,
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ title, children }: any) => (
    <button type="button" data-testid="history-icon" title={String(title)}>
      {children}
    </button>
  ),
}));

vi.mock('../../Hooks/useClickAway', () => ({
  default: () => {},
}));

import { History } from '../index';

const data = [
  {
    id: '1',
    sessionId: 's1',
    sessionTitle: '会话1',
    gmtCreate: Date.now(),
    gmtLastConverse: Date.now(),
  },
];

describe('History deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('standalone：空列表 + 搜索词 → HistoryEmpty；无 onLoadMore 不渲染 LoadMore', async () => {
    const request = vi.fn().mockResolvedValue([]);
    render(
      <ConfigProvider>
        <History
          agentId="a"
          sessionId="s"
          request={request}
          standalone
          agent={{
            enabled: true,
            onSearch: async () => [],
          }}
        />
      </ConfigProvider>,
    );
    await waitFor(() => expect(request).toHaveBeenCalled());
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'kw' } });
    await waitFor(() =>
      expect(screen.getByTestId('history-empty')).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('load-more')).toBeNull();
  });

  it('standalone：emptyRender；NewChat + Search + LoadMore', async () => {
    const emptyRender = vi.fn(() => <div data-testid="custom-empty">空</div>);
    const onNewChat = vi.fn();
    const onLoadMore = vi.fn().mockResolvedValue([]);
    const request = vi.fn().mockResolvedValue([]);
    render(
      <ConfigProvider>
        <History
          agentId="a"
          sessionId="s"
          request={request}
          standalone
          emptyRender={emptyRender}
          agent={{
            enabled: true,
            onNewChat,
            onSearch: async () => [],
            onLoadMore,
          }}
        />
      </ConfigProvider>,
    );
    await waitFor(() => expect(emptyRender).toHaveBeenCalled());
    expect(screen.getByTestId('new-chat')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('new-chat'));
    expect(onNewChat).toHaveBeenCalled();
  });

  it('Popover：locale 缺省标题；有列表时点开 getPopupContainer', async () => {
    const request = vi.fn().mockResolvedValue(data);
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <History agentId="a" sessionId="s1" request={request} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    await waitFor(() => expect(request).toHaveBeenCalled());
    const icon = screen.getByTestId('history-icon');
    expect(icon).toHaveAttribute('title', '历史记录');
    fireEvent.click(screen.getByTestId('history-button'));
    await waitFor(() =>
      expect(screen.getByTestId('group-menu')).toBeInTheDocument(),
    );
  });

  it('loadMoreRender 自定义；loading 时不走 LoadMore 默认', async () => {
    const request = vi.fn().mockResolvedValue(data);
    render(
      <ConfigProvider>
        <History
          agentId="a"
          sessionId="s1"
          request={request}
          standalone
          isLoading
          loadMoreRender={() => <div data-testid="custom-more">more</div>}
          agent={{
            enabled: true,
            onLoadMore: async () => [],
          }}
        />
      </ConfigProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('custom-more')).toBeInTheDocument(),
    );
  });
});
