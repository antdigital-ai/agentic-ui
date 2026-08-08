/**
 * HistoryItem deepen7：多行 task + 字符串 icon；chat 单行；
 * L64/L481–483/L549 locale 空 description 等为 outer guard 死臂，不测。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
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
  Divider: () => <span data-testid="divider">|</span>,
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

import { HistoryItem } from '../components/HistoryItem';

const baseItem = {
  sessionId: 's1',
  id: 'id1',
  sessionTitle: 'Title A',
  gmtCreate: 1700000000000,
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem deepen7 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task：仅 icon 无 status → 多行图标列；无 description → 单行', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, icon: '📎' } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Title A')).toBeInTheDocument();
    expect(screen.getByText('📎')).toBeInTheDocument();

    cleanup();
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as any } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Title A')).toBeInTheDocument();
  });

  it('task：status+description 多行；itemDateFormatter', () => {
    const fmt = vi.fn(() => 'FMT');
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'error' as any,
            description: 'desc-line',
          } as any
        }
        {...baseProps}
        type="task"
        itemDateFormatter={fmt}
      />,
    );
    expect(screen.getByText('desc-line')).toBeInTheDocument();
    expect(fmt).toHaveBeenCalled();
  });

  it('chat：isMultiMode 右臂短接（isTask 假）', () => {
    render(
      <HistoryItem item={{ ...baseItem } as any} {...baseProps} type="chat" />,
    );
    expect(screen.getByText('Title A')).toBeInTheDocument();
  });
});
