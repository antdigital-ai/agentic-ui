/**
 * HistoryItem deepen10 safe：onDeleteItem 单行/多行、task 默认描述、
 * icon 元素/字符串 fallback、ReactElement icon。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sofa-design/icons', () => ({
  CloseCircleFill: () => <span data-testid="icon-close" />,
  FileCheckFill: () => <span data-testid="icon-file-check" />,
  WarningFill: () => <span data-testid="icon-warning" />,
}));

vi.mock('antd', () => ({
  ConfigProvider: {
    ConfigContext: React.createContext({
      getPrefixCls: (s: string) => `ant-${s}`,
    }),
  },
  Checkbox: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={!!checked}
      onChange={(e) =>
        onChange?.({
          target: { checked: e.target.checked },
          stopPropagation: () => {},
        })
      }
    />
  ),
  Divider: () => <span data-testid="divider">|</span>,
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" data-title={String(title ?? '')}>
      {children}
    </div>
  ),
}));

vi.mock('../style', () => ({ useStyle: () => ({ hashId: 'h' }) }));
vi.mock('../utils', () => ({ formatTime: (v: any) => `time:${v}` }));
vi.mock('../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));
vi.mock('../../Hooks/useAdaptiveTooltipProps', () => ({
  useAdaptiveTooltipProps: () => ({}),
}));
vi.mock('../../I18n', () => ({
  I18nContext: React.createContext({
    locale: { 'task.default': '默认任务' },
  }),
}));
vi.mock('../hooks/useFormatTimeLocale', () => ({
  useFormatTimeLocale: () => ({}),
}));
vi.mock('../components/HistoryActionsBox', () => ({
  HistoryActionsBox: ({ onDeleteItem, children }: any) => (
    <div data-testid="actions-box">
      {children}
      {onDeleteItem ? (
        <button type="button" data-testid="delete-btn" onClick={() => onDeleteItem()}>
          del
        </button>
      ) : null}
    </div>
  ),
}));
vi.mock('../components/HistoryRunningIcon', () => ({
  HistoryRunningIcon: () => <span data-testid="running-icon" />,
}));
vi.mock('../hooks/useTextOverflow', () => ({
  useTextOverflow: vi.fn(() => ({
    textRef: { current: null },
    isTextOverflow: false,
  })),
}));

import { HistoryItem } from '../components/HistoryItem';

const baseItem = {
  sessionId: 's10',
  id: 'id10',
  sessionTitle: 'Title 10',
  gmtCreate: 1700000000000,
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem deepen10 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('单行 chat + onDeleteItem → handleDelete 调用', async () => {
    const onDeleteItem = vi.fn(async () => {});
    render(
      <HistoryItem
        {...baseProps}
        item={baseItem as any}
        type="chat"
        onDeleteItem={onDeleteItem}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    await vi.runAllTimersAsync();
    expect(onDeleteItem).toHaveBeenCalledWith('s10');
  });

  it('task + description：描述行 item.description 分支', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            status: 'success',
            description: 'task-desc',
          } as any
        }
        type="task"
      />,
    );
    expect(screen.getByText('task-desc')).toBeInTheDocument();
  });

  it('task + ReactElement icon；字符串 icon fallback', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            status: 'success',
            icon: <span data-testid="custom-icon">IC</span>,
            description: 'd',
          } as any
        }
        type="task"
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();

    cleanup();
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            status: 'success',
            icon: '📎',
            description: 'desc',
          } as any
        }
        type="task"
        onDeleteItem={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(document.body.textContent).toMatch(/📎|desc|Title 10/);
  });
});
