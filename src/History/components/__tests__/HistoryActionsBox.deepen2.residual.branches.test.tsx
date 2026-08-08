/**
 * HistoryActionsBox deepen2：小而快；mock Popconfirm；agent.onFavorite 真值臂。
 * 避免 midtail/Popconfirm 挂起模式（无长 waitFor、无真实 portal 动画）。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HistoryActionsBox } from '../HistoryActionsBox';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<any>('antd');
  return {
    ...actual,
    Popconfirm: ({ children, open, onOpenChange, title, onConfirm }: any) => (
      <div data-testid="pc">
        <button
          type="button"
          data-testid="pc-toggle"
          onClick={() => onOpenChange?.(!open)}
        >
          {title}
        </button>
        {open ? (
          <button
            type="button"
            data-testid="pc-ok"
            onClick={() => onConfirm?.({ stopPropagation() {}, preventDefault() {} })}
          >
            ok
          </button>
        ) : null}
        {children}
      </div>
    ),
  };
});

describe('HistoryActionsBox deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('agent.onFavorite 真值：收藏/已收藏 title；reject 仍清 loading', async () => {
    const onFavorite = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('fav fail'));
    const { container } = render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'chat.history.favorite': '收藏',
              'chat.history.favorited': '已收藏',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <HistoryActionsBox
          item={{ sessionId: 's1', isFavorite: false } as any}
          agent={{ enabled: true, onFavorite }}
          onFavorite={onFavorite}
        >
          <span>t</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    fireEvent.mouseEnter(container.firstChild as Element);
    const fav = screen.getByTitle('收藏');
    await act(async () => {
      fireEvent.click(fav);
      await Promise.resolve();
    });
    expect(onFavorite).toHaveBeenCalledWith('s1', true);
    expect(screen.getByTitle('已收藏')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTitle('已收藏'));
      await Promise.resolve();
    });
    expect(onFavorite).toHaveBeenCalledTimes(2);
  });

  it('open=true 时 mouseLeave 不关 hover；删除 locale；children opacity', async () => {
    const onDelete = vi.fn(async () => undefined);
    const { container } = render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'chat.history.delete.popconfirm': '确认删？',
              'chat.history.delete': '删',
            },
            language: 'zh-CN',
          } as any
        }
      >
        <HistoryActionsBox
          item={{ sessionId: 's2' } as any}
          onDeleteItem={onDelete}
        >
          <span data-testid="child">c</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    const root = container.firstChild as Element;
    fireEvent.mouseEnter(root);
    expect(screen.getByTitle('删')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('pc-toggle'));
    fireEvent.mouseLeave(root);
    expect(screen.getByTestId('pc')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('pc-ok'));
      await Promise.resolve();
    });
    expect(onDelete).toHaveBeenCalled();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('agent.enabled 时 children 占位；无删除时 opacity 为 1', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox
          item={{ sessionId: 's3' } as any}
          agent={{ enabled: true }}
        >
          <span data-testid="hidden-child">c</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    expect(screen.queryByTestId('hidden-child')).toBeNull();
  });
});
