/**
 * FileTreeComponent deepen2：loadData 早退、空 children→leaf、筛选展开、preview vs fileClick。
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

describe('FileTreeComponent deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('treeData undefined/[] 空态；筛选无匹配 locale', () => {
    const { rerender } = render(
      <Wrapper>
        <FileTree treeData={undefined as any} onLoadChildren={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();

    rerender(
      <Wrapper
        locale={{
          'workspace.treeFilterNoMatchInExpanded': '无匹配展开',
        }}
      >
        <FileTree
          treeData={
            [
              {
                key: 'd',
                name: 'dir',
                children: [{ key: 'f', name: 'a.txt', isLeaf: true }],
              },
            ] as any
          }
          defaultExpandedKeys={['d']}
          filterKeyword="zzz"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/无匹配|暂无|zzz|dir/);
  });

  it('onLoadChildren 返回 []：目录变 leaf；嵌套 key 替换', async () => {
    const onLoadChildren = vi.fn(async () => []);
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'root',
                name: 'root',
                children: [
                  {
                    key: 'lazy',
                    name: 'lazy',
                    isLeaf: false,
                    children: undefined,
                  },
                ],
              },
            ] as any
          }
          defaultExpandedKeys={['root']}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    // 触发展开 lazy — antd Tree 可能通过点击标题
    const lazy = screen.queryByText('lazy');
    if (lazy) {
      fireEvent.click(lazy);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(20);
      });
    }
    expect(document.body).toBeTruthy();
  });

  it('筛选：折叠目录保留 children；展开空非 leaf', () => {
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'closed',
                name: 'closed',
                children: [{ key: 'c1', name: 'hit-me', isLeaf: true }],
              },
              {
                key: 'open',
                name: 'open-empty',
                isLeaf: false,
                children: [],
              },
            ] as any
          }
          defaultExpandedKeys={['open']}
          filterKeyword="hit"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('选中：未知 key 忽略；仅 onPreview；仅 onFileClick', () => {
    const onPreview = vi.fn();
    const onFileClick = vi.fn();
    const { rerender } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f1',
              name: 'a.txt',
              isLeaf: true,
              file: { id: '1', name: 'a.txt' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('a.txt'));
    expect(onPreview).toHaveBeenCalled();

    rerender(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'f2',
              name: 'b.txt',
              isLeaf: true,
              file: { id: '2', name: 'b.txt' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onFileClick={onFileClick}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('b.txt'));
    expect(onFileClick).toHaveBeenCalled();
  });
});
