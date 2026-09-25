/**
 * TaskListItem 残留：展开高度、transitionEnd、locale 箭头文案。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { TaskListItem } from '../TaskListItem';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, title, onClick }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('../StatusIcon', () => ({
  StatusIcon: () => <span data-testid="task-status" />,
}));

describe('TaskListItem more residual branches', () => {
  it('展开态 transitionEnd 设 height auto；locale 箭头文案', () => {
    const { container, rerender } = render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'taskList.expand': 'ExpandX',
              'taskList.collapse': 'CollapseX',
            },
          } as any
        }
      >
        <TaskListItem
          item={{
            key: 't1',
            title: 'Title',
            content: 'Body',
            status: 'pending',
          }}
          isLast={false}
          prefixCls="task-list"
          hashId="h"
          expandedKeys={['t1']}
          onToggle={vi.fn()}
        />
      </I18nContext.Provider>,
    );

    expect(screen.getByTitle('CollapseX')).toBeTruthy();
    const body = container.querySelector('.task-list-body') as HTMLElement;
    Object.defineProperty(body, 'scrollHeight', { value: 40 });
    fireEvent.transitionEnd(body);
    expect(body.style.height).toBe('auto');

    rerender(
      <I18nContext.Provider value={{ locale: null } as any}>
        <TaskListItem
          item={{
            key: 't1',
            title: 'Title',
            content: 'Body',
            status: 'pending',
          }}
          isLast
          prefixCls="task-list"
          hashId="h"
          expandedKeys={[]}
          onToggle={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTitle('展开')).toBeTruthy();
  });

  it('仅 title 也视为有内容可展开', () => {
    render(
      <I18nContext.Provider value={{ locale: null } as any}>
        <TaskListItem
          item={{ key: 't2', title: 'OnlyTitle', status: 'success' }}
          isLast
          prefixCls="task-list"
          hashId=""
          expandedKeys={['t2']}
          onToggle={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getAllByText('OnlyTitle').length).toBeGreaterThan(0);
  });
});
