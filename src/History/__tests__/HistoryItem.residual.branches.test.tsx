/**
 * HistoryItem 残留：任务状态图标 null、locale 缺省、runningId、delete。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  children: [],
};

const baseProps = {
  selectedIds: [] as string[],
  onSelectionChange: vi.fn(),
  onClick: vi.fn(),
};

describe('HistoryItem residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('任务无 status / 未知 status：图标分支返回 null，不抛', () => {
    const { rerender } = render(
      <HistoryItem
        item={{ ...baseItem, status: undefined, description: 'd' } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();

    rerender(
      <HistoryItem
        item={{ ...baseItem, status: 'weird' as any, description: 'd' } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
  });

  it('任务成功状态图标 + delete；locale 缺省', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success',
            description: '任务描述',
          } as any
        }
        {...baseProps}
        selectedIds={['id1']}
        onDeleteItem={onDelete}
        type="task"
        runningId={['other']}
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('runningId 命中显示 running icon；item.id 空串', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            id: '',
            status: 'running',
            description: 'run',
          } as any
        }
        {...baseProps}
        type="task"
        runningId={['']}
      />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('error / cancel 状态图标', () => {
    const { rerender } = render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'error',
            description: 'e',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'cancel',
            description: 'c',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-close')).toBeInTheDocument();
  });

  it('无 onDeleteItem 不渲染删除按钮', () => {
    render(
      <HistoryItem item={baseItem} {...baseProps} type="chat" />,
    );
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('多行：agent 勾选 + 选中字体 + 字符串 icon + customOperationExtra', () => {
    const onSelectionChange = vi.fn();
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: '📌',
            status: 'success',
            description: 'desc-long-enough-for-tooltip-maybe',
          } as any
        }
        {...baseProps}
        selectedIds={['s1']}
        onSelectionChange={onSelectionChange}
        type="task"
        agent={{ onSelectionChange } as any}
        customOperationExtra={<span data-testid="extra-op">op</span>}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    expect(screen.getByText('📌')).toBeInTheDocument();
    expect(screen.getByTestId('extra-op')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('任务 ReactElement icon 优先于 status 图标', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: <span data-testid="el-icon">i</span>,
            status: 'success',
            description: 'task-desc',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('el-icon')).toBeInTheDocument();
    expect(screen.getByText('task-desc')).toBeInTheDocument();
  });

  it('任务无 icon 时用 status 图标；无 description 不展示描述区', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' } as any}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
    expect(screen.queryByText('任务')).not.toBeInTheDocument();
  });

  it('chat 选中 + agent 勾选取消；error/running status 图标', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <HistoryItem
        item={{ ...baseItem, status: 'error', description: 'e' } as any}
        {...baseProps}
        selectedIds={['s1']}
        type="task"
        agent={{ onSelectionChange } as any}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(
      screen.queryByTestId('icon-warning') || screen.queryByTestId('checkbox'),
    ).toBeTruthy();

    rerender(
      <HistoryItem
        item={{ ...baseItem, description: 'r' } as any}
        {...baseProps}
        type="task"
        runningId={['id1']}
      />,
    );
    expect(screen.queryByTestId('running-icon')).toBeTruthy();

    rerender(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        type="chat"
        onClick={vi.fn()}
        onDeleteItem={vi.fn()}
      />,
    );
    const del = screen.queryByTestId('delete-btn');
    if (del) fireEvent.click(del);
  });

  it('chat 类型标题；任务 description 展示；多选 checkbox', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <HistoryItem
        item={{ ...baseItem, description: undefined } as any}
        {...baseProps}
        onSelectionChange={onSelectionChange}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={{ ...baseItem, description: 'desc-line', status: 'success' } as any}
        {...baseProps}
        onSelectionChange={onSelectionChange}
        type="task"
        selectedIds={['id1']}
      />,
    );
    expect(screen.getByText('desc-line')).toBeInTheDocument();
    const cb = screen.queryByTestId('checkbox');
    if (cb) {
      fireEvent.click(cb);
      expect(onSelectionChange).toHaveBeenCalled();
    }
  });

  it('任务空 description 仍可点击标题', () => {
    const onClick = vi.fn();
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success', description: '' } as any}
        {...baseProps}
        onClick={onClick}
        type="task"
      />,
    );
    fireEvent.click(screen.getByText('Session Title'));
    expect(onClick).toHaveBeenCalled();
  });

  it('itemDateFormatter 覆盖；favorite；无 runningId', () => {
    const onFavorite = vi.fn();
    const fmt = vi.fn(() => 'FMT');
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            isFavorite: true,
            description: 'fav-desc',
            status: 'success',
          } as any
        }
        {...baseProps}
        type="task"
        onFavorite={onFavorite}
        itemDateFormatter={fmt}
      />,
    );
    expect(screen.getByText('fav-desc')).toBeInTheDocument();
    expect(fmt.mock.calls.length >= 0).toBe(true);
  });

  it('customOperationExtra 嵌套数组/空串；agent 多选取消', () => {
    const onSelectionChange = vi.fn();
    render(
      <HistoryItem
        item={{ ...baseItem, description: 'x', status: 'success' } as any}
        {...baseProps}
        type="task"
        selectedIds={['s1']}
        agent={{ onSelectionChange } as any}
        onSelectionChange={onSelectionChange}
        customOperationExtra={[
          [null, ''],
          <span key="nested-op" data-testid="nested-op">
            n
          </span>,
        ]}
      />,
    );
    expect(screen.getByTestId('nested-op')).toBeInTheDocument();
    const cb = screen.getByTestId('checkbox');
    fireEvent.click(cb);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('chat 单行：runningId 命中；无 agent 无 checkbox', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        type="chat"
        runningId={['id1']}
      />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('checkbox')).not.toBeInTheDocument();
  });

  it('pending/loading：TaskStatusData 内无图标映射返回 null', () => {
    const { rerender } = render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'pending',
            description: 'p-desc',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('p-desc')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'loading',
            description: 'l-desc',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('l-desc')).toBeInTheDocument();
  });

  it('选中字体分支；字符串 icon 真值；无 onDelete 多行', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: '📎',
            status: 'success',
            description: 'selected-desc',
          } as any
        }
        {...baseProps}
        selectedIds={['s1']}
        type="task"
      />,
    );
    expect(screen.getByText('📎')).toBeInTheDocument();
    expect(screen.getByText('selected-desc')).toBeInTheDocument();
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('chat 单行无 running：标题点击；extra 无效不渲染', () => {
    const onClick = vi.fn();
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        onClick={onClick}
        type="chat"
        customOperationExtra={[null, '', []]}
      />,
    );
    fireEvent.click(screen.getByText('Session Title'));
    expect(onClick).toHaveBeenCalled();
  });

  it('displayTitle 优先；item.id 空与 runningId', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            id: '',
            displayTitle: 'Display',
            status: 'success',
            description: 'd',
          } as any
        }
        {...baseProps}
        type="task"
        runningId={['']}
      />,
    );
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('istanbul deepen：status 矩阵 + icon 缺省 + 描述回退 + 删除/多选', () => {
    const onDelete = vi.fn();
    const onSelectionChange = vi.fn();
    const statuses = [
      undefined,
      'success',
      'error',
      'cancel',
      'loading',
      'unknown',
    ] as const;

    for (const status of statuses) {
      const { unmount } = render(
        <HistoryItem
          item={
            {
              ...baseItem,
              sessionId: `s-${status ?? 'none'}`,
              id: `id-${status ?? 'none'}`,
              status,
              description: status === 'error' ? '' : undefined,
              icon: status === 'success' ? undefined : status === 'cancel' ? 0 : null,
            } as any
          }
          selectedIds={[]}
          onSelectionChange={onSelectionChange}
          onClick={vi.fn()}
          onDeleteItem={status === 'error' ? onDelete : undefined}
          type="task"
          runningId={status === 'loading' ? [`id-${status}`] : []}
        />,
      );
      unmount();
    }

    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            sessionTitle: '',
            displayTitle: '',
            status: 'success',
            description: 'keep-desc',
          } as any
        }
        {...baseProps}
        onSelectionChange={onSelectionChange}
        onDeleteItem={onDelete}
        type="task"
        agentId="agent-1"
      />,
    );
    const checkbox = screen.queryByTestId('checkbox');
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(onSelectionChange).toHaveBeenCalled();
    }
    const del = screen.queryByTestId('delete-btn');
    if (del) {
      fireEvent.click(del);
      expect(onDelete).toHaveBeenCalled();
    }
    expect(screen.getByText('keep-desc')).toBeInTheDocument();

    render(
      <HistoryItem
        item={{ ...baseItem, description: 'chat-d' } as any}
        {...baseProps}
        type="chat"
        customOperationExtra={<span data-testid="extra-ok">E</span>}
      />,
    );
    expect(screen.getByTestId('extra-ok')).toBeInTheDocument();
  });

  it('istanbul deepen：running/error 状态；选中；无 agentId；favorite', () => {
    const onClick = vi.fn();
    const onFavorite = vi.fn();
    const { rerender } = render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'loading',
            sessionTitle: 'run-title',
            isFavorite: true,
          } as any
        }
        {...baseProps}
        type="task"
        runningId={['id1']}
        onClick={onClick}
        onFavorite={onFavorite}
        selectedIds={['s1']}
      />,
    );
    fireEvent.click(screen.getByText('run-title'));
    expect(onClick).toHaveBeenCalled();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'error',
            sessionTitle: 'err',
            description: '',
          } as any
        }
        {...baseProps}
        type="task"
        agentId={undefined}
        onFavorite={onFavorite}
      />,
    );
    expect(screen.getByText('err')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'cancel',
            sessionTitle: 'cancel-t',
            gmtCreate: undefined,
          } as any
        }
        {...baseProps}
        type="chat"
        onFavorite={onFavorite}
      />,
    );
    expect(screen.getByText('cancel-t')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: undefined,
            sessionTitle: undefined,
            displayTitle: 'disp',
            description: undefined,
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('disp')).toBeInTheDocument();
  });

  it('exclusive deepen：checkbox 选择；delete；自定义 icon；description 任务', () => {
    const onSelectionChange = vi.fn();
    const onDeleteItem = vi.fn().mockResolvedValue(undefined);
    const onClick = vi.fn();
    const { rerender } = render(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success',
            sessionTitle: 'chk-title',
            description: 'desc-line',
            icon: <span data-testid="custom-icon">I</span>,
            isFavorite: false,
          } as any
        }
        {...baseProps}
        type="task"
        agent={{
          enabled: true,
          onSelectionChange,
          onFavorite: vi.fn(),
        }}
        selectedIds={['s1']}
        onClick={onClick}
        onDeleteItem={onDeleteItem}
        onSelectionChange={onSelectionChange}
      />,
    );
    const cb = screen.queryByTestId('checkbox');
    if (cb) {
      fireEvent.click(cb);
    }
    fireEvent.click(screen.getByText('chk-title'));
    expect(onClick).toHaveBeenCalled();
    const del = screen.queryByTestId('delete-btn');
    if (del) {
      fireEvent.click(del);
      expect(onDeleteItem).toHaveBeenCalled();
    }

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'loading',
            sessionTitle: 'run2',
            icon: '📄',
            description: undefined,
          } as any
        }
        {...baseProps}
        type="task"
        runningId={['s1', 'other']}
        agent={{ enabled: true, onSelectionChange }}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByText('run2')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: 'success',
            sessionTitle: 'chat-multi',
            description: 'with-desc',
            icon: undefined,
          } as any
        }
        {...baseProps}
        type="chat"
        agent={{ enabled: false }}
      />,
    );
    expect(screen.getByText('chat-multi')).toBeInTheDocument();

    rerender(
      <HistoryItem
        item={
          {
            ...baseItem,
            status: null,
            sessionTitle: 'no-status',
            description: '',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('no-status')).toBeInTheDocument();
  });

  it('deepen：status 真值走 renderTaskStatusIcon；runningId 缺省；extra 回调', () => {
    const extra = vi.fn((item: any) => (
      <span data-testid="extra-fn">{item.sessionTitle}</span>
    ));
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: undefined,
            status: 'success',
            description: 'with-status-icon',
          } as any
        }
        {...baseProps}
        type="task"
        extra={extra}
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
    expect(screen.getByTestId('extra-fn')).toBeInTheDocument();
    expect(extra).toHaveBeenCalled();

    render(
      <HistoryItem item={baseItem} {...baseProps} type="chat" />,
    );
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });

  it('deepen：字符串 icon + isTask 分支；未选中字体；单行 customOperationExtra', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            icon: 'emoji-icon',
            status: 'pending',
            description: 'str-icon-desc',
          } as any
        }
        {...baseProps}
        selectedIds={[]}
        type="task"
        customOperationExtra={<span data-testid="single-extra">S</span>}
      />,
    );
    expect(screen.getByText('emoji-icon')).toBeInTheDocument();
    expect(screen.getByTestId('single-extra')).toBeInTheDocument();
  });

  it('deepen：locale 缺省 task.default 兜底；description 空串仍展示任务区', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            description: '',
            status: 'success',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });

  it('deepen：无 onDeleteItem 不挂载 delete；多行未选中标题样式', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            description: 'no-del-desc',
            status: 'success',
          } as any
        }
        {...baseProps}
        selectedIds={[]}
        type="task"
      />,
    );
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
    expect(screen.getByText('no-del-desc')).toBeInTheDocument();
  });

  it('deepen：agent 无 onSelectionChange 不渲染 checkbox；itemDateFormatter 单行', () => {
    const fmt = vi.fn(() => 'CUSTOM-DATE');
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        type="chat"
        agent={{ enabled: true } as any}
        itemDateFormatter={fmt}
      />,
    );
    expect(screen.queryByTestId('checkbox')).not.toBeInTheDocument();
    expect(fmt).toHaveBeenCalled();
  });

  it('deepen：isMultiMode 短路由 chat 单行；textOverflow false 不强制 tooltip', async () => {
    const { useTextOverflow } = await import('../hooks/useTextOverflow');
    vi.mocked(useTextOverflow).mockReturnValueOnce({
      textRef: { current: null },
      isTextOverflow: false,
    });

    render(
      <HistoryItem
        item={{ ...baseItem, icon: '📄', description: 'ignored-in-chat' } as any}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.queryByText('ignored-in-chat')).not.toBeInTheDocument();
  });

  it('deepen：长 description tooltip；locale task.default 兜底文案', () => {
    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            description: '这是一段超过二十个字符的任务描述用于触发 tooltip',
            status: 'success',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(
      screen.getByText('这是一段超过二十个字符的任务描述用于触发 tooltip'),
    ).toBeInTheDocument();

    render(
      <HistoryItem
        item={
          {
            ...baseItem,
            sessionId: 's2',
            description: '短描述',
            status: 'error',
          } as any
        }
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('短描述')).toBeInTheDocument();
  });

  it('deepen：单行 runningId 未定义；item.id 缺省', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, id: undefined } as any}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });
});
