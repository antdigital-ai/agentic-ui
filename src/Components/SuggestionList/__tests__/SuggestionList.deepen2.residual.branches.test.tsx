/**
 * SuggestionList deepen2：OverflowTooltip 默认 forceShow、
 * item.onClick、disabled 键盘、showMore 缺省文案。
 */
import '@testing-library/jest-dom';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { SuggestionList } from '../index';

function actResize() {
  fireEvent.resize(window);
}

describe('SuggestionList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('无 tooltip：默认 forceShow=false；item.onClick 优先', async () => {
    const onClick = vi.fn(async () => undefined);
    const onItemClick = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            onItemClick={onItemClick}
            items={[{ key: '1', text: 'Own', onClick }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('Own'));
    await waitFor(() => expect(onClick).toHaveBeenCalled());
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('showMore 无 text：locale 缺省；Enter/Space', () => {
    const onMore = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            items={[{ key: 'a', text: 'Ask' }]}
            showMore={{ enable: true, onClick: onMore }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    const more = screen.getByRole('button', { name: '搜索更多' });
    fireEvent.keyDown(more, { key: 'Enter' });
    fireEvent.keyDown(more, { key: ' ' });
    fireEvent.keyDown(more, { key: 'Tab' });
    expect(onMore).toHaveBeenCalledTimes(2);
  });

  it('item 键盘 Enter/Space；disabled 早退', async () => {
    const onItemClick = vi.fn(async () => undefined);
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <SuggestionList
            onItemClick={onItemClick}
            items={[
              { key: 'go', text: 'Go' },
              { key: 'no', text: 'Nope', disabled: true },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    const go = screen.getByText('Go').closest('[role="button"]')!;
    fireEvent.keyDown(go, { key: 'Enter' });
    fireEvent.keyDown(go, { key: ' ' });
    fireEvent.keyDown(go, { key: 'a' });
    await waitFor(() =>
      expect(onItemClick.mock.calls.length).toBeGreaterThanOrEqual(1),
    );

    const disabled = screen.getByText('Nope').closest('[role="button"]')!;
    fireEvent.keyDown(disabled, { key: 'Enter' });
    fireEvent.keyDown(disabled, { key: ' ' });
  });

  it('overflow：scrollWidth>clientWidth 触发 tooltip 臂', () => {
    const orig = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollWidth',
    );
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get() {
        return 200;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 40;
      },
    });
    try {
      render(
        <ConfigProvider>
          <SuggestionList
            items={[{ key: 'long', text: 'Very long suggestion text here' }]}
          />
        </ConfigProvider>,
      );
      expect(screen.getByText(/Very long/)).toBeInTheDocument();
      actResize();
    } finally {
      if (orig) {
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', orig);
      }
    }
  });
});
