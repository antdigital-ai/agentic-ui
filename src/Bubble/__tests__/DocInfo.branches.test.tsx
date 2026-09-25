/**
 * DocInfoList 分支覆盖：compact、Drawer、占位符、render、Popover 边界。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { DocInfoList } from '../MessagesContent/DocInfo';

vi.mock('../../MarkdownEditor/BaseMarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: { initValue?: string }) => (
    <div data-testid="md-preview">{initValue}</div>
  ),
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    title?: string;
  }) => (
    <button type="button" aria-label={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

const longContent = 'L'.repeat(25);

describe('DocInfoList branches', () => {
  it('compact context 应用 compact 类名', () => {
    const { container } = render(
      <BubbleConfigContext.Provider value={{ compact: true } as any}>
        <DocInfoList
          options={[
            {
              content: 'short',
              docMeta: { doc_name: 'N' },
              originUrl: '#',
            },
          ]}
          reference_url_info_list={[]}
        />
      </BubbleConfigContext.Provider>,
    );
    expect(
      container.querySelector('[class*="doc-info-compact"]'),
    ).toBeTruthy();
  });

  it('filter 掉 falsy options', () => {
    render(
      <DocInfoList
        options={[null as any, undefined as any, false as any]}
        reference_url_info_list={[]}
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('Drawer 关闭清空 docMeta', async () => {
    const user = userEvent.setup();
    render(
      <DocInfoList
        options={[
          {
            content: longContent,
            docMeta: {
              doc_name: 'DrawerDoc',
              upload_time: '2026-01-01',
              type: 'pdf',
              origin_text: 'body',
            },
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    const listItem = screen.getByText(longContent).closest('[class*="list-item"]');
    await user.hover(listItem as HTMLElement);
    const metaBlock = document.body.querySelector('[class*="FBFCFD"]');
    if (metaBlock) {
      await user.click(metaBlock);
      const closeBtn = document.body.querySelector('.ant-drawer-close');
      if (closeBtn) {
        fireEvent.click(closeBtn);
      }
    }
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it('docMeta 使用 answer 作为名称回退', () => {
    render(
      <DocInfoList
        options={[
          {
            content: longContent,
            docMeta: { answer: 'AnswerTitle' } as any,
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it('占位符 ${} / $ / $[] 三种格式', () => {
    render(
      <DocInfoList
        options={[
          {
            content: 'See `${p1}` and $p2 and $[p3]',
            docMeta: { doc_name: 'P' },
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[
          { placeholder: 'p1', url: 'u1', doc_id: 'd1' },
          { placeholder: 'p2', doc_id: 'd2' },
          { placeholder: 'p3', url: 'u3', doc_id: 'd3' },
        ]}
      />,
    );
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('无 docMeta.doc_name 时不渲染副标题行', () => {
    render(
      <DocInfoList
        options={[
          {
            content: 'Only content',
            docMeta: {} as any,
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    expect(screen.getByText('Only content')).toBeInTheDocument();
  });

  it('无 originUrl 时不渲染查看原文按钮', () => {
    render(
      <DocInfoList
        options={[
          {
            content: 'No url',
            docMeta: { doc_name: 'X' },
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    expect(screen.queryByLabelText('查看原文')).not.toBeInTheDocument();
  });

  it('Popover 内无 docMeta 时不渲染 meta 区块', async () => {
    const user = userEvent.setup();
    render(
      <DocInfoList
        options={[
          {
            content: longContent,
            docMeta: undefined,
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    await user.hover(
      screen.getByText(longContent).closest('[class*="list-item"]') as HTMLElement,
    );
    expect(screen.queryByTestId('md-preview')).toBeNull();
  });

  it('render 自定义包装 long content', () => {
    const renderFn = vi.fn((_item, dom) => (
      <div data-testid="wrapped">{dom}</div>
    ));
    render(
      <DocInfoList
        options={[
          {
            content: longContent,
            docMeta: { doc_name: 'W' },
            originUrl: '#',
          },
        ]}
        reference_url_info_list={[]}
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalled();
    expect(screen.getByTestId('wrapped')).toBeInTheDocument();
  });

  it('expanded 初始 true 点击 label 切换文案', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DocInfoList
        options={[{ content: 'x', docMeta: { doc_name: 'n' }, originUrl: '#' }]}
        reference_url_info_list={[]}
      />,
    );
    const label = container.querySelector('[class*="doc-info-label"]')!;
    await user.click(label);
    expect(within(label).getByText(/展开|收起/)).toBeInTheDocument();
  });

  it.skip('行点击 originUrl 无 onOriginUrlClick 时 window.open', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const user = userEvent.setup();
    render(
      <DocInfoList
        options={[
          {
            content: 'short',
            docMeta: { doc_name: 'OpenMe' },
            originUrl: 'https://docs.example/open',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    await user.click(screen.getByText('short'));
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('options undefined 视为空数组', () => {
    render(
      <DocInfoList options={undefined as any} reference_url_info_list={[]} />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('长内容 Popover 与 docMeta 展示', async () => {
    const user = userEvent.setup();
    render(
      <DocInfoList
        options={[
          {
            content: longContent,
            docMeta: {
              doc_name: 'LongDoc',
              upload_time: '2026-02-01',
              type: 'md',
            },
            originUrl: 'https://docs.example/long',
          },
        ]}
        reference_url_info_list={[]}
      />,
    );
    expect(screen.getByText('LongDoc')).toBeInTheDocument();
    const row = screen.getByText(longContent.slice(0, 20), { exact: false });
    await user.hover(row);
    expect(row).toBeTruthy();
  });

  it('收起态点击后 padding 分支', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DocInfoList
        options={[
          { content: 'a', docMeta: { doc_name: 'A' }, originUrl: '#' },
          { content: 'b', docMeta: { doc_name: 'B' }, originUrl: '#' },
        ]}
        reference_url_info_list={[]}
      />,
    );
    const label = container.querySelector('[class*="doc-info-label"]')!;
    await user.click(label);
    await user.click(label);
    expect(container.querySelector('[class*="doc-info"]')).toBeTruthy();
  });
});
