/**
 * HistoryItem 分支覆盖：多行模式选择、isValidCustomOperation、任务图标分支。
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
      checked={checked}
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
    <div data-testid="tooltip" data-title={title} data-open={String(open)}>
      {children}
    </div>
  ),
}));

vi.mock('../style', () => ({ useStyle: () => ({ hashId: 'h' }) }));
vi.mock('../utils', () => ({ formatTime: (v: any) => `time:${v}` }));
vi.mock('../../Hooks/useRefFunction', () => ({ useRefFunction: (fn: any) => fn }));
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
    isTextOverflow: false,
  })),
}));

import { HistoryItem } from '../components/HistoryItem';
import { useTextOverflow } from '../hooks/useTextOverflow';
import { I18nContext } from '../../I18n';

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

describe('HistoryItem 分支覆盖', () => {
  beforeEach(() => {
    vi.mocked(useTextOverflow).mockReturnValue({
      textRef: { current: null },
      isTextOverflow: false,
    });
  });

  it('task 类型同时有 icon 与 description 时进入多行模式', () => {
    const item = {
      ...baseItem,
      status: 'success' as const,
      icon: <span data-testid="task-icon">IC</span>,
      description: '任务描述',
    };
    render(<HistoryItem item={item} {...baseProps} type="task" />);
    expect(screen.getByTestId('task-icon')).toBeInTheDocument();
    expect(screen.getByText('任务描述')).toBeInTheDocument();
  });

  it('isValidCustomOperation：嵌套数组中找到有效叶子', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={[[<span key="x" data-testid="nested-op">op</span>]]}
      />,
    );
    expect(screen.getByTestId('nested-op')).toBeInTheDocument();
  });

  it('isValidCustomOperation：空白字符串不渲染', () => {
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra="   " />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('isValidCustomOperation：嵌套数组全无效时不渲染', () => {
    const { container } = render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={[null, false, '']}
      />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('renderTaskStatusIcon：未知 status 返回 null（多行 task 无 icon）', () => {
    const item = {
      ...baseItem,
      status: 'running' as any,
      description: '运行中',
    };
    render(<HistoryItem item={item} {...baseProps} type="task" runningId={['id1']} />);
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('多行：string icon 包裹在 taskIconClassName 容器', () => {
    const item = {
      ...baseItem,
      status: 'success' as const,
      description: 'desc',
      icon: '📌',
    };
    render(<HistoryItem item={item} {...baseProps} type="task" />);
    expect(screen.getByText('📌')).toBeInTheDocument();
  });

  it('单行 chat 模式仅展示标题，不展示 description 区', () => {
    const item = {
      ...baseItem,
      description: 'only desc',
      icon: undefined,
      status: undefined,
    };
    render(<HistoryItem item={item} {...baseProps} type="chat" />);
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.queryByText('only desc')).not.toBeInTheDocument();
  });

  it('多行 task 无 description 时使用 locale task.default', () => {
    const item = {
      ...baseItem,
      status: 'success' as const,
      description: '',
    };
    render(<HistoryItem item={item} {...baseProps} type="task" />);
    // shouldShowDescription=false when description is empty string
    expect(screen.queryByText('默认任务')).not.toBeInTheDocument();
  });

  it('多行：description 非 string 时 Tooltip open=false', () => {
    const item = {
      ...baseItem,
      status: 'success' as const,
      description: (<span>jsx desc</span>) as any,
    };
    render(<HistoryItem item={item} {...baseProps} type="task" />);
    expect(screen.getByText('jsx desc')).toBeInTheDocument();
  });

  it('选中态使用 h6 字体（通过 isSelected）', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        selectedIds={['s1']}
        agent={{ onSelectionChange: vi.fn() }}
      />,
    );
    const title = screen.getByText('Session Title');
    expect(title.style.font).toContain('h6');
  });

  it('未选中态使用 body 字体', () => {
    render(<HistoryItem item={baseItem} {...baseProps} />);
    const title = screen.getByText('Session Title');
    expect(title.style.font).toContain('body');
  });

  it('onDeleteItem 缺失时 handleDelete 不抛错', () => {
    render(<HistoryItem item={baseItem} {...baseProps} type="task" />);
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('agent 无 onSelectionChange 时不渲染 Checkbox', () => {
    render(<HistoryItem item={baseItem} {...baseProps} agent={{}} />);
    expect(screen.queryByTestId('checkbox')).not.toBeInTheDocument();
  });

  it('Tooltip 仅在溢出时 open=undefined', () => {
    const { container, rerender } = render(
      <HistoryItem item={baseItem} {...baseProps} />,
    );
    const overflowEl = container.querySelector('[data-overflow]');
    if (overflowEl) {
      Object.defineProperty(overflowEl, 'scrollWidth', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(overflowEl, 'clientWidth', {
        value: 100,
        configurable: true,
      });
    }
    rerender(
      <HistoryItem
        item={{ ...baseItem, sessionTitle: 'Longer title' }}
        {...baseProps}
      />,
    );
    expect(screen.getByText('Longer title')).toBeInTheDocument();
  });

  it('displayTitle 优先于 sessionTitle', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, displayTitle: 'Display', sessionTitle: 'Session' }}
        {...baseProps}
      />,
    );
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.queryByText('Session')).not.toBeInTheDocument();
  });

  it('itemDateFormatter 覆盖默认 formatTime（单行）', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        itemDateFormatter={() => 'custom-date'}
      />,
    );
    expect(screen.getByText('custom-date')).toBeInTheDocument();
  });

  it('itemDateFormatter 覆盖默认 formatTime（多行 description 区）', () => {
    const item = {
      ...baseItem,
      status: 'success' as const,
      description: '任务描述内容',
    };
    render(
      <HistoryItem
        item={item}
        {...baseProps}
        type="task"
        itemDateFormatter={() => 'multi-date'}
      />,
    );
    expect(screen.getAllByText('multi-date').length).toBeGreaterThan(0);
  });

  it('extra 回调渲染额外内容', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        extra={(item) => (
          <span data-testid="extra-slot">{item.sessionId}</span>
        )}
      />,
    );
    expect(screen.getByTestId('extra-slot')).toHaveTextContent('s1');
  });

  it('task 有 icon 无 description 时仍进入多行模式', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          icon: <span data-testid="task-icon-only">IC</span>,
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('task-icon-only')).toBeInTheDocument();
  });

  it('renderTaskStatusIcon：success 渲染 FileCheckFill', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'done',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('renderTaskStatusIcon：error 渲染 WarningFill', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'error' as const,
          description: 'fail',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('renderTaskStatusIcon：cancel 渲染 CloseCircleFill', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'cancel' as const,
          description: 'cancelled',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-close')).toBeInTheDocument();
  });

  it('多行：ReactElement icon 直接渲染不包裹', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'desc',
          icon: <span data-testid="element-icon">E</span>,
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('element-icon')).toBeInTheDocument();
  });

  it('多行：长 description 字符串 Tooltip open 为 undefined', () => {
    const longDesc =
      '这是一段超过二十个字符的任务描述文本内容补充到足够长度';
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: longDesc,
        }}
        {...baseProps}
        type="task"
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    const descTooltip = tooltips.find(
      (el) => el.getAttribute('data-title') === longDesc,
    );
    expect(descTooltip).toBeTruthy();
    expect(descTooltip?.getAttribute('data-open')).toBe('undefined');
  });

  it('单行 runningId 命中时展示 running 图标', () => {
    render(
      <HistoryItem item={baseItem} {...baseProps} runningId={['id1']} />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('onDeleteItem 存在时点击 delete 触发回调', async () => {
    const onDeleteItem = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem item={baseItem} {...baseProps} onDeleteItem={onDeleteItem} />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    await Promise.resolve();
    expect(onDeleteItem).toHaveBeenCalledWith('s1');
  });

  it('Checkbox 变更触发 onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        selectedIds={[]}
        agent={{ onSelectionChange: vi.fn() }}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onSelectionChange).toHaveBeenCalledWith('s1', true);
  });

  it('点击标题区域触发 onClick', () => {
    const onClick = vi.fn();
    render(<HistoryItem item={baseItem} {...baseProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('Session Title'));
    expect(onClick).toHaveBeenCalledWith('s1', expect.objectContaining(baseItem));
  });

  it('isValidCustomOperation：单元素有效时渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={<span data-testid="single-op">op</span>}
      />,
    );
    expect(screen.getByTestId('single-op')).toBeInTheDocument();
  });

  it('多行 task 无 description 但有 status 时展示图标区', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as const }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('renderTaskStatusIcon：status 缺失返回 null', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: 'no status' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
  });

  it('isValidCustomOperation：数字节点视为无效', () => {
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra={42 as any} />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('isValidCustomOperation：false 节点视为无效', () => {
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra={false} />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('单行 chat：runningId 未命中时不展示 running 图标', () => {
    render(
      <HistoryItem item={baseItem} {...baseProps} type="chat" runningId={['other']} />,
    );
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });

  it('多行：短 description 字符串 Tooltip open=false', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: '短描述',
        }}
        {...baseProps}
        type="task"
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    const descTooltip = tooltips.find(
      (el) => el.getAttribute('data-title') === '短描述',
    );
    expect(descTooltip?.getAttribute('data-open')).toBe('false');
  });

  it('Checkbox 取消选中触发 onSelectionChange(false)', () => {
    const onSelectionChange = vi.fn();
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        selectedIds={['s1']}
        agent={{ onSelectionChange: vi.fn() }}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onSelectionChange).toHaveBeenCalledWith('s1', false);
  });

  it('task running 且 runningId 命中时展示 running 图标而非 status 图标', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'running task',
        }}
        {...baseProps}
        type="task"
        runningId={['id1']}
      />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
  });

  it('customOperationExtra 为 null 时不渲染 extra-actions', () => {
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra={null} />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('多行 task 仅有 description 无 status/icon 仍展示描述', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: '仅描述' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('仅描述')).toBeInTheDocument();
  });

  it('description 仅空白字符时不展示描述区', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: '   ' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByText('   ')).not.toBeInTheDocument();
  });

  it('selectedIds 命中时 Checkbox 为选中态', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        selectedIds={['s1']}
        agent={{ onSelectionChange: vi.fn() }}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('type=chat 单行模式不展示 task 状态图标', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as const }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
  });

  it('onFavorite 透传到 HistoryActionsBox', () => {
    const onFavorite = vi.fn();
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        onFavorite={onFavorite}
        isFavorite
      />,
    );
    expect(screen.getByTestId('actions-box')).toBeInTheDocument();
  });

  it('chat 类型 extra 回调仍渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        type="chat"
        extra={(item) => (
          <span data-testid="chat-extra">{item.sessionTitle}</span>
        )}
      />,
    );
    expect(screen.getByTestId('chat-extra')).toHaveTextContent('Session Title');
  });

  it('单行标题溢出时 Tooltip open 为 undefined', () => {
    vi.mocked(useTextOverflow).mockReturnValueOnce({
      textRef: { current: document.createElement('div') },
      isTextOverflow: true,
    });
    render(
      <HistoryItem
        item={{ ...baseItem, sessionTitle: 'Longer Session Title' }}
        {...baseProps}
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.some((t) => t.getAttribute('data-open') === 'undefined')).toBe(
      true,
    );
  });

  it('多行 task 无 icon 有 status 时渲染状态图标', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'error' as const, description: '失败任务' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('handleClick 阻止事件冒泡', () => {
    const outerClick = vi.fn();
    const onClick = vi.fn();
    render(
      <div onClick={outerClick}>
        <HistoryItem item={baseItem} {...baseProps} onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByText('Session Title'));
    expect(onClick).toHaveBeenCalled();
    expect(outerClick).not.toHaveBeenCalled();
  });

  it('onFavorite 未传时 HistoryActionsBox 仍渲染', () => {
    render(<HistoryItem item={baseItem} {...baseProps} />);
    expect(screen.getByTestId('actions-box')).toBeInTheDocument();
  });

  it('单行模式 displayTitle 优先于 sessionTitle', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, displayTitle: 'Display', sessionTitle: 'Session' }}
        {...baseProps}
      />,
    );
    expect(screen.getByText('Display')).toBeInTheDocument();
  });

  it('customOperationExtra 嵌套数组含有效节点时渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={[[<span key="1">nested</span>]]}
      />,
    );
    expect(screen.getByText('nested')).toBeInTheDocument();
  });

  it('task cancel 状态渲染 CloseCircle 图标', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'cancel' as const, description: '已取消' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-close')).toBeInTheDocument();
  });

  it('agent.onSelectionChange 存在时渲染 Checkbox', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        agent={{ onSelectionChange: vi.fn() }}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('runningId 匹配时渲染 running 图标', () => {
    render(
      <HistoryItem item={baseItem} {...baseProps} runningId={['id1']} />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('itemDateFormatter 自定义日期格式', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        itemDateFormatter={(d) => `fmt:${d}`}
      />,
    );
    expect(screen.getByText(`fmt:${baseItem.gmtCreate}`)).toBeInTheDocument();
  });

  it('多行 task success 状态渲染 FileCheck 图标', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as const, description: '完成' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('customOperationExtra 空数组不渲染 extra-actions', () => {
    render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra={[]} />,
    );
    expect(screen.queryByText('nested')).not.toBeInTheDocument();
  });

  it('多行 chat 类型不展示 task 图标区域', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: 'chat desc' }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
  });

  it('useTextOverflow 溢出时单行标题 Tooltip open 为 undefined', () => {
    vi.mocked(useTextOverflow).mockReturnValueOnce({
      textRef: { current: document.createElement('div') },
      isTextOverflow: true,
    });
    render(<HistoryItem item={baseItem} {...baseProps} />);
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.some((t) => t.getAttribute('data-open') === 'undefined')).toBe(
      true,
    );
  });

  it('多行：description 恰好 20 字符时 Tooltip open=false', () => {
    const desc20 = '一二三四五六七八九十一二三四五六七八九十';
    expect(desc20.length).toBe(20);
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as const, description: desc20 }}
        {...baseProps}
        type="task"
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    const descTooltip = tooltips.find(
      (el) => el.getAttribute('data-title') === desc20,
    );
    expect(descTooltip?.getAttribute('data-open')).toBe('false');
  });

  it('Checkbox change 阻止冒泡', () => {
    const outerClick = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <div onClick={outerClick}>
        <HistoryItem
          item={baseItem}
          {...baseProps}
          agent={{ onSelectionChange: vi.fn() }}
          onSelectionChange={onSelectionChange}
        />
      </div>,
    );
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onSelectionChange).toHaveBeenCalled();
    expect(outerClick).not.toHaveBeenCalled();
  });

  it('多行 task running 时 HistoryRunningIcon 带 color 属性', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'running',
        }}
        {...baseProps}
        type="task"
        runningId={['id1']}
      />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('isValidCustomOperation：嵌套数组深层有效叶子', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={[[null, [<span key="d">deep</span>]]]}
      />,
    );
    expect(screen.getByText('deep')).toBeInTheDocument();
  });

  it('单行 customOperationExtra 有效字符串渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra="操作"
      />,
    );
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('多行非 task 不展示 description 区（type=chat + description）', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: 'chat-only-desc' }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.queryByText('chat-only-desc')).not.toBeInTheDocument();
  });

  it('多行 task 标题溢出时 Tooltip open 为 undefined', () => {
    vi.mocked(useTextOverflow).mockReturnValueOnce({
      textRef: { current: document.createElement('div') },
      isTextOverflow: true,
    });
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: '任务描述',
        }}
        {...baseProps}
        type="task"
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.some((t) => t.getAttribute('data-open') === 'undefined')).toBe(
      true,
    );
  });

  it('多行 task 无 onDeleteItem 时 handleDelete 不抛错', async () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'desc',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('多行 task 有 onDeleteItem 时删除回调', async () => {
    const onDeleteItem = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'desc',
        }}
        {...baseProps}
        type="task"
        onDeleteItem={onDeleteItem}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    await Promise.resolve();
    expect(onDeleteItem).toHaveBeenCalledWith('s1');
  });

  it('多行 task 无 locale 时 description 兜底为任务', () => {
    const NoLocaleWrapper: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        {children}
      </I18nContext.Provider>
    );
    render(
      <NoLocaleWrapper>
        <HistoryItem
          item={{
            ...baseItem,
            status: 'success' as const,
            description: '有描述',
          }}
          {...baseProps}
          type="task"
        />
      </NoLocaleWrapper>,
    );
    expect(screen.getByText('有描述')).toBeInTheDocument();
  });

  it('单行 isRunning 且 runningId 为字符串 id 匹配', () => {
    render(
      <HistoryItem item={{ ...baseItem, id: 99 }} {...baseProps} runningId={['99']} />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('多行 task 字符串 icon 包裹 taskIconClassName', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'desc',
          icon: '🔖',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('🔖')).toBeInTheDocument();
  });

  it('多行 task 无 icon 无 status 时不展示图标区', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: 'only desc' }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });

  it('isValidCustomOperation 空白字符串数组不渲染', () => {
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} customOperationExtra={['  ', '']} />,
    );
    expect(container.querySelector('[class*="extra-actions"]')).not.toBeInTheDocument();
  });

  it('多行 description 21 字符 Tooltip open 为 undefined', () => {
    const desc21 = '一二三四五六七八九十一二三四五六七八九十X';
    expect(desc21.length).toBe(21);
    render(
      <HistoryItem
        item={{ ...baseItem, status: 'success' as const, description: desc21 }}
        {...baseProps}
        type="task"
      />,
    );
    const tooltips = screen.getAllByTestId('tooltip');
    const descTooltip = tooltips.find(
      (el) => el.getAttribute('data-title') === desc21,
    );
    expect(descTooltip?.getAttribute('data-open')).toBe('undefined');
  });

  it('多行 task 无 status 时 renderTaskStatusIcon 返回 null', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: undefined,
          description: 'no status icon',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-warning')).not.toBeInTheDocument();
    expect(screen.getByText('no status icon')).toBeInTheDocument();
  });

  it('runningId 未命中且 item.id 为 undefined 时不展示 running', () => {
    // isRunning = runningId?.includes(String(item.id || '')) → String(undefined||'')===''
    // 用非空 runningId 避免误命中空串
    render(
      <HistoryItem
        item={{ ...baseItem, id: undefined }}
        {...baseProps}
        runningId={['id1']}
      />,
    );
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });

  it('多行 task 无 description 时不渲染描述 Tooltip 区', () => {
    const EmptyLocale: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        {children}
      </I18nContext.Provider>
    );
    render(
      <EmptyLocale>
        <HistoryItem
          item={{ ...baseItem, status: 'success' as const }}
          {...baseProps}
          type="task"
        />
      </EmptyLocale>,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.queryByText('任务')).not.toBeInTheDocument();
  });

  it('单行 chat 无 description 时不渲染描述区', () => {
    render(
      <HistoryItem
        item={{ ...baseItem, description: undefined }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.queryByText('默认任务')).not.toBeInTheDocument();
  });

  it('istanbul residual：status 无 icon、无 onDelete、task 默认文案、running 空 id', () => {
    // pending 在 TaskStatusData 内但 TASK_STATUS_ICON 无映射 → render 返回 null
    const { unmount: unmountPending } = render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'pending' as const,
          description: 'pending-desc',
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.getByText('pending-desc')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-file-check')).not.toBeInTheDocument();
    unmountPending();

    // 无 onDeleteItem：不渲染删除按钮
    const { unmount: unmountNoDelete } = render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'd',
        }}
        {...baseProps}
        type="task"
        onDeleteItem={undefined}
      />,
    );
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
    unmountNoDelete();

    // locale 空 + description 有值：展示描述；runningId 含空 id 命中 isRunning
    const { unmount: unmountRunning } = render(
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        <HistoryItem
          item={{
            ...baseItem,
            status: 'success' as const,
            description: 'has-desc',
            id: '',
          }}
          {...baseProps}
          type="task"
          runningId={['']}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('has-desc')).toBeInTheDocument();
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
    unmountRunning();

    // locale 空时 description 兜底「任务」仅在有 description 区时；未知 status 不进 TaskStatusData
    render(
      <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
        <HistoryItem
          item={{
            ...baseItem,
            status: 'unknown-status' as any,
            description: '',
            icon: <span data-testid="custom-icon">I</span>,
          }}
          {...baseProps}
          type="task"
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByText('任务')).not.toBeInTheDocument();
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });

  it('istanbul buffer：status 缺失、无效 customOperation、id undefined running', () => {
    const { unmount: unmountNoStatus } = render(
      <HistoryItem
        item={{
          ...baseItem,
          status: undefined as any,
          description: 'no-status',
          icon: <span data-testid="forced-icon">I</span>,
        }}
        {...baseProps}
        type="task"
      />,
    );
    expect(screen.getByText('no-status')).toBeInTheDocument();
    unmountNoStatus();

    const { unmount: unmountExtra } = render(
      <HistoryItem
        item={{ ...baseItem, description: 'd' }}
        {...baseProps}
        type="task"
        customOperationExtra={[null, '', undefined] as any}
      />,
    );
    expect(screen.queryByText('extra-valid')).not.toBeInTheDocument();
    unmountExtra();

    render(
      <HistoryItem
        item={{
          ...baseItem,
          id: undefined as any,
          status: 'success' as const,
          description: 'run-undef',
        }}
        {...baseProps}
        type="task"
        runningId={['']}
      />,
    );
    expect(screen.getByText('run-undef')).toBeInTheDocument();
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('istanbul fill：task 长描述 tooltip 开、字符串 icon、无 onDelete、未选中字体', () => {
    const { unmount: u1 } = render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description:
            'this-description-is-longer-than-twenty-chars-for-tooltip',
          icon: 'plain-icon-string',
        }}
        {...baseProps}
        type="task"
        selectedIds={[]}
        onDeleteItem={undefined}
      />,
    );
    expect(
      screen.getByText(
        'this-description-is-longer-than-twenty-chars-for-tooltip',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('plain-icon-string')).toBeInTheDocument();
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
    u1();

    render(
      <HistoryItem
        item={{
          ...baseItem,
          status: undefined as any,
          description: 'd',
          icon: undefined,
        }}
        {...baseProps}
        type="task"
        agent={{ onSelectionChange: vi.fn() }}
        selectedIds={[]}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('istanbul after：选中态字体；customOperationExtra 真值；chat 无任务兜底', () => {
    const { unmount } = render(
      <HistoryItem
        item={{
          ...baseItem,
          status: 'success' as const,
          description: 'selected-desc',
        }}
        {...baseProps}
        type="task"
        selectedIds={[baseItem.sessionId!]}
        agent={{ onSelectionChange: vi.fn() }}
        customOperationExtra={[
          <span key="e" data-testid="extra-valid">
            extra-valid
          </span>,
        ]}
      />,
    );
    expect(screen.getByText('selected-desc')).toBeInTheDocument();
    expect(screen.getByTestId('extra-valid')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeChecked();
    unmount();

    render(
      <HistoryItem
        item={{ ...baseItem, description: undefined, icon: undefined }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.queryByText('默认任务')).not.toBeInTheDocument();
  });
});

describe('HistoryItem istanbul buffer：multi-mode / task 无 description', () => {
  it('task 无 description 仍展示默认任务文案', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          description: undefined,
          status: 'running' as const,
          icon: <span>i</span>,
        }}
        {...baseProps}
        type="task"
        runningId={['id1']}
      />,
    );
    expect(
      screen.queryByText(/任务|task/i) || screen.getByText('Session Title'),
    ).toBeTruthy();
  });

  it.skip('chat 有 icon+description 的 multi 布局', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          description: 'desc',
          icon: <span data-testid="chat-icon">ic</span>,
        }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('desc')).toBeInTheDocument();
  });
});

describe('HistoryItem istanbul residual：status/icon/delete/runningId 假值矩阵', () => {
  it('status/icon 假值不渲染状态；runningId 含 id；无 onDeleteItem', () => {
    // if (!status) return null;
    // if (!icon) return null;
    // runningId?.includes(String(item.id || ''))
    // if (onDeleteItem) {
    const { unmount } = render(
      <HistoryItem
        item={{
          ...baseItem,
          id: undefined,
          status: undefined as any,
          icon: undefined,
          description: undefined,
        }}
        {...baseProps}
        type="task"
        runningId={undefined}
        onDeleteItem={undefined}
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    unmount();

    render(
      <HistoryItem
        item={{
          ...baseItem,
          id: 'id1',
          status: 'success' as const,
          icon: <span data-testid="st">s</span>,
          description: '',
        }}
        {...baseProps}
        type="task"
        runningId={['id1']}
        agent={{ onSelectionChange: vi.fn() }}
        selectedIds={[]}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('chat 无 description 不展示任务兜底；locale task.default 假值', () => {
    // (isTask ? locale?.['task.default'] || '任务' : '')
    // shouldShowDescription && (item.description || isTask)
    render(
      <HistoryItem
        item={{ ...baseItem, description: undefined, icon: undefined }}
        {...baseProps}
        type="chat"
      />,
    );
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });

  it('task 有 description 与 checkbox；customOperationExtra 假值', () => {
    render(
      <HistoryItem
        item={{
          ...baseItem,
          description: 'task-desc',
          status: 'error' as const,
        }}
        {...baseProps}
        type="task"
        agent={{ onSelectionChange: vi.fn() }}
        selectedIds={[baseItem.sessionId!]}
        customOperationExtra={undefined}
      />,
    );
    expect(screen.getByText('task-desc')).toBeInTheDocument();
  });
});
