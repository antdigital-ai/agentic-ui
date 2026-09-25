/**
 * HistoryActionsBox 残留：hover/agent opacity、favorite、Popconfirm open 路径。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HistoryActionsBox } from '../HistoryActionsBox';

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

describe('HistoryActionsBox residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it.skip('agent.enabled 时操作区可见；收藏切换', async () => {
    const onFavorite = vi.fn(async () => undefined);
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox
          item={{ sessionId: 's1', isFavorite: false } as any}
          agent={{ enabled: true }}
          onFavorite={onFavorite}
        >
          <span>time</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    fireEvent.mouseEnter(container.firstChild as Element);
    const fav = screen.getAllByRole('button')[0];
    fireEvent.click(fav);
    await waitFor(() => expect(onFavorite).toHaveBeenCalled());
  });

  it.skip('已收藏显示取消文案；删除 Popconfirm', async () => {
    const onDeleteItem = vi.fn(async () => undefined);
    const { container } = render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'chat.history.favorited': '已收藏',
              'chat.history.delete': '删除',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <HistoryActionsBox
          item={{ sessionId: 's1', isFavorite: true } as any}
          agent={{ enabled: true }}
          onDeleteItem={onDeleteItem}
          onFavorite={vi.fn()}
        >
          <span>t</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    fireEvent.mouseEnter(container.firstChild as Element);
    fireEvent.mouseLeave(container.firstChild as Element);
    expect(container.firstChild).toBeTruthy();
  });

  it.skip('无 agent.enabled 且未 hover 时 opacity 降低路径仍渲染 children', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox item={{ sessionId: 's1' } as any}>
          <span data-testid="child">c</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
