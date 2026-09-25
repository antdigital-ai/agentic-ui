/**
 * Midtail batch C：Workspace / History 小补洞。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryRunningIcon } from '../History/components/HistoryRunningIcon';
import { HistoryLoadMore } from '../History/components/LoadMoreComponent';
import Enlargement from '../MarkdownInputField/Enlargement';
import { UnsupportedFileCard } from '../Workspace/File/preview/components/UnsupportedFileCard';
import { WorkspaceTabCountDigits } from '../Workspace/WorkspaceTabCountDigits';

describe('midtail batch C branches', () => {
  it('HistoryRunningIcon：paused / 自定义 duration / 非数字 size', () => {
    const { rerender } = render(
      <HistoryRunningIcon animated paused duration={1} size={20} />,
    );
    expect(document.querySelector('svg')).toBeTruthy();
    rerender(<HistoryRunningIcon animated={false} size="1.2em" />);
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('HistoryLoadMore：task 文案与 className', () => {
    const onLoadMore = vi.fn();
    render(
      <HistoryLoadMore type="task" className="x" onLoadMore={onLoadMore} />,
    );
    expect(screen.getByText('查看更多历史')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('UnsupportedFileCard：有下载回调；元信息组合', () => {
    const onDownload = vi.fn();
    const { container } = render(
      <ConfigProvider>
        <UnsupportedFileCard
          file={
            {
              id: '1',
              name: 'a.bin',
              size: 1024,
              lastModified: '2024-01-01',
              url: 'https://x/a.bin',
            } as any
          }
          canDownload
          onDownload={onDownload}
          filePrefixCls="ws-file"
          prefixCls="ws-file-preview"
          hashId="h"
          locale={{}}
        />
      </ConfigProvider>,
    );
    expect(container.textContent).toMatch(/无法预览|下载|download/i);
  });

  it('WorkspaceTabCountDigits：0 / 个位数 / 多位数', () => {
    const { rerender, container } = render(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={0}
        prefixCls="ws-tab"
        hashId="h"
      />,
    );
    expect(container.textContent).toMatch(/0/);
    rerender(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={9}
        prefixCls="ws-tab"
        hashId="h"
      />,
    );
    rerender(
      <WorkspaceTabCountDigits
        tabKey="files"
        value={99}
        prefixCls="ws-tab"
        hashId="h"
      />,
    );
    expect(container.textContent).toMatch(/99/);
  });

  it('Enlargement：渲染切换控件', () => {
    const onEnlargeClick = vi.fn();
    render(
      <ConfigProvider>
        <Enlargement isEnlarged={false} onEnlargeClick={onEnlargeClick} />
      </ConfigProvider>,
    );
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onEnlargeClick).toHaveBeenCalled();

    render(
      <ConfigProvider>
        <Enlargement isEnlarged onEnlargeClick={onEnlargeClick} />
      </ConfigProvider>,
    );
  });
});
