import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DocInfoList } from '../MessagesContent/DocInfo';

vi.mock('../../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="doc-md">{initValue}</div>
  ),
}));

describe('DocInfoList 额外分支', () => {
  it.skip('options 缺省 / 含 falsy 过滤', () => {
    const { container } = render(
      <ConfigProvider>
        <DocInfoList reference_url_info_list={[]} />
      </ConfigProvider>,
    );
    expect(container).toBeTruthy();

    render(
      <ConfigProvider>
        <DocInfoList
          reference_url_info_list={[]}
          options={[null as any, { content: 'a', doc_meta: { doc_name: 'N' } }]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText(/N|引用|reference/i)).toBeTruthy();
  });

  it.skip('custom render 覆盖列表项', () => {
    render(
      <ConfigProvider>
        <DocInfoList
          reference_url_info_list={[]}
          options={[{ content: 'c', doc_meta: { doc_name: 'D' } }]}
          render={() => <div data-testid="custom-doc">custom</div>}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('custom-doc')).toBeInTheDocument();
  });

  it.skip('展开收起与原文点击', () => {
    const onOrigin = vi.fn();
    render(
      <ConfigProvider>
        <DocInfoList
          reference_url_info_list={[
            { placeholder: 'p1', url: 'https://u', doc_id: 'd1' },
          ]}
          options={[
            {
              content: 'see $p1',
              doc_meta: {
                doc_name: 'Doc',
                origin_url: 'https://origin',
                upload_time: Date.now(),
              },
            },
          ]}
          onOriginUrlClick={onOrigin}
        />
      </ConfigProvider>,
    );
    const toggles = screen.getAllByRole('button');
    if (toggles[0]) fireEvent.click(toggles[0]);
  });
});
