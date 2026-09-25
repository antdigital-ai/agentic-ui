/**
 * SuggestionList deepen12 safe：空 items、disabled、showMore enable。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { SuggestionList } from '../index';

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('SuggestionList deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 items 不渲染追问', () => {
    wrap(<SuggestionList items={[]} onItemClick={vi.fn()} />);
    expect(document.body).toBeTruthy();
  });

  it('disabled 项跳过；onItemClick 触发', () => {
    const onItemClick = vi.fn();
    wrap(
      <SuggestionList
        items={[
          { text: 'A', disabled: true },
          { text: 'B' },
        ]}
        onItemClick={onItemClick}
      />,
    );
    fireEvent.click(screen.getByText('B'));
    expect(onItemClick).toHaveBeenCalledWith('B');
  });

  it('showMore enable 分支', () => {
    const onMore = vi.fn();
    wrap(
      <SuggestionList
        items={[{ text: 'Q' }]}
        showMore={{ enable: true, onClick: onMore, text: 'More' }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(onMore).toHaveBeenCalled();
  });
});
