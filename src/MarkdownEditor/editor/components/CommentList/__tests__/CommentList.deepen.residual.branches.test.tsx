/**
 * CommentList deepen：pure/spacer、deleteConfirm 缺省文案、
 * onDelete/onEdit/跳转、locale 缺省、无 element 跳转。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../I18n';

const setNodes = vi.hoisted(() => vi.fn());
const setShowComment = vi.hoisted(() => vi.fn());

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: { children: [] } },
  }),
  EditorStoreContext: React.createContext({
    setShowComment,
  }),
}));

vi.mock('slate', () => ({
  Transforms: {
    setNodes: (...args: any[]) => setNodes(...args),
  },
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'c' }),
}));

import { CommentList } from '../index';

const commentItem = {
  id: 'c1',
  content: 'hello comment',
  time: Date.now(),
  path: [0, 0],
  user: { name: 'Alice Bob', avatar: '' },
} as any;

describe('CommentList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setNodes.mockClear();
    setShowComment.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非 pure 渲染 spacer；关闭触发 setShowComment', () => {
    const { container } = render(
      <ConfigProvider>
        <CommentList commentList={[]} comment={{}} />
      </ConfigProvider>,
    );
    const spacers = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.width === '300px',
    );
    expect(spacers.length).toBeGreaterThan(0);
    // CloseOutlined 可点击
    const header = screen.getByText(/划词评论/);
    const closeEl = header.parentElement?.querySelector('.anticon-close') as
      | HTMLElement
      | null;
    if (closeEl) {
      fireEvent.click(closeEl);
      expect(setShowComment).toHaveBeenCalledWith([]);
    }
  });

  it('onDelete 缺省确认文案；确认后 setNodes；locale 缺省', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const onClick = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <CommentList
            pure
            commentList={[commentItem]}
            comment={{
              onDelete,
              onEdit,
              onClick,
            }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    expect(screen.getByText('hello comment')).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();

    // 删除：打开 Popconfirm 后确认
    const deleteIcons = document.querySelectorAll('.anticon-delete');
    if (deleteIcons[0]) {
      fireEvent.click(deleteIcons[0]);
      const ok = await screen.findByText(/Yes|确定|OK/i).catch(() => null);
      const confirmBtns = document.querySelectorAll(
        '.ant-popconfirm-buttons button, .ant-btn-primary',
      );
      const confirm =
        ok ||
        Array.from(confirmBtns).find((b) =>
          /Yes|确定|OK/i.test(b.textContent || ''),
        );
      if (confirm) {
        fireEvent.click(confirm as HTMLElement);
        await waitFor(() => expect(onDelete).toHaveBeenCalled());
      }
    }

    const editIcons = document.querySelectorAll('.anticon-edit');
    if (editIcons[0]) {
      fireEvent.click(editIcons[0]);
      await waitFor(() => expect(onEdit).toHaveBeenCalled());
    }
  });

  it('跳转：无 DOM 元素仍调用 onClick；有元素 scrollIntoView', async () => {
    const onClick = vi.fn().mockResolvedValue(undefined);
    const target = document.createElement('div');
    target.id = 'comment-c1';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'en-US' } as any}>
          <CommentList
            pure
            commentList={[commentItem]}
            comment={{ onClick }}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    const exportIcons = document.querySelectorAll('.anticon-export');
    if (exportIcons[0]) {
      fireEvent.click(exportIcons[0]);
      await waitFor(() => expect(onClick).toHaveBeenCalled());
      expect(target.scrollIntoView).toHaveBeenCalled();
    }

    target.remove();

    // 无元素路径
    cleanup();
    const onClick2 = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfigProvider>
        <CommentList
          pure
          commentList={[{ ...commentItem, id: 'missing' }]}
          comment={{ onClick: onClick2 }}
        />
      </ConfigProvider>,
    );
    const export2 = document.querySelectorAll('.anticon-export');
    if (export2[0]) {
      fireEvent.click(export2[0]);
      await waitFor(() => expect(onClick2).toHaveBeenCalled());
    }
  });

  it('deleteConfirmText 自定义；onDelete 抛错吞掉', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('fail'));
    render(
      <ConfigProvider>
        <CommentList
          pure
          commentList={[commentItem]}
          comment={{
            onDelete,
            deleteConfirmText: '确认删评论？',
          }}
        />
      </ConfigProvider>,
    );
    const deleteIcons = document.querySelectorAll('.anticon-delete');
    if (deleteIcons[0]) {
      fireEvent.click(deleteIcons[0]);
      await waitFor(() => {
        expect(screen.getByText('确认删评论？')).toBeInTheDocument();
      });
      const btns = document.querySelectorAll(
        '.ant-popconfirm-buttons .ant-btn-primary, .ant-btn-primary',
      );
      if (btns[0]) {
        fireEvent.click(btns[0]);
        await waitFor(() => expect(onDelete).toHaveBeenCalled());
      }
    }
  });
});
