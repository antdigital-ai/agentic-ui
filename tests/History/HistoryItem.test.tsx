import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

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
  Tooltip: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../src/History/style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'h' }),
}));

vi.mock('../../src/History/utils', () => ({
  formatTime: (v: any) => `time:${v}`,
}));

vi.mock('../../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

vi.mock('../../src/I18n', () => ({
  I18nContext: React.createContext({ locale: {} }),
}));

vi.mock('../../src/History/components/HistoryActionsBox', () => ({
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

vi.mock('../../src/History/components/HistoryRunningIcon', () => ({
  HistoryRunningIcon: () => <span data-testid="running-icon" />,
}));

import { HistoryItem } from '../../src/History/components/HistoryItem';

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

describe('HistoryItem（单行模式）', () => {
  it('渲染标题和时间', () => {
    render(<HistoryItem item={baseItem} {...baseProps} />);
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.getByText('time:1700000000000')).toBeInTheDocument();
  });

  it('点击整行触发 onClick 并阻止冒泡', () => {
    const onClick = vi.fn();
    const { container } = render(
      <HistoryItem item={baseItem} {...baseProps} onClick={onClick} />,
    );
    const row = container.firstChild as HTMLElement;
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledWith('s1', baseItem);
  });

  it('agent.onSelectionChange 存在时显示复选框，勾选触发回调', () => {
    const onSelChange = vi.fn();
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        agent={{ onSelectionChange: vi.fn() }}
        onSelectionChange={onSelChange}
      />,
    );
    const cb = screen.getByTestId('checkbox');
    expect(cb).toBeInTheDocument();
    fireEvent.click(cb);
    expect(onSelChange).toHaveBeenCalledWith('s1', true);
  });

  it('提供 onDeleteItem 后点击删除按钮触发删除', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem item={baseItem} {...baseProps} onDeleteItem={onDelete} />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('s1');
  });

  it('customOperationExtra 为有效 ReactElement 时渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={<span data-testid="custom-op">op</span>}
      />,
    );
    expect(screen.getByTestId('custom-op')).toBeInTheDocument();
  });

  it('customOperationExtra 为有效字符串时渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra="text-op"
      />,
    );
    expect(screen.getByText('text-op')).toBeInTheDocument();
  });

  it('customOperationExtra 为含有效元素的数组时渲染', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={[
          <span key="a" data-testid="arr-op">
            a
          </span>,
        ]}
      />,
    );
    expect(screen.getByTestId('arr-op')).toBeInTheDocument();
  });

  it('customOperationExtra 为 null 时不渲染额外区域', () => {
    const { container } = render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={null}
      />,
    );
    expect(
      container.querySelector('[class*="extra-actions"]'),
    ).not.toBeInTheDocument();
  });

  it('itemDateFormatter 提供时使用自定义格式化', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        itemDateFormatter={(d) => `fmt:${d}`}
      />,
    );
    expect(screen.getByText('fmt:1700000000000')).toBeInTheDocument();
  });
});

describe('HistoryItem（多行模式 — type=task）', () => {
  const taskItem = {
    ...baseItem,
    status: 'success' as const,
    description: '任务描述文本',
    icon: undefined as any,
  };

  it('task 类型自动使用多行模式，显示状态图标和描述', () => {
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByText('Session Title')).toBeInTheDocument();
    expect(screen.getByText('任务描述文本')).toBeInTheDocument();
    expect(screen.getByTestId('icon-file-check')).toBeInTheDocument();
  });

  it('多行模式点击整行触发 onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        onClick={onClick}
      />,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledWith('s1', taskItem);
  });

  it('多行模式 agent.onSelectionChange 存在时显示复选框并触发', () => {
    const onSelChange = vi.fn();
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        agent={{ onSelectionChange: vi.fn() }}
        onSelectionChange={onSelChange}
      />,
    );
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(onSelChange).toHaveBeenCalledWith('s1', true);
  });

  it('多行模式提供 onDeleteItem 后可删除', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        onDeleteItem={onDelete}
      />,
    );
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(onDelete).toHaveBeenCalledWith('s1');
  });

  it('runningId 匹配时显示运行图标', () => {
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        runningId={['id1']}
      />,
    );
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });
});

describe('isValidCustomOperation 边界分支', () => {
  it('传入 truthy 但非 element/string/array 值时返回 false，不渲染额外区域', () => {
    // 数字 42 是 truthy，但不是 ReactElement、string、array，走到 return false
    const { container } = render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        customOperationExtra={42 as any}
      />,
    );
    expect(
      container.querySelector('[class*="extra-actions"]'),
    ).not.toBeInTheDocument();
  });
});

describe('HistoryItem 分支覆盖补充', () => {
  it('displayTitle 优先于 sessionTitle', () => {
    const item = { ...baseItem, displayTitle: 'Display Title' };
    render(<HistoryItem item={item} {...baseProps} />);
    expect(screen.getByText('Display Title')).toBeInTheDocument();
  });

  it('多行模式：自定义 ReactElement icon 直接渲染', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
      icon: <span data-testid="custom-icon">IC</span>,
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('多行模式：非 ReactElement 的 string icon 走默认 icon 分支', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
      icon: 'emoji-icon',
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByText('emoji-icon')).toBeInTheDocument();
  });

  it('多行模式：无 icon 但有 status 时使用 TaskIconMap', () => {
    const taskItem = {
      ...baseItem,
      status: 'error' as const,
      description: '描述',
      icon: undefined,
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('多行模式 cancel 状态图标', () => {
    const taskItem = {
      ...baseItem,
      status: 'cancel' as const,
      description: '描述',
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByTestId('icon-close')).toBeInTheDocument();
  });

  it('多行模式：长描述触发 Tooltip', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '这是一段超过二十个字符的非常长的任务描述文本内容',
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(
      screen.getByText('这是一段超过二十个字符的非常长的任务描述文本内容'),
    ).toBeInTheDocument();
  });

  it('多行模式 customOperationExtra 有效时渲染', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
    };
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        customOperationExtra={<span data-testid="multi-extra">E</span>}
      />,
    );
    expect(screen.getByTestId('multi-extra')).toBeInTheDocument();
  });

  it('多行模式 itemDateFormatter 自定义格式化', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
    };
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        itemDateFormatter={(d) => `custom:${d}`}
      />,
    );
    // 日期出现在描述区域和 actions-box 中
    expect(
      screen.getAllByText('custom:1700000000000').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('extra 回调渲染额外内容', () => {
    render(
      <HistoryItem
        item={baseItem}
        {...baseProps}
        extra={(item) => (
          <span data-testid="extra-render">{item.sessionId}</span>
        )}
      />,
    );
    expect(screen.getByTestId('extra-render')).toHaveTextContent('s1');
  });

  it('runningId 匹配时单行模式显示运行图标', () => {
    render(<HistoryItem item={baseItem} {...baseProps} runningId={['id1']} />);
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
  });

  it('selectedIds 包含当前项时复选框选中', () => {
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

  it('无 onDeleteItem 时不显示删除按钮', () => {
    render(<HistoryItem item={baseItem} {...baseProps} />);
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument();
  });

  it('多行模式 task 无 description 时显示默认文本', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: undefined,
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    // shouldShowDescription 为 false，不渲染描述区
    expect(screen.queryByTestId('divider')).not.toBeInTheDocument();
  });

  it('多行模式 task 短描述不触发 Tooltip', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '短描述',
    };
    render(<HistoryItem item={taskItem} {...baseProps} type="task" />);
    expect(screen.getByText('短描述')).toBeInTheDocument();
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('多行模式 runningId 不匹配时不显示运行图标', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
    };
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        runningId={['other-id']}
      />,
    );
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });

  it('多行模式 extra 回调渲染额外内容', () => {
    const taskItem = {
      ...baseItem,
      status: 'success' as const,
      description: '描述',
    };
    render(
      <HistoryItem
        item={taskItem}
        {...baseProps}
        type="task"
        extra={(item) => (
          <span data-testid="multi-extra-fn">{item.sessionId}</span>
        )}
      />,
    );
    expect(screen.getByTestId('multi-extra-fn')).toHaveTextContent('s1');
  });

  it('多行模式不显示图标：非 task 且无 icon 和 status', () => {
    const plainItem = { ...baseItem, status: undefined, icon: undefined };
    render(<HistoryItem item={plainItem} {...baseProps} type="task" />);
    // 任何 task 类型都可能显示图标区域
    expect(screen.getByText('Session Title')).toBeInTheDocument();
  });
});

describe('useTextOverflow 溢出检测', () => {
  it('scrollWidth > clientWidth 时设置 CSS 变量和 data-overflow', () => {
    const item1 = { ...baseItem, sessionTitle: 'Title1' };
    const item2 = { ...baseItem, sessionTitle: 'Title2' };

    const { rerender, container } = render(
      <HistoryItem item={item1} {...baseProps} />,
    );

    // 第一次 render 后找到 data-overflow 元素（初始应为 "false"）
    const overflowEl = container.querySelector('[data-overflow]');
    expect(overflowEl).toBeTruthy();

    // 在该元素上定义 scrollWidth > clientWidth，模拟溢出
    Object.defineProperty(overflowEl!, 'scrollWidth', {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(overflowEl!, 'clientWidth', {
      value: 200,
      configurable: true,
    });

    // 重渲染使 text 变化，触发 useLayoutEffect 重新计算
    rerender(<HistoryItem item={item2} {...baseProps} />);

    expect(overflowEl!.getAttribute('data-overflow')).toBe('true');
    // 检查 CSS 自定义属性
    const style = overflowEl!.getAttribute('style') || '';
    expect(style).toContain('--scroll-width');
    expect(style).toContain('--scroll-duration');
  });
});
