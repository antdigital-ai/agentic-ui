/**
 * GroupHeader 分支覆盖：折叠切换、下载按钮显隐规则、locale。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileNode, GroupNode } from '../../types';
import { GroupHeader } from '../components/GroupHeader';

const PREFIX = 'ant-workspace-file';
const HASH = 'hash';

const child = (overrides: Partial<FileNode> = {}): FileNode => ({
  id: 'c1',
  name: 'a.txt',
  url: 'https://example.com/a.txt',
  ...overrides,
});

const group = (overrides: Partial<GroupNode> = {}): GroupNode => ({
  id: 'g1',
  name: '文档',
  type: 'plainText',
  children: [child()],
  ...overrides,
});

describe('GroupHeader 分支覆盖', () => {
  afterEach(() => {
    cleanup();
  });

  it('点击标题触发 onToggle，collapsed=false 时传 true', () => {
    const onToggle = vi.fn();
    render(
      <GroupHeader
        group={group({ collapsed: false })}
        onToggle={onToggle}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /收起文档分组/ }));
    expect(onToggle).toHaveBeenCalledWith('g1', 'plainText', true);
  });

  it('collapsed=true 时 aria 使用展开文案', () => {
    const onToggle = vi.fn();
    render(
      <GroupHeader
        group={group({ collapsed: true })}
        onToggle={onToggle}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /展开文档分组/ }));
    expect(onToggle).toHaveBeenCalledWith('g1', 'plainText', false);
  });

  it('未传 onGroupDownload 时不显示下载按钮', () => {
    render(
      <GroupHeader group={group()} prefixCls={PREFIX} hashId={HASH} />,
    );
    expect(screen.queryByLabelText('下载')).toBeNull();
  });

  it('有 onGroupDownload 且子文件可下载时显示下载并回调', () => {
    const onGroupDownload = vi.fn();
    render(
      <GroupHeader
        group={group()}
        onGroupDownload={onGroupDownload}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    fireEvent.click(screen.getByLabelText('下载'));
    expect(onGroupDownload).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'c1' })]),
      'plainText',
    );
  });

  it('group.canDownload=false 强制隐藏下载，即使有 onGroupDownload', () => {
    render(
      <GroupHeader
        group={group({ canDownload: false })}
        onGroupDownload={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(screen.queryByLabelText('下载')).toBeNull();
  });

  it('group.canDownload=true 强制显示下载', () => {
    render(
      <GroupHeader
        group={group({
          canDownload: true,
          children: [child({ canDownload: false, url: undefined })],
        })}
        onGroupDownload={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(screen.getByLabelText('下载')).toBeInTheDocument();
  });

  it('子文件均不可下载时隐藏下载按钮', () => {
    render(
      <GroupHeader
        group={group({
          children: [
            child({ canDownload: false, url: undefined, content: undefined }),
          ],
        })}
        onGroupDownload={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(screen.queryByLabelText('下载')).toBeNull();
  });

  it('locale 覆盖展开/收起与下载文案', () => {
    render(
      <GroupHeader
        group={group({ collapsed: true })}
        onGroupDownload={vi.fn()}
        prefixCls={PREFIX}
        hashId={HASH}
        locale={{
          'workspace.expand': 'Expand',
          'workspace.group': 'Group',
          'workspace.file.download': 'Download all',
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Expand文档Group' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Download all')).toBeInTheDocument();
  });
});
