/**
 * TaskList deepen residual：scrollIntoView object、无 locale 完成/进行中文案、折叠箭头。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskList } from '..';
import { I18nContext } from '../../I18n';

vi.mock('../../Components/Loading', () => ({
  Loading: () => <div data-testid="task-list-loading">Loading</div>,
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, children, title, ...props }: any) => (
    <button
      type="button"
      data-testid="action-icon-box"
      title={title}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('../style', () => ({
  useStyle: () => ({ hashId: 'h' }),
}));

describe('TaskList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('无 locale 全部成功 → 任务完成；collapse 默认', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: null, language: 'zh-CN' } as any}>
          <TaskList
            variant="simple"
            open
            onOpenChange={vi.fn()}
            items={[
              { key: 'a', title: 'A', content: 'ca', status: 'success' },
              { key: 'b', title: 'B', content: 'cb', status: 'success' },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('任务完成')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-simple-bar')).toHaveAttribute(
      'aria-label',
      '收起',
    );
  });

  it('无 locale 进行中 → 默认模板；expand 默认', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: null, language: 'zh-CN' } as any}>
          <TaskList
            variant="simple"
            open={false}
            onOpenChange={vi.fn()}
            items={[
              { key: 'a', title: 'Run', content: 'c', status: 'loading' },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('正在进行Run任务')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-simple-bar')).toHaveAttribute(
      'aria-label',
      '展开',
    );
  });

  it('scrollIntoViewOnExpand 为对象；非受控点击展开', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <TaskList
            variant="simple"
            scrollIntoViewOnExpand={{ behavior: 'auto', block: 'start' }}
            items={[
              { key: 'a', title: 'A', content: 'ca', status: 'success' },
              { key: 'b', title: 'B', content: 'cb', status: 'success' },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    fireEvent.click(screen.getByTestId('task-list-simple-bar'));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('进行中无 locale.taskInProgress；title 非字符串 → 空 taskName', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <TaskList
            variant="simple"
            open
            items={[
              {
                key: 'x',
                title: <span>Node</span>,
                content: 'c',
                status: 'loading',
              },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('正在进行任务')).toBeInTheDocument();
  });
});
