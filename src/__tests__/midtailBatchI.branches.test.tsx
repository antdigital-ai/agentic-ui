/**
 * Midtail batch I（exclusive #7）：Browser / Realtime / Enlargement / HistoryRunning / ChatBoot。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../_test_helpers/testUtils';
import ButtonTab from '../ChatBootPage/ButtonTab';
import CaseReply from '../ChatBootPage/CaseReply';
import {
  HistoryRunningIcon,
  HistoryRunningIconContainer,
} from '../History/components/HistoryRunningIcon';
import { I18nContext } from '../I18n';
import Enlargement from '../MarkdownInputField/Enlargement';
import Browser, {
  BrowserHeader,
  BrowserItemComponent,
  BrowserList,
} from '../Workspace/Browser';
import {
  getContentForEditor,
  RealtimeFollow,
  RealtimeFollowList,
  shouldUpdateEditor,
} from '../Workspace/RealtimeFollow';

vi.mock('../Workspace/RealtimeFollow/style', () => ({
  useRealtimeFollowStyle: () => ({ hashId: 'h' }),
}));

vi.mock('../Workspace/HtmlPreview', () => ({
  HtmlPreview: (p: any) => (
    <div data-testid="html-preview-mock">{p.html || ''}</div>
  ),
}));

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditor: (p: any) => (
    <div data-testid="md-editor-mock">{p.initValue}</div>
  ),
}));

const locale = {
  'browser.noResults': 'No results',
  'browser.totalResults': 'Total ${count}',
  'browser.searching': 'Searching...',
  'workspace.file.location': 'Locate',
  'workspace.terminalExecution': 'Terminal',
  'workspace.createHtmlFile': 'HTML File',
  'workspace.markdownContent': 'MD Content',
  enlarge: 'Zoom in',
  shrink: 'Zoom out',
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

describe('midtail batch I UI branches', () => {
  beforeEach(() => {
    (window as any).open = openSpy;
  });
  afterEach(() => {
    openSpy.mockReset();
  });

  it('BrowserItem：空 site→W；icon Image；onOpen / window.open；Space；Locate', () => {
    wrap(
      <BrowserItemComponent
        item={{ id: '1', title: 'T', site: '', url: 'https://a.com' }}
      />,
    );
    expect(screen.getByText('W')).toBeInTheDocument();

    wrap(
      <BrowserItemComponent
        item={{
          id: '2',
          title: 'T2',
          site: 'site.com',
          url: 'https://site.com',
          icon: 'https://icon.png',
          canLocate: true,
        }}
        onLocate={vi.fn()}
      />,
    );
    expect(document.querySelector('img')).toBeTruthy();

    const onOpen = vi.fn();
    wrap(
      <BrowserItemComponent
        item={{
          id: '3',
          title: 'OpenMe',
          site: 'o.com',
          url: 'https://o.com',
        }}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(screen.getByText('OpenMe'));
    expect(onOpen).toHaveBeenCalled();

    wrap(
      <BrowserItemComponent
        item={{
          id: '4',
          title: 'WinOpen',
          site: 'w.com',
          url: 'https://w.com',
        }}
      />,
    );
    fireEvent.click(screen.getByText('WinOpen'));
    expect(openSpy).toHaveBeenCalled();

    const onOpen2 = vi.fn();
    wrap(
      <BrowserItemComponent
        item={{
          id: '5',
          title: 'Space',
          site: 'sp.com',
          url: 'https://sp.com',
        }}
        onOpen={onOpen2}
      />,
    );
    fireEvent.keyDown(screen.getByRole('link', { name: 'sp.com' }), {
      key: ' ',
    });
    expect(onOpen2).toHaveBeenCalled();
  });

  it('BrowserList / Header / Browser：emptyText、customHeader、showHeader、suggestions', () => {
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

    const onBack = vi.fn();
    wrap(<BrowserHeader activeLabel="H" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onBack).toHaveBeenCalled();

    wrap(<BrowserHeader activeLabel="NoBack" />);
    expect(screen.getByText('NoBack')).toBeInTheDocument();

    wrap(
      <Browser
        suggestions={[]}
        request={() => ({ items: [], loading: false })}
      />,
    );
    expect(document.body).toBeTruthy();
  });

  it('RealtimeFollow：getContent/shouldUpdate；List header 默认 title；无 onBack 图标', () => {
    expect(getContentForEditor('html', '<x/>')).toContain('```html');
    expect(getContentForEditor('shell', 0 as any)).toBe('0');
    expect(shouldUpdateEditor('md', 'preview')).toBe(true);
    expect(shouldUpdateEditor('html', 'preview')).toBe(false);

    wrap(
      <RealtimeFollowList
        data={{
          type: 'shell',
          content: 'ls',
          status: 'done',
        }}
      />,
    );
    expect(screen.getByText('Terminal')).toBeInTheDocument();

    wrap(
      <RealtimeFollow
        data={{
          type: 'markdown',
          content: '# hi',
          status: 'done',
          customContent: <span>node-not-fn</span>,
        }}
      />,
    );
    expect(screen.getByText('node-not-fn')).toBeInTheDocument();
  });

  it('Enlargement：放大/缩小 title；HistoryRunning 动画矩阵；ChatBoot', () => {
    const onEnlarge = vi.fn();
    const { rerender } = wrap(
      <Enlargement isEnlarged={false} onEnlargeClick={onEnlarge} />,
    );
    fireEvent.click(screen.getByTitle('Zoom in'));
    expect(onEnlarge).toHaveBeenCalled();
    rerender(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale, language: 'en-US' }}>
          <Enlargement isEnlarged />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTitle('Zoom out')).toBeInTheDocument();

    const { container } = wrap(
      <HistoryRunningIcon animated paused duration={1} color="#f00" />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
    wrap(<HistoryRunningIcon animated={false} />);
    wrap(
      <HistoryRunningIconContainer size={20}>
        <span>child</span>
      </HistoryRunningIconContainer>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();

    render(
      <TestWrapper>
        <CaseReply
          quote="q"
          title="Case"
          coverBackground="#eee"
          quoteIconColor="#111"
        />
        <ButtonTab icon={<span>I</span>} onClick={vi.fn()}>
          TabI
        </ButtonTab>
      </TestWrapper>,
    );
    expect(screen.getByText('Case')).toBeInTheDocument();
    expect(screen.getByText('TabI')).toBeInTheDocument();
  });
});
