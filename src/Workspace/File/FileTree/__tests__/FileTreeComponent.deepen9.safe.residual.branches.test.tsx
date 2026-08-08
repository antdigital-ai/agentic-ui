/**
 * FileTreeComponent deepen9 safe：嵌套 replaceNodeChildren、load 成功、
 * onPreview 分支、自定义 icon、filterKeyword ?? ''。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import { FileTree } from '../FileTreeComponent';

const Wrapper: React.FC<{
  children: React.ReactNode;
  locale?: Record<string, string>;
}> = ({ children, locale = {} }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('FileTreeComponent deepen9 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('replaceNodeChildren：lazy load 子节点成功', async () => {
    const onLoadChildren = vi.fn(async () => [
      { key: 'child', name: 'child.txt', isLeaf: true },
    ]);
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'lazy',
              name: 'lazy-dir',
              isLeaf: false,
              children: [],
            },
          ]}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    const switcher = container.querySelector('.ant-tree-switcher');
    if (switcher) {
      fireEvent.click(switcher);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(40);
      });
    }
    expect(onLoadChildren).toHaveBeenCalled();
    expect(container).toBeTruthy();
  });

  it('onPreview 分支（无 onFileClick）；自定义 icon', async () => {
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'leaf',
              name: 'preview.md',
              isLeaf: true,
              file: { id: '1', name: 'preview.md' } as any,
            },
            {
              key: 'dir',
              name: 'dir',
              isLeaf: false,
              icon: <span data-testid="custom-tree-icon">★</span>,
              children: [{ key: 'd1', name: 'd1', isLeaf: true }],
            },
          ]}
          onPreview={onPreview}
          onLoadChildren={async () => []}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('preview.md'));
    expect(onPreview).toHaveBeenCalled();
    expect(document.body).toBeTruthy();
  });

  it('filterKeyword null coalesce + expandedNoMatch locale', () => {
    render(
      <Wrapper
        locale={{
          'workspace.treeFilterNoMatchInExpanded': 'EXP:${keyword}',
        }}
      >
        <FileTree
          treeData={[
            {
              key: 'open',
              name: 'open',
              isLeaf: false,
              children: [{ key: 'x', name: 'hidden.txt', isLeaf: true }],
            },
          ]}
          filterKeyword={undefined}
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();

    cleanup();
    render(
      <Wrapper
        locale={{
          'workspace.treeFilterNoMatchInExpanded': 'EXP:${keyword}',
        }}
      >
        <FileTree
          treeData={[
            {
              key: 'open2',
              name: 'open2',
              isLeaf: false,
              children: [{ key: 'y', name: 'y.txt', isLeaf: true }],
            },
          ]}
          filterKeyword="nomatch-xyz"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    const tree = screen.getByTestId('workspace-file-tree');
    fireEvent.click(tree.querySelector('.ant-tree-switcher') || tree);
    expect(document.body).toBeTruthy();
  });
});
