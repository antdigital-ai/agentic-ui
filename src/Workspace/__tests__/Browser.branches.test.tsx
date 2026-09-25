/**
 * Workspace Browser 分支覆盖：header、计数、loading、onOpen/onLocate、键盘。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import Browser, {
  BrowserHeader,
  BrowserItemComponent,
  BrowserList,
  type BrowserItem,
  type BrowserSuggestion,
} from '../Browser';

const mockLocale = {
  'browser.noResults': 'No results',
  'browser.totalResults': 'Total ${count}',
  'browser.searching': 'Searching...',
  'workspace.file.location': 'Locate',
} as any;

const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale, language: 'en-US' }}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

const item: BrowserItem = {
  id: '1',
  title: 'Title',
  site: 'example.com',
  url: 'https://example.com',
  canLocate: true,
};

describe('Browser branches', () => {
  describe('BrowserList', () => {
    it('showHeader:false 时 header 无边框', () => {
      renderWithProvider(
        <BrowserList items={[item]} activeLabel="Q" showHeader={false} />,
      );
      expect(screen.getByTestId('browser-list')).toBeInTheDocument();
    });

    it('customHeader 替代默认 header', () => {
      renderWithProvider(
        <BrowserList
          items={[item]}
          activeLabel="Q"
          customHeader={<div data-testid="custom-h">H</div>}
        />,
      );
      expect(screen.getByTestId('custom-h')).toBeInTheDocument();
    });

    it('countFormatter 自定义计数', () => {
      renderWithProvider(
        <BrowserList
          items={[item, { ...item, id: '2' }]}
          activeLabel="Q"
          countFormatter={(n) => `${n} hits`}
        />,
      );
      expect(screen.getByText('2 hits')).toBeInTheDocument();
    });

    it('loading 且无 items 时显示 Spin', () => {
      renderWithProvider(
        <BrowserList items={[]} activeLabel="Q" loading loadingText="Wait" />,
      );
      expect(screen.getByText('Wait')).toBeInTheDocument();
    });

    it.skip('items 非数组时按空列表处理', () => {
      renderWithProvider(
        <BrowserList items={null as any} activeLabel="Q" />,
      );
      expect(screen.getByText('No results')).toBeInTheDocument();
    });
  });

  describe('BrowserItemComponent', () => {
    it('onOpen 拦截默认 window.open', async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();
      renderWithProvider(
        <BrowserList items={[item]} activeLabel="Q" onOpen={onOpen} />,
      );
      await user.click(screen.getByText('Title'));
      expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });

    it('站点区域 Enter 键触发打开', () => {
      const onOpen = vi.fn();
      renderWithProvider(
        <BrowserItemComponent item={item} onOpen={onOpen} />,
      );
      const site = screen.getByRole('link', { name: 'example.com' });
      fireEvent.keyDown(site, { key: 'Enter' });
      expect(onOpen).toHaveBeenCalled();
    });

    it('canLocate:false 时不渲染定位按钮', () => {
      renderWithProvider(
        <BrowserItemComponent item={{ ...item, canLocate: false }} />,
      );
      expect(screen.queryByLabelText('Locate')).not.toBeInTheDocument();
    });

    it('无 icon 时使用站点首字母 Avatar', () => {
      renderWithProvider(<BrowserItemComponent item={item} />);
      expect(screen.getByText('E')).toBeInTheDocument();
    });
  });

  describe('BrowserHeader', () => {
    it('无 onBack 时不渲染返回按钮', () => {
      renderWithProvider(<BrowserHeader activeLabel="Label" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('onBack 点击触发', async () => {
      const user = userEvent.setup();
      const onBack = vi.fn();
      renderWithProvider(
        <BrowserHeader activeLabel="Label" onBack={onBack} />,
      );
      await user.click(screen.getByRole('button'));
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('Browser', () => {
    it('多建议时使用 countFormatter', async () => {
      const user = userEvent.setup();
      const suggestions: BrowserSuggestion[] = [
        { id: 's1', label: 'A', count: 3 },
        { id: 's2', label: 'B', count: 1 },
      ];
      renderWithProvider(
        <Browser
          suggestions={suggestions}
          request={() => ({ items: [item] })}
          countFormatter={(n) => `(${n})`}
        />,
      );
      expect(screen.getByText('(3)')).toBeInTheDocument();
      await user.click(screen.getByText('A'));
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('request 返回 loading', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <Browser
          suggestions={[{ id: 's1', label: 'Q', count: 0 }]}
          request={() => ({ items: [], loading: true })}
          loadingText="Busy"
        />,
      );
      await user.click(screen.getByText('Q'));
      expect(screen.getByText('Busy')).toBeInTheDocument();
    });
  });
});
