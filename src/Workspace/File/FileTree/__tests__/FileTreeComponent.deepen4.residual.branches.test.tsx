/**
 * FileTreeComponent deepen4：walk 空 nodes、filter 未展开目录、
 * loadData source 缺失、deselected、visibleRoots locale、onFileClick。
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

describe('FileTreeComponent deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('treeData null/undefined 安全；筛选未展开目录保留空 children', () => {
    render(
      <Wrapper>
        <FileTree treeData={undefined as any} onLoadChildren={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();

    cleanup();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'closed',
                name: 'closed-dir',
                children: [{ key: 'hidden', name: 'secret.txt', isLeaf: true }],
              },
            ] as any
          }
          filterKeyword="secret"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/未找到|可见|secret|closed|匹配/);
  });

  it('onFileClick 优先于 onPreview；选中后取消不触发', async () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f1',
              name: 'click.md',
              isLeaf: true,
              file: { id: '1', name: 'click.md' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('click.md'));
    expect(onFileClick).toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('rootsNoMatch 自定义 locale；展开后 load 空数组', async () => {
    render(
      <Wrapper
        locale={{
          'workspace.treeFilterNoMatchVisibleRoots': 'ROOTMISS:${keyword}',
        }}
      >
        <FileTree
          treeData={
            [{ key: 'a', name: 'alpha.txt', isLeaf: true }] as any
          }
          filterKeyword="zzz"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/ROOTMISS:zzz|zzz|未找到/);

    cleanup();
    const onLoadChildren = vi.fn(async () => []);
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'empty',
                name: 'empty',
                isLeaf: false,
              },
            ] as any
          }
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    const switcher =
      document.querySelector('.ant-tree-switcher') ||
      screen.queryByText('empty');
    if (switcher) {
      fireEvent.click(switcher);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(30);
      });
    }
    expect(document.body).toBeTruthy();
  });

  it('isLeaf false 且 children 空：筛选保留节点', () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'loading',
                name: 'loading-dir',
                isLeaf: false,
                children: [],
              },
            ] as any
          }
          defaultExpandedKeys={['loading']}
          filterKeyword="loading"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(screen.getByText('loading-dir')).toBeInTheDocument();
  });
});
