/**
 * HistoryItem deepen2：string icon、长 description tooltip、isMultiMode、delete。
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
  Checkbox: ({ checked, onChange, ...rest }: any) => (
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
      {...rest}
    />
  ),
  Divider: () => <span>|</span>,
  Tooltip: ({ children, title, open }: any) => (
    <div
      data-testid="tooltip"
      data-title={String(title ?? '')}
      data-open={String(open)}
    >
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
    locale: { 'task.default': '任务默认' },
  }),
}));
vi.mock('../hooks/useFormatTimeLocale', () => ({
  useFormatTimeLocale: () => ({}),
}));
vi.mock('../components/HistoryActionsBox', () => ({
  HistoryActionsBox: ({ children, onDeleteItem }: any) => (
    <div data-testid="actions-box">
      {children}
      {onDeleteItem && (
        <button type="button" data-testid="delete-btn" onClick={onDeleteItem}>
          delete
        </button>
      )}
    </div>
  ),
}));
vi.mock('../components/HistoryRunningIcon', () => ({
  HistoryRunningIcon: () => <span data-testid="running-icon" />,
}));
vi.mock('../hooks/useTextOverflow', () => ({
  useTextOverflow: vi.fn(() => ({
    textRef: { current: null },
    isTextOverflow: true,
  })),
}));

import { HistoryItem } from '../components/HistoryItem';

const baseItem = {
  sessionId: 's1',
  id: 'id1',
  sessionTitle: 'Session Title',
  gmtCreate: 1700000000000,
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task 字符串 icon 多行分支；长 description tooltip open=undefined', () => {
    const fmt = vi.fn(() => 'FMT');
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: '⭐',
            status: 'success',
            description:
              'this-description-is-longer-than-twenty-chars-for-tooltip',
          } as any
        }
        {...baseProps}
        type="task"
        itemDateFormatter={fmt}
      />,
    );
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(fmt).toHaveBeenCalled();
    const tips = screen.getAllByTestId('tooltip');
    expect(
      tips.some((t) => t.getAttribute('data-open') === 'undefined'),
    ).toBe(true);
  });

  it('短 description：tooltip open=false；无 icon 有 status', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success',
            description: 'short',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('short')).toBeInTheDocument();
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('chat 单行 + onDeleteItem；task isMultiMode', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem
        item={baseItem as any}
        {...baseProps}
        type="chat"
        onDeleteItem={onDelete}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('s1');

    cleanup();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: '📄',
            description: 'multi',
            status: 'success',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('multi')).toBeInTheDocument();
  });
});
