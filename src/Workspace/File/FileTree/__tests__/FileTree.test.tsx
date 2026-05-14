import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import Workspace from '../../../index';

describe('Workspace.FileTree', () => {
  const mockLocale = {
    'workspace.empty': '暂无数据',
  } as any;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
        {children}
      </I18nContext.Provider>
    </ConfigProvider>
  );

  it('renders and loads children on expand (lazy load)', async () => {
    const onLoadChildren = vi
      .fn()
      .mockResolvedValue([{ key: 'c-1', name: 'a.txt', isLeaf: true }]);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              {
                key: 'p-1',
                name: 'parent',
                isLeaf: false,
                children: [] as any,
              },
            ]}
            onLoadChildren={onLoadChildren}
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();

    const expander = document.querySelector('.ant-tree-switcher');
    expect(expander).toBeTruthy();
    fireEvent.click(expander!);

    await waitFor(() => {
      expect(onLoadChildren).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('a.txt')).toBeInTheDocument();
    });
  });

  it('keeps an empty directory as a directory (empty onLoadChildren)', async () => {
    const onLoadChildren = vi.fn().mockResolvedValue([] as any);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              {
                key: 'd',
                name: 'empty-dir',
                isLeaf: false,
                children: [] as any,
              },
            ]}
            onLoadChildren={onLoadChildren}
          />
        </Workspace>
      </TestWrapper>,
    );

    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalledTimes(1));

    const sw = document.querySelector('.ant-tree-switcher')!;
    fireEvent.click(sw);
    fireEvent.click(sw);
    expect(onLoadChildren).toHaveBeenCalledTimes(1);
  });

  it('retries onLoadChildren after rejection when re-expanding', async () => {
    const onLoadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([{ key: 'ok', name: 'f.txt', isLeaf: true }]);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
            ]}
            onLoadChildren={onLoadChildren}
          />
        </Workspace>
      </TestWrapper>,
    );

    const switcher = () => document.querySelector('.ant-tree-switcher')!;
    fireEvent.click(switcher());
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalledTimes(1));
    // 须等首帧 load 的 Promise reject 完成，否则在 loadingKeys 未清理时再次点击会阻止 loadData，或
    // `.ant-tree-treenode-loading` 尚未出现导致 waitFor 误过前序断言与 rc-tree 的 reject 时序
    const firstChildLoad = onLoadChildren.mock.results[0]
      ?.value as Promise<unknown>;
    await expect(firstChildLoad).rejects.toThrow('network');
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(switcher());
    // Ant Design Tree 在部分环境下可能多次触发 loadData，只要求重试后成功加载
    await waitFor(() => {
      expect(onLoadChildren.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
    await waitFor(() => expect(screen.getByText('f.txt')).toBeInTheDocument());
  });

  it('filterKeyword shows empty hint when no root matches', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[{ key: 'x', name: 'readme.md', isLeaf: true }]}
            onLoadChildren={vi.fn()}
            filterKeyword="gamma"
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('file-tree-filter-empty')).toHaveAttribute(
      'data-state',
      'rootsNoMatch',
    );
  });

  it('filter empty uses expanded hint when folders were expanded', async () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              {
                key: 'r',
                name: 'rootdir',
                isLeaf: false,
                children: [{ key: 'a', name: 'foo.txt', isLeaf: true }],
              },
            ]}
            onLoadChildren={vi.fn()}
            filterKeyword="zzz"
          />
        </Workspace>
      </TestWrapper>,
    );

    fireEvent.click(document.querySelector('.ant-tree-switcher')!);

    const empty = await screen.findByTestId('file-tree-filter-empty');
    expect(empty).toHaveAttribute('data-state', 'expandedNoMatch');
  });

  it('filterKeyword only matches loaded children under expanded folders', async () => {
    const onLoadChildren = vi
      .fn()
      .mockResolvedValue([{ key: 'b1', name: 'gamma.txt', isLeaf: true }]);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              {
                key: 'b',
                name: 'beta-dir',
                isLeaf: false,
                children: [] as any,
              },
            ]}
            onLoadChildren={onLoadChildren}
            filterKeyword="gamma"
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(
      screen.queryByTestId('file-tree-filter-empty'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('beta-dir')).toBeInTheDocument();

    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText('gamma.txt')).toBeInTheDocument(),
    );
  });

  it('invokes onSelect with node', async () => {
    const onSelect = vi.fn();
    const onLoadChildren = vi
      .fn()
      .mockResolvedValue([{ key: 'x', name: 'b.md', isLeaf: true }]);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
            ]}
            onLoadChildren={onLoadChildren}
            onSelect={onSelect}
          />
        </Workspace>
      </TestWrapper>,
    );

    fireEvent.click(document.querySelector('.ant-tree-switcher')!);
    await waitFor(() => expect(screen.getByText('b.md')).toBeInTheDocument());

    fireEvent.click(screen.getByText('b.md'));
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'x', name: 'b.md' }),
      );
    });
  });
});
