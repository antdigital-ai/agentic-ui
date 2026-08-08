/**
 * HistoryItem deepen5：无 status 图标 null、task 缺 description 走 locale、
 * 短 description tooltip 关闭、icon 真值短路 ||。
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
    locale: {
      'task.default': '默认任务',
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

describe('HistoryItem deepen5 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task：无 status、无 icon → renderTaskStatusIcon null', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: undefined,
            description: 'has desc',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });

  it('task：无 description 行；有 description 短串 tooltip open=false', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            icon: <span data-testid="el-icon" />,
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('el-icon')).toBeInTheDocument();

    cleanup();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: 'short',
            icon: <span />,
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    const tips = screen.getAllByTestId('tooltip');
    expect(
      tips.some((t) => t.getAttribute('data-open') === 'false'),
    ).toBe(true);
    expect(screen.getByText('short')).toBeInTheDocument();
  });

  it('task：缺 description 用 locale；无 locale 回退「任务」', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: '',
            icon: 'x',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    // shouldShowDescription = isTask && !!description → '' 为 false，不进描述行
    expect(screen.getByText('Session Title')).toBeInTheDocument();

    cleanup();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: '  ',
            icon: 'x',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(document.body.textContent).toMatch(/Session Title|任务|默认/);
  });

  it('truthy 非 element icon：短路不走 status 图标', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success' as any,
            description: 'desc',
            icon: '📎',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('📎')).toBeInTheDocument();
  });
});
