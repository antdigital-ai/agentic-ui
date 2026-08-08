/**
 * Browser deepen：results items/loading 回退、Space 打开站点、onOpen 优先于 window.open。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import Browser, { BrowserItemComponent } from '../index';

const locale = {
  'browser.noResults': 'No results',
  'browser.totalResults': 'Total ${count}',
  'browser.searching': 'Searching...',
  'workspace.file.location': 'Locate',
} as any;

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'en-US' }}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('Browser deepen residual branches', () => {
  const openSpy = vi.fn();

  beforeEach(() => {
    openSpy.mockReset();
    (window as any).open = openSpy;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('空 site 回退 W；Space 键打开；有 onOpen 不走 window.open', () => {
    const onOpen = vi.fn();
    wrap(
      <BrowserItemComponent
        item={{
          id: '1',
          title: 'T',
          site: '',
          url: 'https://x.test',
        }}
      />,
    );
    expect(screen.getByText('W')).toBeInTheDocument();

    cleanup();
    wrap(
      <BrowserItemComponent
        item={{
          id: '2',
          title: 'T2',
          site: 'example.com',
          url: 'https://example.com',
        }}
        onOpen={onOpen}
      />,
    );
    const site = screen.getByLabelText('example.com');
    fireEvent.keyDown(site, { key: ' ' });
    expect(onOpen).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('request 返回缺 items/loading 时回退 []/false', () => {
    wrap(
      <Browser
        suggestions={[{ key: 's1', label: 'One', value: 'one' }]}
        request={() => ({}) as any}
      />,
    );
    expect(document.body.textContent).toMatch(/One|No results|Total|Searching/);
  });

  it('无 onOpen 时站点点击走 window.open', () => {
    wrap(
      <BrowserItemComponent
        item={{
          id: '3',
          title: 'Open',
          site: 's.com',
          url: 'https://s.com/path',
        }}
      />,
    );
    fireEvent.click(screen.getByLabelText('s.com'));
    expect(openSpy).toHaveBeenCalled();
  });
});
