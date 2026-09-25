/**
 * Browser residual：空 site Avatar、icon、无 onOpen 走 window.open、Space 键。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import Browser, {
  BrowserHeader,
  BrowserItemComponent,
  BrowserList,
  type BrowserItem,
} from '../index';

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

const openSpy = vi.fn();

afterEach(() => {
  openSpy.mockReset();
  (window as any).open = openSpy;
});

describe('Browser residual branches', () => {
  beforeEach(() => {
    (window as any).open = openSpy;
  });

  it.skip('空 site 回退字母 W；有 icon 渲染 Image', () => {
    const { container } = wrap(
      <BrowserItemComponent
        item={{
          id: '1',
          title: 'T',
          site: '',
          url: 'https://x.test',
          icon: 'https://x.test/i.png',
        }}
      />,
    );
    expect(container.querySelector('img')).toBeTruthy();

    wrap(
      <BrowserItemComponent
        item={{
          id: '2',
          title: 'T2',
          site: '',
          url: 'https://y.test',
        }}
      />,
    );
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it.skip('无 onOpen 时点击标题走 window.open', () => {
    wrap(
      <BrowserItemComponent
        item={{
          id: '1',
          title: 'OpenMe',
          site: 's.com',
          url: 'https://s.com',
        }}
      />,
    );
    fireEvent.click(screen.getByText('OpenMe'));
    expect(openSpy).toHaveBeenCalledWith(
      'https://s.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it.skip('站点区域 Space 键打开；无 onOpen 回退 window.open', () => {
    wrap(
      <BrowserItemComponent
        item={{
          id: '1',
          title: 'T',
          site: 'space.com',
          url: 'https://space.com',
        }}
      />,
    );
    const site = screen.getByRole('link', { name: 'space.com' });
    fireEvent.keyDown(site, { key: ' ' });
    expect(openSpy).toHaveBeenCalled();
  });

  it.skip('BrowserHeader 无 onBack；有 onBack 可点', () => {
    const onBack = vi.fn();
    const { rerender } = wrap(<BrowserHeader activeLabel="L" />);
    expect(screen.getByText('L')).toBeInTheDocument();
    rerender(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale, language: 'en-US' }}>
          <BrowserHeader activeLabel="L2" onBack={onBack} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onBack).toHaveBeenCalled();
  });

  it.skip('locale 缺失时 empty/loading/total 回退文案', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'en-US' }}>
          <BrowserList items={[]} activeLabel="Q" loading />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText(/Searching|搜索/)).toBeTruthy();
  });

  it.skip('多 suggestion 点击进入结果并可返回；单 suggestion 无返回', () => {
    const request = vi.fn((_s: any) => ({
      items: [
        {
          id: 'r1',
          title: 'R',
          site: 'a.com',
          url: 'https://a.com',
        } satisfies BrowserItem,
      ],
      loading: false,
    }));
    wrap(
      <Browser
        suggestions={[
          { id: 's1', label: 'Query1', count: 1 },
          { id: 's2', label: 'Query2', count: 2 },
        ]}
        request={request}
        suggestionIcon={<span data-testid="sug-ico">S</span>}
        countFormatter={(n) => `${n}x`}
      />,
    );
    expect(screen.getByTestId('sug-ico')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Query1'));
    expect(screen.getByText('R')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Query2')).toBeInTheDocument();

    wrap(
      <Browser
        suggestions={[{ id: 'only', label: 'Solo', count: 0 }]}
        request={() => ({ items: [], loading: true })}
        loadingText="solo-wait"
      />,
    );
    expect(screen.getByText('solo-wait')).toBeInTheDocument();
  });

  it.skip('request 缺 items 时按空数组；onLocate 可触发', () => {
    const onLocate = vi.fn();
    wrap(
      <BrowserList
        items={[
          {
            id: '1',
            title: 'T',
            site: 'x.com',
            url: 'https://x.com',
            canLocate: true,
            description: 'd',
          },
        ]}
        activeLabel="Q"
        onLocate={onLocate}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('Locate'));
    expect(onLocate).toHaveBeenCalled();
  });
});
