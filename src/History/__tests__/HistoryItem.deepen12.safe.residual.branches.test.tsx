/**
 * HistoryItem deepen12 safe：multi 模式 chat+icon+desc、status 图标、
 * 字符串 icon、溢出 tooltip、customOperation 嵌套数组、itemDateFormatter。
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
  Tooltip: ({ children, title, open }: any) => (
    <div data-testid="tooltip" data-title={String(title ?? '')} data-open={open}>
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
  HistoryActionsBox: ({ children }: any) => (
    <div data-testid="actions-box">{children}</div>
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

import { useTextOverflow } from '../hooks/useTextOverflow';
import { HistoryItem } from '../components/HistoryItem';

const baseItem = {
  sessionId: 's12',
  id: 'id12',
  sessionTitle: 'Title 12',
  gmtCreate: 1700000000000,
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useTextOverflow).mockReturnValue({
      textRef: { current: null },
      isTextOverflow: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task + icon + description → multi 模式', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            icon: '📁',
            description: 'nested desc',
          } as any
        }
        type="task"
      />,
    );
    expect(screen.getByText('nested desc')).toBeInTheDocument();
  });

  it('task status error/cancel 走 renderTaskStatusIcon', () => {
    const { rerender } = render(
      <HistoryItem
        {...baseProps}
        item={{ ...baseItem, status: 'error', description: 'e' } as any}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
    rerender(
      <HistoryItem
        {...baseProps}
        item={{ ...baseItem, status: 'cancel', description: 'c' } as any}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-close')).toBeInTheDocument();
  });

  it('task 字符串 icon 分支；displayTitle 优先', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            displayTitle: 'Display 12',
            icon: '📄',
            description: 'd',
          } as any
        }
        type="task"
      />,
    );
    expect(screen.getByText('Display 12')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  it('溢出 tooltip open；选中 font 分支；agent checkbox', () => {
    vi.mocked(useTextOverflow).mockReturnValue({
      textRef: { current: null },
      isTextOverflow: true,
    });
    render(
      <HistoryItem
        {...baseProps}
        selectedIds={['s12']}
        agent={{ onSelectionChange: vi.fn() } as any}
        item={baseItem as any}
        type="chat"
      />,
    );
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-title',
      'Title 12',
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('customOperationExtra 嵌套数组；itemDateFormatter', () => {
    const fmt = vi.fn(() => 'fmt-date');
    render(
      <HistoryItem
        {...baseProps}
        item={{ ...baseItem, description: 'x'.repeat(25) } as any}
        type="task"
        customOperationExtra={[[<span key="a">op</span>]]}
        itemDateFormatter={fmt}
      />,
    );
    expect(screen.getByText('op')).toBeInTheDocument();
    expect(fmt).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Title 12'));
    expect(baseProps.onClick).toHaveBeenCalledWith('s12', expect.any(Object));
  });
});
