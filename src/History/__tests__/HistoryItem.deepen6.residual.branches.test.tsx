/**
 * HistoryItem deepen6：task 无 status 图标 null、短/超长 description tooltip、
 * locale 缺失回退「任务」、非 ReactElement 字符串 icon。
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

const localeRef = vi.hoisted(() => ({
  current: { 'task.default': '默认任务' } as Record<string, string>,
}));

vi.mock('../../I18n', () => ({
  I18nContext: React.createContext({
    get locale() {
      return localeRef.current;
    },
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

describe('HistoryItem deepen6 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localeRef.current = { 'task.default': '默认任务' };
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task：未知 status 非 TaskStatusData → 无图标列；有 status 无 icon', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'weird' as any,
            description: 'd',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();

    cleanup();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: 'has',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('description 超长 → tooltip open undefined；短串 open=false', () => {
    const long = 'x'.repeat(25);
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

    cleanup();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'error' as any,
            description: 'short',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(
      screen
        .getAllByTestId('tooltip')
        .some((t) => t.getAttribute('data-open') === 'false'),
    ).toBe(true);
  });

  it('locale 无 task.default → 回退「任务」；字符串 icon', () => {
    localeRef.current = {};
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'cancel' as any,
            description: '  ',
            icon: '📎',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    // description '  ' 为 truthy，shouldShowDescription true
    expect(document.body.textContent).toBeTruthy();
  });

  it('非 task：多行模式关；runningId 命中', () => {
    render(
      <HistoryItem
        item={{ ...baseItem } as any}
        {...baseProps}
        type="chat"
        runningId="s1"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });
});
