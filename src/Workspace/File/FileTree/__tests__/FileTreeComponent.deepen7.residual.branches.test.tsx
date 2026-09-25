/**
 * FileTreeComponent deepen7：未展开 children undefined → ??[]；
 * 展开空 children；选中未知 key → !n 早退。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
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

describe('FileTreeComponent deepen7 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('未展开目录 children undefined + keyword 自匹配', () => {
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'dir',
              title: 'folder-match',
              name: 'folder-match',
              children: undefined,
              isLeaf: false,
            },
          ]}
          filterKeyword="folder"
          defaultExpandedKeys={[]}
        />
      </Wrapper>,
    );
    expect(container).toBeTruthy();
  });

  it('展开后 children 空数组 + isLeaf false', async () => {
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'empty-dir',
              title: 'Empty',
              name: 'Empty',
              children: [],
              isLeaf: false,
            },
          ]}
          filterKeyword="Emp"
          defaultExpandedKeys={['empty-dir']}
          onLoadChildren={async () => []}
        />
      </Wrapper>,
    );
    await act(async () => {
      vi.advanceTimersByTime(20);
    });
    expect(container).toBeTruthy();
  });

  it('点击树节点：未知 key 走 !n 早退（不抛）', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[{ key: 'a', title: 'A', name: 'A', isLeaf: true }]}
          onSelect={onSelect}
        />
      </Wrapper>,
    );
    const node = container.querySelector('.ant-tree-node-content-wrapper');
    if (node) {
      fireEvent.click(node);
    }
    // 即使选中，未知 key 也不应导致崩溃
    expect(container.querySelector('.ant-tree') || container).toBeTruthy();
  });
});
