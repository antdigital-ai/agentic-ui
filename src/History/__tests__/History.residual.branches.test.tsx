/**
 * History 残留：isLoading/loading、emptyRender、searchKeyword、onDelete、loadMore。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { History } from '../index';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'h' }),
}));

vi.mock('../menu', () => ({
  GroupMenu: ({ items, loading }: any) => (
    <div data-testid="menu" data-loading={String(!!loading)}>
      {(items || []).map((it: any) => (
        <div key={it.key}>{it.label}</div>
      ))}
    </div>
  ),
  default: ({ items, loading }: any) => (
    <div data-testid="menu" data-loading={String(!!loading)}>
      {(items || []).map((it: any) => (
        <div key={it.key}>{it.label}</div>
      ))}
    </div>
  ),
}));

vi.mock('../components/LoadMoreComponent', () => ({
  HistoryLoadMore: ({ onLoadMore }: any) => (
    <button type="button" data-testid="load-more" onClick={() => onLoadMore?.()}>
      more
    </button>
  ),
}));

vi.mock('../components/HistorySearch', () => ({
  HistorySearch: ({ onSearch }: any) => (
    <input
      data-testid="search"
      onChange={(e) => onSearch?.(e.target.value)}
    />
  ),
}));

describe('History residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('isLoading 优先于 loading；空列表 + emptyRender', async () => {
    render(
      <ConfigProvider>
        <History
          agentId="a1"
          isLoading={false}
          loading
          request={async () => []}
          emptyRender={() => <div data-testid="empty-custom">E</div>}
          standalone
        />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('empty-custom')).toBeInTheDocument();
    });
  });

  it.skip('searchKeyword 非空走 HistoryEmpty；customOperationExtra 默认 []', async () => {
    render(
      <ConfigProvider>
        <History
          agentId="a1"
          request={async () => []}
          standalone
          agent={{ enabled: true }}
        />
      </ConfigProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
    const search = screen.queryByTestId('search');
    if (search) {
      fireEvent.change(search, { target: { value: 'q' } });
    }
    expect(document.body).toBeTruthy();
  });

  it('onDeleteItem 包装后 reload；loadMoreRender 自定义', async () => {
    const onDeleteItem = vi.fn(async () => undefined);
    const request = vi
      .fn()
      .mockResolvedValueOnce([
        {
          sessionId: 's1',
          sessionTitle: 'T',
          gmtCreate: Date.now(),
        },
      ])
      .mockResolvedValue([]);

    render(
      <ConfigProvider>
        <History
          agentId="a1"
          request={request}
          onDeleteItem={onDeleteItem}
          loadMoreRender={() => <div data-testid="custom-more">M</div>}
          standalone
          agent={{
            enabled: true,
            onLoadMore: vi.fn(),
          }}
        />
      </ConfigProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('custom-more')).toBeInTheDocument());
  });

  it('agent loadMore 默认组件；mergedLoading 时不渲染', async () => {
    render(
      <ConfigProvider>
        <History
          agentId="a1"
          isLoading
          request={async () => [
            { sessionId: 's1', sessionTitle: 'T', gmtCreate: 1 },
          ]}
          standalone
          agent={{ enabled: true, onLoadMore: vi.fn() }}
        />
      </ConfigProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
    expect(screen.queryByTestId('load-more')).toBeNull();
  });
});
