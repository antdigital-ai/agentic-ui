import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useContext, useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Suggestion, SuggestionContext } from '../index';

const dropdownPropsHistory = vi.hoisted(() => [] as any[]);

vi.mock('antd', () => ({
  Dropdown: (props: any) => {
    dropdownPropsHistory.push(props);

    const menu = props.menu;
    const popup = props.popupRender?.(
      <div data-testid="default-dropdown">Default dropdown</div>,
    );

    return (
      <div data-testid="dropdown" data-open={String(props.open)}>
        <div data-testid="popup">{popup}</div>
        {Array.isArray(menu?.items)
          ? menu.items.map((item: any) => (
              <button
                key={item.key}
                type="button"
                data-testid={`suggestion-item-${item.key}`}
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

const getLastDropdownProps = () =>
  dropdownPropsHistory[dropdownPropsHistory.length - 1];

const SelectBinder: React.FC<{ onSelect: (value: string) => void }> = ({
  onSelect,
}) => {
  const context = useContext(SuggestionContext);

  useEffect(() => {
    if (!context.onSelectRef) return;
    context.onSelectRef.current = onSelect;
  }, [context.onSelectRef, onSelect]);

  return <button type="button">Trigger</button>;
};

describe('Suggestion', () => {
  afterEach(() => {
    dropdownPropsHistory.length = 0;
    vi.clearAllMocks();
  });

  it('renders without repeatedly rebuilding empty items when tagInputProps is omitted', async () => {
    render(
      <Suggestion>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    });

    expect(dropdownPropsHistory.length).toBeLessThanOrEqual(2);
    expect(getLastDropdownProps().menu.items).toEqual([]);
  });

  it('passes a custom Dropdown menu object through intact', () => {
    const customMenu = {
      items: [{ key: 'custom-action', label: 'Custom action' }],
      selectable: true,
    };

    render(
      <Suggestion
        tagInputProps={{
          menu: customMenu,
          notFoundContent: <span>No suggestions</span>,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    expect(getLastDropdownProps().menu).toBe(customMenu);
    expect(screen.getByText('No suggestions')).toBeInTheDocument();
  });

  it('selects static suggestion items by stringified key and closes the dropdown', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 123, label: 'Deploy target' }],
          onOpenChange,
          open: true,
        }}
      >
        <SelectBinder onSelect={onSelect} />
      </Suggestion>,
    );

    await user.click(screen.getByTestId('suggestion-item-123'));

    expect(onSelect).toHaveBeenCalledWith('123');
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });
});
