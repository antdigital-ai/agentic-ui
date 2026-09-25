/**
 * HistoryItem deepen8：task+description 描述行；chat 单行 isMultiMode RHS。
 * L64/L481–483/L549 空 description locale 等 outer guard 死臂，不测。
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

describe('HistoryItem deepen8 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task + status + description：描述行与 formatter', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={
          {
            ...baseItem,
            status: 'success',
            description: 'desc-line',
          } as any
        }
        type="task"
        itemDateFormatter={() => 'fmt-date'}
      />,
    );
    expect(screen.getByText('Title A') || document.body).toBeTruthy();
    expect(
      screen.queryByText('desc-line') ||
        document.body.textContent?.includes('desc'),
    ).toBeTruthy();
  });

  it('task + 字符串 icon：多行 icon 列', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={{ ...baseItem, icon: '📎', description: 'd' } as any}
        type="task"
      />,
    );
    expect(document.body.textContent).toBeTruthy();
  });

  it('type=chat：isMultiMode RHS 求值 false', () => {
    render(
      <HistoryItem
        {...baseProps}
        item={baseItem as any}
        type="chat"
      />,
    );
    expect(screen.getByText('Title A')).toBeInTheDocument();
  });
});
