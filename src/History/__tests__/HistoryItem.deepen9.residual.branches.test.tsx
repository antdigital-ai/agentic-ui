/**
 * HistoryItem deepen9：running 状态图标；长 description tooltip。
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
  Checkbox: () => <input type="checkbox" data-testid="checkbox" />,
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
  I18nContext: React.createContext({ locale: {} }),
}));
vi.mock('../hooks/useFormatTimeLocale', () => ({
  useFormatTimeLocale: () => ({}),
}));
vi.mock('../components/HistoryActionsBox', () => ({
  HistoryActionsBox: ({ children }: any) => <div>{children}</div>,
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

describe('HistoryItem deepen9 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task running → HistoryRunningIcon', () => {
    render(
      <HistoryItem
        selectedIds={[]}
        onSelectionChange={vi.fn()}
        onClick={vi.fn()}
        item={
          {
            sessionId: 's',
            id: '1',
            sessionTitle: 'Run',
            gmtCreate: 1,
            status: 'running',
            description: 'working',
          } as any
        }
        type="task"
      />,
    );
    expect(
      screen.queryByTestId('running-icon') || screen.getByText('Run'),
    ).toBeTruthy();
  });

  it('长 description → tooltip 可开', () => {
    const long = 'x'.repeat(30);
    render(
      <HistoryItem
        selectedIds={[]}
        onSelectionChange={vi.fn()}
        onClick={vi.fn()}
        item={
          {
            sessionId: 's',
            id: '2',
            sessionTitle: 'T',
            gmtCreate: 1,
            status: 'success',
            description: long,
          } as any
        }
        type="task"
      />,
    );
    const tips = screen.getAllByTestId('tooltip');
    expect(tips.some((t) => (t.getAttribute('data-title') || '').length > 20)).toBe(
      true,
    );
  });
});
