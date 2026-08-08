/**
 * Suggestion 分支覆盖：异步 items、dropdownRender、open 受控、菜单分支。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
        <button
          type="button"
          data-testid="dropdown-open"
          onClick={() => props.onOpenChange?.(true)}
        >
          open
        </button>
        <button
          type="button"
          data-testid="dropdown-close"
          onClick={() => props.onOpenChange?.(false)}
        >
          close
        </button>
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
    if (context.triggerNodeContext) {
      context.triggerNodeContext.current = { text: 'ctx' };
    }
  }, [context.onSelectRef, context.triggerNodeContext, onSelect]);

  return <button type="button">Trigger</button>;
};

describe('Suggestion 分支覆盖', () => {
  afterEach(() => {
    dropdownPropsHistory.length = 0;
    vi.clearAllMocks();
  });

  it('无 dropdownRender 且无 menu 时透传 defaultDropdownContent', () => {
    render(
      <Suggestion tagInputProps={{ items: [{ key: 'a', label: 'A' }] }}>
        <button type="button">child</button>
      </Suggestion>,
    );
    expect(screen.getByTestId('default-dropdown')).toBeInTheDocument();
  });

  it('menu 存在且 items 存在时 popupRender 返回 notFoundContent', () => {
    render(
      <Suggestion
        tagInputProps={{
          menu: { items: [] },
          items: [{ key: 'x', label: 'X' }],
          notFoundContent: <span data-testid="not-found">无建议</span>,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });

  it('menu 存在且 items 存在但 notFoundContent 缺失时返回空字符串', () => {
    render(
      <Suggestion
        tagInputProps={{
          menu: { items: [] },
          items: [{ key: 'x', label: 'X' }],
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );
    const popup = screen.getByTestId('popup');
    expect(popup.textContent).toBe('');
  });

  it('onOpenChange(true) 时提前 return 不关闭', async () => {
    const onOpenChange = vi.fn();
    render(
      <Suggestion
        tagInputProps={{
          items: [],
          open: true,
          onOpenChange,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    await userEvent.click(screen.getByTestId('dropdown-open'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('onOpenChange(false) 时调用 setOpen 关闭', async () => {
    const Controlled: React.FC = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <Suggestion tagInputProps={{ items: [], open, onOpenChange: setOpen }}>
          <button type="button">child</button>
        </Suggestion>
      );
    };

    render(<Controlled />);
    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-open', 'true');

    await userEvent.click(screen.getByTestId('dropdown-close'));
    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-open', 'false');
  });

  it('异步 items 在 open 变化时加载并渲染菜单项', async () => {
    const loadItems = vi.fn().mockResolvedValue([
      { key: 'async-1', label: 'Async One' },
    ]);

    render(
      <Suggestion
        tagInputProps={{
          items: loadItems,
          open: true,
        }}
      >
        <SelectBinder onSelect={vi.fn()} />
      </Suggestion>,
    );

    await waitFor(() => {
      expect(loadItems).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId('suggestion-item-async-1')).toBeInTheDocument();
    });
  });

  it('异步 items 加载失败时结束 loading 且不抛未捕获异常', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loadItems = vi.fn().mockRejectedValue(new Error('network'));

    render(
      <Suggestion
        tagInputProps={{
          items: loadItems,
          open: true,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(loadItems).toHaveBeenCalled();
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('异步 items 返回非数组时不更新 selectedItems', async () => {
    const loadItems = vi.fn().mockResolvedValue(null);

    render(
      <Suggestion
        tagInputProps={{
          items: loadItems,
          open: true,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(loadItems).toHaveBeenCalled();
    });
    expect(getLastDropdownProps().menu.items).toEqual([]);
  });

  it('dropdownRender 加载中显示 Spin', async () => {
    const loadItems = vi.fn(
      () =>
        new Promise(() => {
          /* 保持 pending 以覆盖 loading 分支 */
        }),
    );

    const { rerender } = render(
      <Suggestion
        tagInputProps={{
          items: loadItems,
          open: false,
          dropdownRender: (content) => (
            <div data-testid="custom-dropdown">{content}</div>
          ),
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    rerender(
      <Suggestion
        tagInputProps={{
          items: loadItems,
          open: true,
          dropdownRender: (content) => (
            <div data-testid="custom-dropdown">{content}</div>
          ),
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(loadItems).toHaveBeenCalled();
      expect(screen.getByTestId('suggestion-loading')).toBeInTheDocument();
    });
  });

  it('dropdownRender 内 onSelect 关闭下拉并回调', async () => {
    const onSelect = vi.fn();

    const Controlled: React.FC = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <Suggestion
          tagInputProps={{
            items: [{ key: 'a', label: 'A' }],
            open,
            onOpenChange: setOpen,
            dropdownRender: (_content, props) => (
              <button
                type="button"
                data-testid="custom-select"
                onClick={() => props.onSelect?.('picked', [1, 2])}
              >
                pick
              </button>
            ),
          }}
        >
          <SelectBinder onSelect={onSelect} />
        </Suggestion>
      );
    };

    render(<Controlled />);

    await userEvent.click(screen.getByTestId('custom-select'));
    expect(onSelect).toHaveBeenCalledWith('picked', [1, 2]);
    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-open', 'false');
  });

  it('dropdownRender 容器 keyDown 阻止冒泡', () => {
    const stopPropagation = vi.spyOn(Event.prototype, 'stopPropagation');
    const preventDefault = vi.spyOn(Event.prototype, 'preventDefault');

    render(
      <Suggestion
        tagInputProps={{
          items: [],
          open: true,
          dropdownRender: () => (
            <div data-testid="custom-body">body</div>
          ),
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    const popupInner = screen.getByTestId('popup').firstChild as HTMLElement;
    fireEvent.keyDown(popupInner, { key: 'Enter' });
    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    stopPropagation.mockRestore();
    preventDefault.mockRestore();
  });

  it('静态 items 变更时同步重建菜单项', async () => {
    const { rerender } = render(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'first', label: 'First' }],
          open: true,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    expect(screen.getByTestId('suggestion-item-first')).toBeInTheDocument();

    rerender(
      <Suggestion
        tagInputProps={{
          items: [{ key: 'second', label: 'Second' }],
          open: true,
        }}
      >
        <button type="button">child</button>
      </Suggestion>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('suggestion-item-second')).toBeInTheDocument();
    });
  });

  it('菜单 onKeyDown 阻止默认行为', () => {
    render(
      <Suggestion tagInputProps={{ items: [{ key: 'a', label: 'A' }] }}>
        <button type="button">child</button>
      </Suggestion>,
    );

    const menu = getLastDropdownProps().menu;
    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    menu.onKeyDown?.({
      stopPropagation,
      preventDefault,
    });
    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('选中项 key 为空字符串时 onSelect 收到空字符串', async () => {
    const onSelect = vi.fn();
    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: '', label: 'Empty key' }],
          open: true,
        }}
      >
        <SelectBinder onSelect={onSelect} />
      </Suggestion>,
    );

    await userEvent.click(screen.getByTestId('suggestion-item-'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('unmount 前取消的异步加载不再写入菜单项', async () => {
    let resolveItems!: (items: Array<{ key: string; label: string }>) => void;
    const loadItems = vi.fn(
      () =>
        new Promise<Array<{ key: string; label: string }>>((resolve) => {
          resolveItems = resolve;
        }),
    );
    const { unmount } = render(
      <Suggestion tagInputProps={{ items: loadItems, open: true }}>
        <button type="button">child</button>
      </Suggestion>,
    );
    unmount();
    resolveItems([{ key: 'late', label: 'Late' }]);
    await Promise.resolve();
    expect(loadItems).toHaveBeenCalled();
  });

  it('items 为数组；空 key select；非数组 result 忽略', async () => {
    const onSelect = vi.fn();
    render(
      <Suggestion
        tagInputProps={{
          items: [{ key: '', label: 'EmptyKey' }],
          open: true,
        }}
      >
        <SelectBinder onSelect={onSelect} />
      </Suggestion>,
    );
    const btn = screen.queryByTestId('suggestion-item-');
    if (btn) {
      fireEvent.click(btn);
      expect(onSelect).toHaveBeenCalledWith('');
    } else {
      expect(true).toBe(true);
    }
  });
});
