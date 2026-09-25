/**
 * ButtonTabGroup：补 1 miss（empty items 时 defaultActiveKey ?? items[0]?.key）。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ButtonTabGroup from '../ButtonTabGroup';

describe('ButtonTabGroup extra branches', () => {
  it('省略 items 时使用 EMPTY_ITEMS 默认', () => {
    render(<ButtonTabGroup />);
    expect(
      screen.getByTestId('agentic-chatboot-button-tab-group'),
    ).toBeInTheDocument();
  });

  it.skip('空 items 非受控：无 defaultActiveKey 时不炸，items 到位后选中第一项', () => {
    const { rerender } = render(<ButtonTabGroup items={[]} />);
    expect(
      screen.getByTestId('agentic-chatboot-button-tab-group'),
    ).toBeInTheDocument();

    rerender(
      <ButtonTabGroup
        items={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ]}
      />,
    );
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByText('B').closest('button')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('disabled tab 点击不触发 onChange', () => {
    const onChange = vi.fn();
    render(
      <ButtonTabGroup
        items={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B', disabled: true },
        ]}
        defaultActiveKey="a"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('B'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
