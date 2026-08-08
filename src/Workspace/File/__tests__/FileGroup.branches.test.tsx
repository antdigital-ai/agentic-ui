/**
 * FileGroup 分支覆盖：折叠挂载/卸载、分页「查看更多」、数据重置。
 */
import '@testing-library/jest-dom';
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FileNode, GroupNode } from '../../types';
import {
  FileGroup,
  GROUP_INITIAL_PAGE_SIZE,
  GROUP_PAGE_SIZE_INCREMENT,
} from '../components/FileGroup';

const PREFIX = 'ant-workspace-file';
const HASH = 'hash';

const makeFiles = (count: number): FileNode[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `f-${i}`,
    name: `file-${i}.txt`,
    url: `https://example.com/file-${i}.txt`,
  }));

const makeGroup = (overrides: Partial<GroupNode> = {}): GroupNode => ({
  id: 'g1',
  name: '文档',
  type: 'plainText',
  children: makeFiles(3),
  ...overrides,
});

describe('FileGroup 分支覆盖', () => {
  afterEach(() => {
    cleanup();
  });

  it('展开时渲染分组标题与文件项', () => {
    const { container } = render(
      <FileGroup group={makeGroup()} prefixCls={PREFIX} hashId={HASH} />,
    );

    expect(within(container).getByText('文档')).toBeInTheDocument();
    expect(within(container).getByText('file-0.txt')).toBeInTheDocument();
    expect(within(container).getByText('file-2.txt')).toBeInTheDocument();
  });

  it('折叠后延迟卸载内容，再展开立即挂载', async () => {
    const { container, rerender } = render(
      <FileGroup
        group={makeGroup({ collapsed: false })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    expect(within(container).getByText('file-0.txt')).toBeInTheDocument();

    rerender(
      <FileGroup
        group={makeGroup({ collapsed: true })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    expect(within(container).getByText('file-0.txt')).toBeInTheDocument();
    expect(
      container.querySelector(`[data-collapsed="true"]`),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(within(container).queryByText('file-0.txt')).toBeNull();
      },
      { timeout: 1000 },
    );

    rerender(
      <FileGroup
        group={makeGroup({ collapsed: false })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(within(container).getByText('file-0.txt')).toBeInTheDocument();
  });

  it('超过首屏数量时显示「查看更多」，点击/键盘可继续展开', () => {
    const bigger = GROUP_INITIAL_PAGE_SIZE + GROUP_PAGE_SIZE_INCREMENT + 3;
    const { container, rerender } = render(
      <FileGroup
        group={makeGroup({ children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 5) })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    expect(within(container).getByText('file-0.txt')).toBeInTheDocument();
    expect(
      within(container).queryByText(`file-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeNull();

    fireEvent.click(
      within(container).getByRole('button', { name: /查看更多/ }),
    );
    expect(
      within(container).getByText(`file-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeInTheDocument();

    rerender(
      <FileGroup
        group={makeGroup({ id: 'g2', children: makeFiles(bigger) })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(
      within(container).queryByText(`file-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeNull();

    const moreAgain = within(container).getByRole('button', {
      name: /查看更多/,
    });
    fireEvent.keyDown(moreAgain, { key: 'Enter' });
    expect(
      within(container).getByText(`file-${GROUP_INITIAL_PAGE_SIZE}.txt`),
    ).toBeInTheDocument();

    fireEvent.keyDown(moreAgain, { key: ' ' });
    expect(
      within(container).getByText(
        `file-${GROUP_INITIAL_PAGE_SIZE + GROUP_PAGE_SIZE_INCREMENT}.txt`,
      ),
    ).toBeInTheDocument();

    const beforeCount = container.querySelectorAll(
      `.${PREFIX}-item--list`,
    ).length;
    fireEvent.keyDown(moreAgain, { key: 'Escape' });
    expect(container.querySelectorAll(`.${PREFIX}-item--list`).length).toBe(
      beforeCount,
    );

    rerender(
      <FileGroup
        group={makeGroup({
          id: 'g2',
          children: makeFiles(GROUP_INITIAL_PAGE_SIZE),
        })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    expect(
      within(container).queryByRole('button', { name: /查看更多/ }),
    ).toBeNull();
  });

  it('透传 onFileClick / locale 模板', () => {
    const onFileClick = vi.fn();
    const { container } = render(
      <FileGroup
        group={makeGroup({
          children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 1),
        })}
        onFileClick={onFileClick}
        prefixCls={PREFIX}
        hashId={HASH}
        locale={{
          'workspace.file.showMore': 'More (${count})',
        }}
      />,
    );

    expect(
      within(container).getByRole('button', { name: 'More (1)' }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(container).getByRole('button', { name: /file-0\.txt/i }),
    );
    expect(onFileClick).toHaveBeenCalled();
  });

  it('卸载时清理折叠定时器', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount, rerender } = render(
      <FileGroup
        group={makeGroup({ collapsed: false })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    rerender(
      <FileGroup
        group={makeGroup({ collapsed: true })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('从展开切到折叠时 show-more 的 tabIndex 为 -1', () => {
    const { container, rerender } = render(
      <FileGroup
        group={makeGroup({
          collapsed: false,
          children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 1),
        })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    rerender(
      <FileGroup
        group={makeGroup({
          collapsed: true,
          children: makeFiles(GROUP_INITIAL_PAGE_SIZE + 1),
        })}
        prefixCls={PREFIX}
        hashId={HASH}
      />,
    );

    const showMore = container.querySelector(`.${PREFIX}-show-more`);
    expect(showMore).toHaveAttribute('tabindex', '-1');
  });
});
