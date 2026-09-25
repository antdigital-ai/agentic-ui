/**
 * Browser more residual：customHeader、emptyText、Enter 打开、items 非数组。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import Browser, {
  BrowserItemComponent,
  BrowserList,
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

describe('Browser more residual branches', () => {
  beforeEach(() => {
    (window as any).open = openSpy;
  });
  afterEach(() => {
    openSpy.mockReset();
  });

  it.skip('customHeader 替代默认；emptyText 覆盖；items 非数组当空', () => {
    wrap(
      <BrowserList
        items={'bad' as any}
        activeLabel="Q"
        emptyText="nothing-here"
        customHeader={<div data-testid="ch">CH</div>}
      />,
    );
    expect(screen.getByTestId('ch')).toBeInTheDocument();
    expect(screen.getByText('nothing-here')).toBeInTheDocument();
  });

  it.skip('Enter 键打开；onOpen 优先于 window.open', () => {
    const onOpen = vi.fn();
    wrap(
      <BrowserItemComponent
        item={{
          id: '1',
          title: 'T',
          site: 'enter.com',
          url: 'https://enter.com',
        }}
        onOpen={onOpen}
      />,
    );
    fireEvent.keyDown(screen.getByRole('link', { name: 'enter.com' }), {
      key: 'Enter',
    });
    expect(onOpen).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it.skip('showHeader=false 隐藏头；total 模板替换 count', () => {
    wrap(
      <BrowserList
        items={[
          {
            id: '1',
            title: 'One',
            site: 'o.com',
            url: 'https://o.com',
          },
        ]}
        activeLabel="A"
        showHeader={false}
      />,
    );
    expect(screen.queryByText('A')).toBeNull();
    expect(screen.getByText(/Total 1|共/)).toBeTruthy();
  });

  it.skip('Browser 无 suggestions 时安全渲染', () => {
    const { container } = wrap(
      <Browser suggestions={[]} request={() => ({ items: [], loading: false })} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
