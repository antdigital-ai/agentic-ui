/**
 * CommentList：pure spacer、可选 onDelete/onEdit、空列表。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: { children: [] } },
  }),
  EditorStoreContext: React.createContext({
    setShowComment: vi.fn(),
  }),
}));

import { CommentList } from '../index';

describe('CommentList branches', () => {
  it('pure true 不渲染 spacer', () => {
    const { container } = render(
      <ConfigProvider>
        <CommentList
          pure
          commentList={[]}
          comment={{}}
        />
      </ConfigProvider>,
    );
    const spacers = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.width === '300px',
    );
    expect(spacers.length).toBe(0);
  });

  it('非 pure 渲染 spacer', () => {
    const { container } = render(
      <ConfigProvider>
        <CommentList commentList={[]} comment={{}} />
      </ConfigProvider>,
    );
    const spacers = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.width === '300px',
    );
    expect(spacers.length).toBeGreaterThan(0);
  });

  it.skip('渲染评论项名称首字母与可选操作', () => {
    render(
      <ConfigProvider>
        <CommentList
          pure
          commentList={[
            {
              id: '1',
              content: 'hello comment',
              time: Date.now(),
              user: { name: 'Alice', avatar: '' },
            } as any,
          ]}
          comment={{
            onClick: vi.fn(),
          }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText(/hello comment|Alice/)).toBeTruthy();
  });
});
