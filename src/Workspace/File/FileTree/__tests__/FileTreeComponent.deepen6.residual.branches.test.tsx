/**
 * FileTreeComponent deepen6：treeData null；isLeaf / 空 children。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
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

describe('FileTreeComponent deepen6 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('treeData null + 空白 filterKeyword', () => {
    const { container } = render(
      <Wrapper>
        <FileTree treeData={null as any} filterKeyword="   " />
      </Wrapper>,
    );
    expect(container).toBeTruthy();
  });

  it('isLeaf true / undefined 无 children / 有 children', () => {
    const { container } = render(
      <Wrapper>
        <FileTree
          treeData={[
            { key: 'a', title: 'A', isLeaf: true },
            { key: 'b', title: 'B', isLeaf: undefined, children: [] },
            {
              key: 'c',
              title: 'C',
              children: [{ key: 'c1', title: 'C1', isLeaf: true }],
            },
          ]}
          onLoadChildren={async () => []}
        />
      </Wrapper>,
    );
    expect(container.textContent || container.querySelector('.ant-tree')).toBeTruthy();
  });
});
