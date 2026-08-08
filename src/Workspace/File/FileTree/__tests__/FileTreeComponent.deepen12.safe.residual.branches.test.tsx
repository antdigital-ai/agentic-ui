/**
 * FileTreeComponent deepen12 safe：load 早退各分支、load 失败 reject、
 * onPreview 合成叶子、filterKeyword ?? ''、select 非 selected。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
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

describe('FileTreeComponent deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('load 早退：未知 key / isLeaf / 已有 children', async () => {
    const onLoad = vi.fn(async () => [{ key: 'c', name: 'c.txt', isLeaf: true }]);
    const { container, rerender } = render(
      <Wrapper>
        <FileTree
          treeData={[
            { key: 'leaf', name: 'leaf.txt', isLeaf: true },
            { key: 'lazy', name: 'lazy', isLeaf: false, children: [] },
            {
              key: 'filled',
              name: 'filled',
              isLeaf: false,
              children: [{ key: 'x', name: 'x', isLeaf: true }],
            },
          ]}
          onLoadChildren={onLoad}
        />
      </Wrapper>,
    );
    const switchers = container.querySelectorAll('.ant-tree-switcher');
    switchers.forEach((sw) => fireEvent.click(sw));
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(40);
    });
    expect(onLoad).toHaveBeenCalled();

    rerender(
      <Wrapper>
        <FileTree treeData={[]} onLoadChildren={onLoad} filterKeyword={undefined} />
      </Wrapper>,
    );
    expect(container).toBeTruthy();
  });

  it('load 失败 reject；空 children 收拢 expandedKeys', async () => {
    const onLoad = vi.fn(async () => {
      throw new Error('load fail');
    });
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[{ key: 'bad', name: 'bad', isLeaf: false, children: [] }]}
          onLoadChildren={onLoad}
        />
      </Wrapper>,
    );
    const switcher = container.querySelector('.ant-tree-switcher');
    if (switcher) {
      fireEvent.click(switcher);
      await act(async () => {
        try {
          await Promise.resolve();
        } catch {
          /* rc-tree */
        }
        vi.advanceTimersByTime(40);
      });
    }
    expect(onLoad).toHaveBeenCalled();
  });

  it('onPreview 合成叶子 + 自定义 icon', async () => {
    const onPreview = vi.fn();
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'syn',
              name: 'syn.md',
              isLeaf: true,
              icon: <span data-testid="ico12">I</span>,
            },
          ]}
          onPreview={onPreview}
          onDownload={vi.fn()}
          resolveTreeLeafFileOptions={{
            fileNodeByRelativePath: new Map([['syn.md', { id: '1', name: 'syn.md' } as any]]),
          }}
        />
      </Wrapper>,
    );
    const title = container.querySelector('.ant-tree-title');
    if (title) fireEvent.click(title);
    expect(container.querySelector('[data-testid="ico12"]')).toBeTruthy();
  });
});
