/**
 * DocInfo deepen：compact、展开折叠、onOriginUrlClick、Popover 长内容、Drawer answer 回退。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { BubbleConfigContext } from '../../BubbleConfigProvide';
import { DocInfoList } from '../DocInfo';

vi.mock('../../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: any) => (
    <div data-testid="md">{initValue}</div>
  ),
}));

vi.mock('../docInfoStyle', () => ({
  useStyle: () => ({ hashId: 'd' }),
}));

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

const wrap = (ui: React.ReactNode, opts?: { locale?: any; compact?: boolean }) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: opts?.locale ?? {} } as any}>
        <BubbleConfigContext.Provider
          value={{ compact: opts?.compact } as any}
        >
          {ui}
        </BubbleConfigContext.Provider>
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('DocInfoList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('compact class；点击 label 折叠/展开', () => {
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[{ content: 'short', docMeta: { doc_name: 'N' } }]}
      />,
      { compact: true },
    );
    const label = screen.getByText(/引用内容/);
    fireEvent.click(label);
    expect(screen.getByText(/展开|收起/)).toBeInTheDocument();
    fireEvent.click(label);
  });

  it('originUrl + onOriginUrlClick；查看原文 stopPropagation', () => {
    const onOriginUrlClick = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[
          {
            content: 'short-url',
            originUrl: 'https://ex.com/a',
            docMeta: { doc_name: 'WithUrl' },
          },
        ]}
        onOriginUrlClick={onOriginUrlClick}
      />,
    );
    fireEvent.click(screen.getByText('WithUrl'));
    expect(onOriginUrlClick).toHaveBeenCalledWith('https://ex.com/a');

    fireEvent.click(screen.getByTitle('查看原文'));
    expect(onOriginUrlClick).toHaveBeenCalledTimes(2);
    openSpy.mockRestore();
  });

  it('无 originUrl 走 window.open；长内容 Popover + Drawer answer 回退', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const long = 'L'.repeat(30);
    wrap(
      <DocInfoList
        reference_url_info_list={[
          { placeholder: 'ph', doc_id: 'd9', url: '' },
        ]}
        options={[
          {
            content: long,
            docMeta: {
              doc_name: '',
              answer: 'fallback-ans',
              upload_time: Date.now(),
              type: 'pdf',
              origin_text: 'ot',
            },
          },
        ]}
      />,
      {
        locale: {
          'chat.message.preview': 'Preview',
          'docInfo.name': 'Name',
          'docInfo.referenceContent': 'Refs',
          'docInfo.items': 'items',
          'docInfo.expand': 'Expand',
          'docInfo.collapse': 'Collapse',
        },
      },
    );
    expect(screen.getByText(/Refs/)).toBeInTheDocument();
    // 点击列表项无 originUrl
    const item = screen.getByTitle(long);
    fireEvent.click(item);
    expect(openSpy).toHaveBeenCalled();

    // Popover 内 meta 区域打开 Drawer
    const ans = screen.queryByText('fallback-ans');
    if (ans) fireEvent.click(ans);
    openSpy.mockRestore();
  });

  it('长内容自定义 render 包在 Popover 内', () => {
    const long = 'X'.repeat(25);
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[{ content: long, docMeta: { doc_name: 'R' } }]}
        render={(_item, dom) => <div data-testid="wrap-render">{dom}</div>}
      />,
    );
    expect(screen.getByTestId('wrap-render')).toBeInTheDocument();
  });
});
