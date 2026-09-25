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
  it('does not mount a dropdown when disabled', () => {
    const { container } = render(
      <Suggestion suggestionProps={{ enabled: false }}>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    expect(container.querySelector('[data-testid="dropdown"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

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

  it('loads async items when items is a function', async () => {
    const items = vi
      .fn()
      .mockResolvedValue([{ key: 'async', label: 'Async item' }]);

    render(
      <Suggestion tagInputProps={{ items, open: true }}>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(items).toHaveBeenCalled();
      expect(screen.getByTestId('suggestion-item-async')).toBeInTheDocument();
    });
  });

  it('uses dropdownRender wrapper when provided', async () => {
    const dropdownRender = vi.fn((content: React.ReactNode) => (
      <div data-testid="custom-dropdown">{content}</div>
    ));

    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'x', label: 'X' }],
          dropdownRender,
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-dropdown')).toBeInTheDocument();
    });
    expect(dropdownRender).toHaveBeenCalled();
  });

  it('logs warning when async items loader rejects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const items = vi.fn().mockRejectedValue(new Error('load failed'));

    render(
      <Suggestion tagInputProps={{ items, open: true }}>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(items).toHaveBeenCalled();
    });
    expect(warn).toHaveBeenCalledWith(
      '[Suggestion] items() loading failed:',
      expect.any(Error),
    );
    warn.mockRestore();
  });

  it('stops keydown propagation on default menu items', () => {
    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'a', label: 'Alpha' }],
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    getLastDropdownProps().menu.onKeyDown({
      stopPropagation,
      preventDefault,
    } as any);

    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('invokes onSelect from dropdownRender props and closes', async () => {
    const onSelect = vi.fn();
    let dropdownProps: Record<string, any> | undefined;
    const dropdownRender = vi.fn(
      (_content: React.ReactNode, props: Record<string, any>) => {
        dropdownProps = props;
        return <div data-testid="custom-dropdown">{_content}</div>;
      },
    );

    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'x', label: 'X' }],
          dropdownRender,
          open: true,
        }}
      >
        <SelectBinder onSelect={onSelect} />
      </Suggestion>,
    );

    await waitFor(() => {
      expect(dropdownRender).toHaveBeenCalled();
    });

    dropdownProps!.onSelect('custom-value', [2]);
    expect(onSelect).toHaveBeenCalledWith('custom-value', [2]);
  });

  it('ignores non-array async items results', async () => {
    const items = vi.fn().mockResolvedValue(null as any);

    render(
      <Suggestion tagInputProps={{ items, open: true }}>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(items).toHaveBeenCalled();
    });
    expect(getLastDropdownProps().menu.items).toEqual([]);
  });

  it('returns empty string when menu and items exist without notFoundContent', () => {
    render(
      <Suggestion
        tagInputProps={{
          menu: { items: [] },
          items: [],
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    expect(screen.getByTestId('popup').textContent).toBe('');
  });

  it('updates selected items when static items array changes', async () => {
    const { rerender } = render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'a', label: 'Alpha' }],
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    expect(screen.getByTestId('suggestion-item-a')).toBeInTheDocument();

    rerender(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'b', label: 'Beta' }],
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('suggestion-item-b')).toBeInTheDocument();
    });
  });

  it('handles Dropdown onOpenChange open vs close branches', async () => {
    render(
      <Suggestion tagInputProps={{ items: [{ key: 'a', label: 'Alpha' }] }}>
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    getLastDropdownProps().onOpenChange(true);
    expect(getLastDropdownProps().open).toBe(false);

    getLastDropdownProps().onOpenChange(false);

    await waitFor(() => {
      expect(getLastDropdownProps().open).toBe(false);
    });
  });

  it('stops keydown propagation on dropdownRender wrapper', async () => {
    const dropdownRender = vi.fn((content: React.ReactNode) => (
      <div data-testid="custom-dropdown">{content}</div>
    ));

    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'x', label: 'X' }],
          dropdownRender,
          open: true,
        }}
      >
        <button type="button">Trigger</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(dropdownRender).toHaveBeenCalled();
    });

    const wrapper = screen.getByTestId('popup')
      .firstElementChild as HTMLElement;
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
    });
    const stopPropagation = vi.spyOn(event, 'stopPropagation');
    const preventDefault = vi.spyOn(event, 'preventDefault');

    wrapper.dispatchEvent(event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });
});
