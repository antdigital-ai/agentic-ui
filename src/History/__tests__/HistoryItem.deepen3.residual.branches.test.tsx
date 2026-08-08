/**
 * HistoryItem deepen3：无 status icon null、ReactElement icon、无 onDeleteItem、
 * 未知 status、description 缺省 locale 回退。
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
    locale: {},
  }),
}));
vi.mock('../hooks/useFormatTimeLocale', () => ({
  useFormatTimeLocale: () => ({}),
}));
vi.mock('../components/HistoryActionsBox', () => ({
  HistoryActionsBox: ({ children, onDeleteItem }: any) => (
    <div data-testid="actions-box">
      {children}
      <button
        type="button"
        data-testid="delete-btn"
        onClick={() => onDeleteItem?.()}
      >
        delete
      </button>
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

describe('HistoryItem deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ReactElement icon；未知 status 不崩溃', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: <span data-testid="custom-icon">C</span>,
            status: 'not-a-real-status' as any,
            description: 'desc-for-multi',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('无 status 且无 icon：不强制渲染 status icon；无 onDeleteItem 点击安全', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            description: 'only-desc',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('only-desc')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(screen.getByTestId('actions-box')).toBeInTheDocument();
  });

  it('chat 无 onDeleteItem；task 无 description 但有 status icon', () => {
    render(
      <HistoryItem item={baseItem as any} {...baseProps} type="chat" />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));

    cleanup();
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });
});
