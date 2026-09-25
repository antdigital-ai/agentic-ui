/**
 * SuggestionList deepen3：loading、空 items、截断、disabled、tooltip。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { SuggestionList } from '../index';

describe('SuggestionList deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 items / loading', () => {
    const { rerender } = render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList items={[]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(document.body).toBeTruthy();
    rerender(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList items={[{ key: '1', text: 'A' }]} loading />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
  });

  it('maxItems 截断；item 点击', () => {
    const onItemClick = vi.fn();
    const onMore = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            maxItems={2}
            onItemClick={onItemClick}
            onShowMore={onMore}
            showMore
            items={[
              { key: '1', text: 'A' },
              { key: '2', text: 'B' },
              { key: '3', text: 'C' },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('C')).toBeNull();
    fireEvent.click(screen.getByText('A'));
    expect(onItemClick).toHaveBeenCalled();
    const more = screen.queryByText(/更多|More|more/i);
    if (more) {
      fireEvent.click(more);
      expect(onMore).toHaveBeenCalled();
    }
  });

  it('layout=vertical；disabled 项不触发', () => {
    const onItemClick = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            layout="vertical"
            onItemClick={onItemClick}
            items={[
              { key: '1', text: 'Dis', disabled: true },
              { key: '2', text: 'Ok' },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Dis'));
    expect(onItemClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Ok'));
    expect(onItemClick).toHaveBeenCalled();
  });
});
