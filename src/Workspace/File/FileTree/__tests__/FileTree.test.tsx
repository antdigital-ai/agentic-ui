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
    const loadChildren = vi
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
            loadChildren={loadChildren}
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();

    const expander = document.querySelector('.ant-tree-switcher');
    expect(expander).toBeTruthy();
    fireEvent.click(expander!);

    await waitFor(() => {
      expect(loadChildren).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('a.txt')).toBeInTheDocument();
    });
  });

  it('invokes onSelect with node', async () => {
    const onSelect = vi.fn();
    const loadChildren = vi
      .fn()
      .mockResolvedValue([{ key: 'x', name: 'b.md', isLeaf: true }]);

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.FileTree
            treeData={[
              { key: 'd', name: 'dir', isLeaf: false, children: [] as any },
            ]}
            loadChildren={loadChildren}
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
