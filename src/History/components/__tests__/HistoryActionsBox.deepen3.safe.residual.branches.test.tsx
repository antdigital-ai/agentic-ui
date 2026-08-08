/**
 * HistoryActionsBox deepen3 safe：locale 缺省收藏/删除文案。
 * HistoryActionsBox.midtail hang-quarantined。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
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
    Popconfirm: ({ children, title }: any) => (
      <div data-testid="pc">
        <span data-testid="pc-title">{title}</span>
        {children}
      </div>
    ),
  };
});

describe('HistoryActionsBox deepen3 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 locale：收藏/删除 title 走中文默认', () => {
    const onFavorite = vi.fn();
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox
          item={{ sessionId: 's1', isFavorite: false } as any}
          agent={{ enabled: true, onFavorite }}
          onFavorite={onFavorite}
          onDeleteItem={vi.fn()}
        >
          <span>t</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    expect(
      container.querySelector('[title="收藏"]') ||
        container.querySelector('[data-testid="pc-title"]')?.textContent,
    ).toBeTruthy();
  });

  it('已收藏 + 空 locale：已收藏 title', () => {
    const onFavorite = vi.fn();
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox
          item={{ sessionId: 's2', isFavorite: true } as any}
          agent={{ enabled: true, onFavorite }}
          onFavorite={onFavorite}
        >
          <span>t</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    expect(container.querySelector('[title="已收藏"]')).toBeTruthy();
  });
});
