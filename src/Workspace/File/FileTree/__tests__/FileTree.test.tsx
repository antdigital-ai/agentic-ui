import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    // 须等 rc-tree 结束 loading 后再展开，否则 loadingKeys 会阻止再次调用 loadData
    await waitFor(() => {
      expect(
        document.querySelector('.ant-tree-treenode-loading'),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(switcher());
    await waitFor(() => expect(onLoadChildren).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText('f.txt')).toBeInTheDocument());
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
