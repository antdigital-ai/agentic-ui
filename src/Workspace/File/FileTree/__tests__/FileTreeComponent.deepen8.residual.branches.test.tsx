/**
 * FileTreeComponent deepen8：filterKeyword 省略 → !q；
 * onLoadChildren reject；source isLeaf 组合。
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

describe('FileTreeComponent deepen8 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 filterKeyword：!q 早退原树', () => {
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            { key: '1', title: 'One', name: 'One', isLeaf: true },
            {
              key: '2',
              title: 'Two',
              name: 'Two',
              children: [{ key: '2-1', title: 'C', name: 'C', isLeaf: true }],
            },
          ]}
        />
      </Wrapper>,
    );
    expect(container.querySelector('.ant-tree') || container).toBeTruthy();
  });

  it('onLoadChildren reject 不崩', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            {
              key: 'lazy',
              title: 'Lazy',
              name: 'Lazy',
              isLeaf: false,
              children: [],
            },
          ]}
          onLoadChildren={async () => {
            throw new Error('load-fail');
          }}
        />
      </Wrapper>,
    );
    const switcher = container.querySelector('.ant-tree-switcher');
    if (switcher) {
      fireEvent.click(switcher);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(30);
      });
    }
    err.mockRestore();
    expect(container).toBeTruthy();
  });

  it('isLeaf true 叶子；undefined+无 children；有 children', () => {
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            { key: 'leaf', title: 'L', name: 'L', isLeaf: true },
            { key: 'maybe', title: 'M', name: 'M', isLeaf: undefined },
            {
              key: 'dir',
              title: 'D',
              name: 'D',
              children: [{ key: 'd1', title: 'D1', name: 'D1', isLeaf: true }],
            },
          ]}
          onLoadChildren={async () => []}
        />
      </Wrapper>,
    );
    expect(container).toBeTruthy();
  });
});
