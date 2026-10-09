import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TaskList } from '../TaskList';
import * as taskContent from '../normalizeTaskContent';
import type { TaskItem } from '../types';

const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
};

describe('TaskList DOM and expansion regressions', () => {
  it('defers collapsed custom bodies and preserves their state after opening', () => {
    const items: TaskItem[] = [
      { key: 'task', title: 'Task', content: <Counter />, status: 'success' },
    ];
    const { container, rerender } = render(
      <TaskList items={items} expandedKeys={[]} />,
    );

    expect(screen.queryByRole('button', { name: 'Count 0' })).toBeNull();
    expect(container.querySelector('.ant-task-list-body')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    rerender(<TaskList items={items} expandedKeys={['task']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Count 0' }));
    const counter = screen.getByRole('button', { name: 'Count 1' });

    rerender(<TaskList items={items} expandedKeys={[]} />);
    expect(counter).toBeInTheDocument();
    rerender(<TaskList items={items} expandedKeys={['task']} />);
    expect(screen.getByRole('button', { name: 'Count 1' })).toBe(counter);
  });

  it('does not renormalize unchanged task content while expansion changes', () => {
    const normalize = vi.spyOn(taskContent, 'normalizeTaskContent');
    const items: TaskItem[] = Array.from({ length: 50 }, (_, index) => ({
      key: String(index),
      title: `Task ${index}`,
      content: `Body ${index}`,
      status: 'success',
    }));
    const Example = () => {
      const [keys, setKeys] = useState<string[]>([]);
      return (
        <TaskList
          items={items}
          expandedKeys={keys}
          onExpandedKeysChange={setKeys}
        />
      );
    };

    try {
      render(<Example />);
      normalize.mockClear();
      fireEvent.click(screen.getByText('Task 0'));
      expect(screen.getByText('Body 0')).toBeInTheDocument();
      expect(screen.queryByText('Body 1')).toBeNull();
      expect(normalize).not.toHaveBeenCalled();
    } finally {
      normalize.mockRestore();
    }
  });

  it('does not mount the last task before a simple list is first opened', () => {
    const mount = vi.fn();
    const Body = () => {
      mount();
      return <div>Last task details</div>;
    };
    const items: TaskItem[] = [
      { key: 'last', title: 'Last', content: <Body />, status: 'success' },
    ];
    render(<TaskList variant="simple" items={items} />);

    expect(mount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('task-list-simple-bar'));
    expect(screen.getByText('Last task details')).toBeInTheDocument();
    expect(mount).toHaveBeenCalledTimes(1);
  });
});
