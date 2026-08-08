import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { TaskListItem } from '../TaskListItem';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('../StatusIcon', () => ({
  StatusIcon: () => <span data-testid="task-status" />,
}));

const renderItem = (expandedKeys: string[], item: any, onToggle = vi.fn()) =>
  render(
    <I18nContext.Provider value={{ locale: null } as any}>
      <TaskListItem
        item={item}
        isLast
        prefixCls="task-list"
        hashId="hash"
        expandedKeys={expandedKeys}
        onToggle={onToggle}
      />
    </I18nContext.Provider>,
  );

describe('TaskListItem residual branches', () => {
  it('renders no expand affordance when both content and title are absent', () => {
    renderItem([], { key: 'empty', status: 'pending' });
    expect(screen.queryByTestId('task-list-arrowContainer')).toBeNull();
  });

  it('uses collapsed body state and toggles from the title area', () => {
    const onToggle = vi.fn();
    const { container } = renderItem(
      [],
      { key: 'task', title: 'Task', content: 'Details', status: 'success' },
      onToggle,
    );
    const body = container.querySelector('.task-list-body');
    fireEvent.click(screen.getByText('Task'));

    expect(body).toHaveClass('task-list-body-collapsed');
    expect(onToggle).toHaveBeenCalledWith('task');
  });
});
