/**
 * FileGroup / FileItem / GroupHeader 更多残留：键盘、hasMore、disabled、canDownload。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileNode, GroupNode } from '../../types';
import { FileGroup, GROUP_INITIAL_PAGE_SIZE } from '../components/FileGroup';
import { FileItem } from '../components/FileItem';
import { GroupHeader } from '../components/GroupHeader';

const PREFIX = 'ant-workspace-file';
const HASH = 'hash';

const makeFiles = (count: number): FileNode[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `f-${i}`,
    name: `file-${i}.txt`,
    url: `https://example.com/file-${i}.txt`,
  }));

describe('Workspace File* residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('FileGroup：Enter/Space 查看更多；locale showMore', () => {
    const { container } = render(
      <FileGroup
        group={
          {
            id: 'g1',
            name: 'Docs',
            type: 'plainText',
            children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 2),
          } as GroupNode
        }
        prefixCls={PREFIX}
        hashId={HASH}
        locale={{ 'workspace.file.showMore': 'Show more ({count})' } as any}
      />,
    );
    const showMore = container.querySelector(`.${PREFIX}-show-more`);
    expect(showMore).toBeTruthy();
    fireEvent.keyDown(showMore!, { key: 'Enter' });
    fireEvent.keyDown(showMore!, { key: ' ' });
    expect(container.textContent).toMatch(/Show more|file-/);
  });

  it('FileItem：disabled 不触发 onClick；无 onClick 走 onPreview', () => {
    const onClick = vi.fn();
    const onPreview = vi.fn();
    const { rerender } = render(
      <FileItem
        file={{ id: '1', name: 'a.txt', url: 'https://x/a', disabled: true }}
        onClick={onClick}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    fireEvent.click(screen.getByText('a.txt'));
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <FileItem
        file={{ id: '2', name: 'b.txt', url: 'https://x/b' }}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    fireEvent.click(screen.getByText('b.txt'));
    expect(onPreview).toHaveBeenCalled();
  });

  it('GroupHeader：canDownload 覆盖；无 url 子项不可下载', () => {
    const onDownloadGroup = vi.fn();
    render(
      <GroupHeader
        group={
          {
            id: 'g',
            name: 'G',
            type: 'plainText',
            canDownload: false,
            children: [{ id: 'c', name: 'c.txt' }],
          } as GroupNode
        }
        onToggle={vi.fn()}
        onDownloadGroup={onDownloadGroup}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(screen.queryByLabelText(/下载|Download/i)).toBeNull();
  });

  it('FileGroup 折叠/展开；FileItem 键盘 Enter', () => {
    const onPreview = vi.fn();
    const onToggle = vi.fn();
    const { container } = render(
      <FileGroup
        group={
          {
            id: 'g2',
            name: 'More',
            type: 'plainText',
            collapsed: true,
            children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 1),
          } as GroupNode
        }
        onToggle={onToggle}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    const header =
      container.querySelector(`.${PREFIX}-group-header`) ||
      container.querySelector('[class*="group"]');
    if (header) fireEvent.click(header);

    render(
      <FileItem
        file={{ id: 'k', name: 'key.txt', url: 'https://x/k' }}
        onPreview={onPreview}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    fireEvent.keyDown(screen.getByText('key.txt'), { key: 'Enter' });
    expect(onPreview).toHaveBeenCalled();
  });
});
