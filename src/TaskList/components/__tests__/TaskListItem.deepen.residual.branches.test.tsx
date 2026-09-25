/**
 * TaskListItem deepen residual：syncHeight 无 ref 早退、收起高度、无 locale 箭头。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { TaskListItem } from '../TaskListItem';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, title }: any) => (
    <button type="button" title={title}>
      {children}
    </button>
  ),
}));

vi.mock('../StatusIcon', () => ({
  StatusIcon: () => <span data-testid="task-status" />,
}));

describe('TaskListItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('收起态 syncHeight 设 height 0；transitionEnd 收起不改 auto', () => {
    const { container } = render(
      <I18nContext.Provider value={{ locale: null } as any}>
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
          expandedKeys={[]}
          onToggle={vi.fn()}
        />
      </I18nContext.Provider>,
    );

    expect(screen.getByTitle('展开')).toBeInTheDocument();
    const body = container.querySelector('.task-list-body') as HTMLElement;
    Object.defineProperty(body, 'scrollHeight', {
      configurable: true,
      value: 48,
    });
    fireEvent.transitionEnd(body);
    expect(body.style.height).not.toBe('auto');
  });

  it('展开态无 locale.collapse 用默认收起', () => {
    const { container } = render(
      <I18nContext.Provider value={{ locale: {} } as any}>
        <TaskListItem
          item={{
            key: 't2',
            title: 'T2',
            content: 'Body2',
            status: 'success',
          }}
          isLast
          prefixCls="task-list"
          hashId="h"
          expandedKeys={['t2']}
          onToggle={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTitle('收起')).toBeInTheDocument();
    const body = container.querySelector('.task-list-body') as HTMLElement;
    const inner = container.querySelector('.task-list-content') as HTMLElement;
    Object.defineProperty(inner, 'scrollHeight', {
      configurable: true,
      value: 60,
    });
    fireEvent.transitionEnd(body);
    expect(body.style.height).toBe('auto');
  });
});
