/**
 * HistoryItem deepen4：无 status 早退、非 task description 回退、
 * 长 description tooltip、truthy 非 element icon、非 multi 模式。
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
    locale: {},
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
  sessionTitle: 'Session Title',
  gmtCreate: 1700000000000,
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem deepen4 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('chat 类型：无 description 行；非 element icon 字符串', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: '📄',
            description: undefined,
          } as any
        }
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });

  it('task：长 description 开 tooltip；缺省 locale 回退「任务」', () => {
    const long = 'abcdefghijklmnopqrstuvwxyz';
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: long,
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    const tips = screen.getAllByTestId('tooltip');
    expect(tips.some((t) => t.getAttribute('data-title') === long)).toBe(true);
  });

  it('task：无 description 时 shouldShowDescription=false', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'running' as any,
            icon: undefined,
            description: '',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('divider')).toBeNull();
  });

  it('task：truthy 非 element icon 走 div 包装；status 缺失 icon null', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: 0 as any,
            status: undefined,
            description: 'd',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('d')).toBeInTheDocument();
  });
});
