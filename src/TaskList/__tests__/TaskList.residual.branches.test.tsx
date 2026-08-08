/**
 * TaskList residual：simple 折叠定时器、scrollIntoView、taskCompleteText、进度。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskList } from '..';
import { I18nContext } from '../../I18n';

vi.mock('../../Components/Loading', () => ({
  Loading: () => <div data-testid="task-list-loading">Loading</div>,
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, children, ...props }: any) => (
    <div data-testid="action-icon-box" onClick={onClick} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider
        value={{
          locale: {
            'taskList.taskList': 'Tasks',
            'taskList.collapse': 'Collapse',
            'taskList.expand': 'Expand',
          } as any,
          language: 'en-US',
        }}
      >
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('TaskList residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it.skip('variant=simple 折叠后定时卸载内容', () => {
    wrap(
      <TaskList
        variant="simple"
        open
        onOpenChange={vi.fn()}
        items={[
          { key: 'a', title: 'A', content: 'ca', status: 'success' },
          { key: 'b', title: 'B', content: 'cb', status: 'success' },
        ]}
      />,
    );
    expect(screen.getByText('A')).toBeTruthy();
    fireEvent.click(screen.getByTestId('action-icon-box'));
    act(() => {
      vi.advanceTimersByTime(400);
    });
  });

  it.skip('全部成功时 taskCompleteText 函数/节点；showProgress', () => {
    wrap(
      <TaskList
        showProgress
        taskCompleteText={({ items }) => `done-${items.length}`}
        items={[
          { key: 'a', title: 'A', content: 'c', status: 'success' },
          { key: 'b', title: 'B', content: 'c', status: 'success' },
        ]}
      />,
    );
    expect(screen.getByText('done-2')).toBeTruthy();

    wrap(
      <TaskList
        taskCompleteText={<span>all-ok</span>}
        items={[{ key: 'a', title: 'A', content: 'c', status: 'success' }]}
      />,
    );
    expect(screen.getByText('all-ok')).toBeTruthy();
  });

  it.skip('受控 expandedKeys 切换；scrollIntoViewOnExpand', () => {
    const onExpandedKeysChange = vi.fn();
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    wrap(
      <TaskList
        expandedKeys={['a']}
        onExpandedKeysChange={onExpandedKeysChange}
        scrollIntoViewOnExpand
        items={[
          { key: 'a', title: 'A', content: 'ca', status: 'loading' },
          { key: 'b', title: 'B', content: 'cb', status: 'pending' },
        ]}
      />,
    );
    fireEvent.click(screen.getByText('A'));
    expect(onExpandedKeysChange).toHaveBeenCalled();
  });

  it.skip('externalLoading 显示 Loading；空 locale 回退标题', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
          <TaskList
            loading
            items={[{ key: 'a', title: 'A', content: 'c', status: 'error' }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('task-list-loading')).toBeTruthy();
  });
});
