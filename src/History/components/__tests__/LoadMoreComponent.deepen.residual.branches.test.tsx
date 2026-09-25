/**
 * LoadMoreComponent deepen：Enter/Space；locale 缺省回退；task 文案。
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HistoryLoadMore } from '../LoadMoreComponent';

describe('LoadMoreComponent deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 locale 时显示默认文案；Enter 触发加载', async () => {
    const onLoadMore = vi.fn(async () => {});
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryLoadMore onLoadMore={onLoadMore} className="lm" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('查看更多')).toBeTruthy();
    fireEvent.keyDown(container.querySelector('[role="button"]')!, {
      key: 'Enter',
    });
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled());
  });

  it('task 类型默认文案；Space 触发', async () => {
    const onLoadMore = vi.fn(async () => {});
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryLoadMore onLoadMore={onLoadMore} type="task" className="lm" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('查看更多历史')).toBeTruthy();
    fireEvent.keyDown(container.querySelector('[role="button"]')!, {
      key: ' ',
    });
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled());
  });

  it('loading 中二次点击不重复调用', async () => {
    let resolve!: () => void;
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const { container } = render(
      <HistoryLoadMore onLoadMore={onLoadMore} className="lm" />,
    );
    const btn = container.querySelector('[role="button"]')!;
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
  });
});
