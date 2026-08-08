/**
 * SuggestionList deepen：showMore 默认文案、键盘、onItemClick、overflow 无 node。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { SuggestionList } from '../index';

describe('SuggestionList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('showMore 无 text/icon 走 locale/默认；Enter/Space 触发', () => {
    const onClick = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            items={[{ key: '1', text: 'Ask' }]}
            showMore={{ enable: true, onClick }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('搜索更多')).toBeInTheDocument();
    const more = screen.getByRole('button', { name: '搜索更多' });
    fireEvent.keyDown(more, { key: 'Enter' });
    fireEvent.keyDown(more, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('无 item.onClick 走 onItemClick；disabled 键盘早退；无 label aria', async () => {
    const onItemClick = vi.fn(async () => undefined);
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            onItemClick={onItemClick}
            items={[
              { key: 'a', text: 'Go' },
              { key: 'd', text: 'Nope', disabled: true },
              { key: 'n', text: undefined as any },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Go'));
    await waitFor(() => expect(onItemClick).toHaveBeenCalled());

    const disabled = screen.getByText('Nope').closest('[role="button"]');
    if (disabled) {
      fireEvent.keyDown(disabled, { key: 'Enter' });
    }
    expect(onItemClick).toHaveBeenCalledTimes(1);

    const go = screen.getByText('Go').closest('[role="button"]');
    if (go) {
      fireEvent.keyDown(go, { key: 'Enter' });
      fireEvent.keyDown(go, { key: ' ' });
    }
    await waitFor(() => expect(onItemClick.mock.calls.length).toBeGreaterThan(1));
  });

  it('forceShow tooltip；MutationObserver 缺失仍可渲染', () => {
    const Orig = globalThis.MutationObserver;
    // @ts-expect-error force undefined branch
    globalThis.MutationObserver = undefined;
    try {
      render(
        <ConfigProvider>
          <SuggestionList
            items={[{ key: 't', text: 'Tip', tooltip: 'full tip' }]}
          />
        </ConfigProvider>,
      );
      expect(screen.getByText('Tip')).toBeInTheDocument();
    } finally {
      globalThis.MutationObserver = Orig;
    }
  });
});
