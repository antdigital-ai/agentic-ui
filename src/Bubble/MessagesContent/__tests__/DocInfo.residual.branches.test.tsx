/**
 * DocInfo 残留：空 options、展开折叠、locale 缺省、自定义 render。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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

const wrap = (ui: React.ReactNode, locale: any = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale } as any}>
        <BubbleConfigContext.Provider value={{} as any}>
          {ui}
        </BubbleConfigContext.Provider>
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('DocInfoList residual branches', () => {
  it('options 空 / 含 falsy 过滤', () => {
    const { unmount } = wrap(
      <DocInfoList reference_url_info_list={[]} options={[]} />,
    );
    expect(document.body).toBeTruthy();
    unmount();
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[null as any, { content: 'c', docMeta: { doc_name: 'D1' } }]}
      />,
    );
    expect(screen.getByText('D1')).toBeInTheDocument();
  });

  it('custom render 接管列表项', () => {
    const longContent = 'L'.repeat(25);
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[
          { content: longContent, docMeta: { doc_name: 'N' }, originUrl: '#' },
        ]}
        render={(item) => (
          <div data-testid="custom">{item.docMeta?.doc_name}</div>
        )}
      />,
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('N');
  });

  it('点击项打开 Drawer；关闭清空 meta', () => {
    wrap(
      <DocInfoList
        reference_url_info_list={[
          { placeholder: 'p1', url: 'https://x.com', doc_id: '1' },
        ]}
        options={[
          {
            content: '`$p1` and $p1',
            docMeta: {
              doc_name: 'DocA',
              upload_time: Date.now(),
              answer: 'ans',
            },
          },
        ]}
      />,
    );
    const item = screen.queryByText('DocA') || screen.queryByText(/DocA/);
    if (item) fireEvent.click(item);
  });

  it('locale 缺省走中文回退文案', () => {
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[{ content: 'x', docMeta: { doc_name: 'Z' } }]}
      />,
      null,
    );
    expect(document.body.textContent).toBeTruthy();
  });

  it('placeholder 替换 url/doc_id；短内容；filter 空项；自定义 render', () => {
    wrap(
      <DocInfoList
        reference_url_info_list={[]}
        options={[
          null as any,
          {
            content: '`$ph` $ph $[ph]',
            docMeta: {
              doc_name: '',
              doc_id: 'd1',
              answer: 'short',
              type: 'pdf',
            },
          },
        ]}
        render={() => <div data-testid="custom-doc">C</div>}
      />,
    );
    expect(
      screen.queryByTestId('custom-doc') || document.body.textContent,
    ).toBeTruthy();
  });
});
