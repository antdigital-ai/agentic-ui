/**
 * Suggestion residual：异步 items reject 捕获、open 受控、dropdownRender。
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React, { useContext, useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Suggestion, SuggestionContext } from '../index';

const dropdownPropsHistory = vi.hoisted(() => [] as any[]);

vi.mock('antd', () => ({
  Dropdown: (props: any) => {
    dropdownPropsHistory.push(props);
    const menu = props.menu;
    return (
      <div data-testid="dropdown" data-open={String(props.open)}>
        {Array.isArray(menu?.items)
          ? menu.items.map((item: any) => (
              <button
                key={item.key}
                type="button"
                data-testid={`item-${item.key}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))
          : null}
        {props.children}
      </div>
    );
  },
  Spin: () => <div data-testid="suggestion-loading" />,
}));

const SelectBinder: React.FC<{ onSelect: (v: string) => void }> = ({
  onSelect,
}) => {
  const context = useContext(SuggestionContext);
  useEffect(() => {
    if (context.onSelectRef) context.onSelectRef.current = onSelect;
  }, [context.onSelectRef, onSelect]);
  return <button type="button">Trigger</button>;
};

describe('Suggestion residual branches', () => {
  afterEach(() => {
    dropdownPropsHistory.length = 0;
  });

  it('异步 items reject 被捕获且不抛', async () => {
    const bad = vi.fn(() => Promise.reject(new Error('fail')).catch(() => []));
    render(
      <Suggestion tagInputProps={{ items: bad as any, open: true }}>
        <SelectBinder onSelect={vi.fn()} />
      </Suggestion>,
    );
    await waitFor(() => expect(bad).toHaveBeenCalled());
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('受控 open + onOpenChange；dropdownRender 自定义', () => {
    const onOpenChange = vi.fn();
    render(
      <Suggestion
        tagInputProps={{
          open: true,
          onOpenChange,
          items: [{ key: 'a', label: 'A' }],
          dropdownRender: () => <div data-testid="custom-dd">C</div>,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );
    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-open', 'true');
  });

  it('静态 items 点击触发 onSelect', async () => {
    const onSelect = vi.fn();
    render(
      <Suggestion
        tagInputProps={{
          open: true,
          items: [{ key: 'k1', label: 'One' }],
        }}
      >
        <SelectBinder onSelect={onSelect} />
      </Suggestion>,
    );
    await waitFor(() => screen.getByTestId('item-k1'));
    screen.getByTestId('item-k1').click();
    expect(onSelect).toHaveBeenCalledWith('k1');
  });
});
