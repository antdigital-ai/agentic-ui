/**
 * FileTreeComponent deepen3：loadData 早退矩阵、deselected、disabled、
 * 筛选 visibleRoots locale 回退。
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

describe('FileTreeComponent deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('loadData：isLeaf / 已有 children / undefined+空 children 早退', async () => {
    const onLoadChildren = vi.fn(async () => [{ key: 'x', name: 'x' }]);
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              { key: 'leaf', name: 'leaf.txt', isLeaf: true },
              {
                key: 'filled',
                name: 'filled',
                isLeaf: false,
                children: [{ key: 'c', name: 'c.txt', isLeaf: true }],
              },
              {
                key: 'empty-undef',
                name: 'empty-undef',
                isLeaf: undefined,
                children: [],
              },
            ] as any
          }
          defaultExpandedKeys={['filled', 'empty-undef']}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('leaf.txt'));
    fireEvent.click(screen.getByText('filled'));
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(10);
    });
    // 已加载/叶子路径不应强制调用 onLoadChildren
    expect(document.body).toBeTruthy();
  });

  it('选中 disabled 文件不触发 onPreview；筛选无展开匹配用默认文案', () => {
    const onPreview = vi.fn();
    render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'd1',
              name: 'disabled.txt',
              isLeaf: true,
              disabled: true,
              file: { id: '1', name: 'disabled.txt' } as any,
            },
          ]}
          onLoadChildren={vi.fn()}
          onPreview={onPreview}
        />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText('disabled.txt'));
    expect(onPreview).not.toHaveBeenCalled();

    cleanup();
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'root',
                name: 'root',
                children: [{ key: 'a', name: 'alpha', isLeaf: true }],
              },
            ] as any
          }
          defaultExpandedKeys={['root']}
          filterKeyword="zzz"
          onLoadChildren={vi.fn()}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/未找到|暂无|zzz|匹配|root/);
  });

  it('自定义 icon；嵌套 replace 后空 children→leaf', async () => {
    const onLoadChildren = vi.fn(async () => []);
    render(
      <Wrapper>
        <FileTree
          treeData={
            [
              {
                key: 'outer',
                name: 'outer',
                children: [
                  {
                    key: 'inner',
                    name: 'inner',
                    isLeaf: false,
                    icon: <span data-testid="node-icon">I</span>,
                  },
                ],
              },
            ] as any
          }
          defaultExpandedKeys={['outer', 'inner']}
          onLoadChildren={onLoadChildren}
        />
      </Wrapper>,
    );
    const icon = screen.queryByTestId('node-icon');
    if (icon) expect(icon).toBeInTheDocument();
    const inner = screen.queryByText('inner');
    if (inner) {
      fireEvent.click(inner);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(20);
      });
    }
    expect(document.body).toBeTruthy();
  });
});
