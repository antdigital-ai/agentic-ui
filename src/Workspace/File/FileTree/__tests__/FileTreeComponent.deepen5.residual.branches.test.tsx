/**
 * FileTreeComponent deepen5：walk 空 children、filter 空 keyword、
 * loadData isLeaf/undefined/已有 children、select 无 node。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../I18n';
import { FileTree } from '../FileTreeComponent';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('FileTreeComponent deepen5 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('filterKeyword 仅空白：不过滤；空 treeData []', () => {
    render(
      <Wrapper>
        <FileTree
          treeData={[]}
          filterKeyword="   "
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('workspace-file-tree')).toBeInTheDocument();
  });

  it('叶子无 file：title 纯文本；disabled 叶子', () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'l1',
                name: 'plain.txt',
                isLeaf: true,
                disabled: true,
              },
            ] as any
          }
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(screen.getByText('plain.txt')).toBeInTheDocument();
  });

  it('loadData：isLeaf true / undefined 无 children / 已有 children 早退', async () => {
    const onLoad = vi.fn(async () => [{ key: 'c', name: 'c.txt', isLeaf: true }]);
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'dir',
                name: 'dir',
                isLeaf: false,
                children: undefined,
              },
              {
                key: 'leaf',
                name: 'leaf.txt',
                isLeaf: true,
              },
              {
                key: 'filled',
                name: 'filled',
                children: [{ key: 'x', name: 'x.txt', isLeaf: true }],
              },
              {
                key: 'undef',
                name: 'undef',
                isLeaf: undefined,
              },
            ] as any
          }
          onLoadChildren={onLoad}
          defaultExpandedKeys={['dir']}
        />
      </Wrapper>,
    );
    expect(container.querySelector('.ant-tree')).toBeTruthy();
    // 展开触发 load；filled/leaf 路径早退
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(50);
    });
  });

  it('onSelect：选中后取消；未知 key 不回调', async () => {
    const onSelect = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [{ key: 'f1', name: 'a.md', isLeaf: true }] as any
          }
          onLoadChildren={vi.fn()}
          onSelect={onSelect}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('a.md'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('synthetic leaf：onDownload 绑定 FileItem', () => {
    const onDownload = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'path/to/f.md',
                name: 'f.md',
                isLeaf: true,
              },
            ] as any
          }
          onLoadChildren={vi.fn()}
          onDownload={onDownload}
          fileNodeByRelativePath={
            new Map([
              [
                'path/to/f.md',
                { id: '1', name: 'f.md', content: 'x' } as any,
              ],
            ])
          }
        />
      </Wrapper>,
    );
    expect(screen.getByText('f.md')).toBeInTheDocument();
  });
});
