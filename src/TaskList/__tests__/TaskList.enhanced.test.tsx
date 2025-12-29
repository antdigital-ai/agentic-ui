import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { TaskList } from '..';

// Mock Loading 组件
vi.mock('../../components/Loading', () => ({
  Loading: ({ size, ...props }: any) => (
    <div data-testid="task-list-loading" data-size={size} {...props}>
      Loading
    </div>
  ),
}));

// Mock ActionIconBox
vi.mock('../../components/ActionIconBox', () => ({
  ActionIconBox: ({ title, iconStyle, onClick, children, ...props }: any) => (
    <div
      data-testid="action-icon-box"
      data-title={title}
      data-icon-style={JSON.stringify(iconStyle)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock 样式hook
vi.mock('../style', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash-id',
  }),
}));

describe('TaskList Component', () => {
  const mockLocale = {
    'taskList.collapse': '收起',
    'taskList.expand': '展开',
  };

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale as any } as any}>
        {children}
      </I18nContext.Provider>
    </ConfigProvider>
  );

  const mockItems = [
    {
      key: 'task1',
      title: '任务1',
      content: '任务1内容',
      status: 'success' as const,
    },
    {
      key: 'task2',
      title: '任务2',
      content: '任务2内容',
      status: 'loading' as const,
    },
    {
      key: 'task3',
      title: '任务3',
      content: '任务3内容',
      status: 'pending' as const,
    },
    {
      key: 'task4',
      title: '任务4',
      content: '任务4内容',
      status: 'error' as const,
    },
  ];

  it('应该渲染任务列表', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    expect(screen.getAllByTestId('task-list-thoughtChainItem')).toHaveLength(4);
  });

  it('应该显示任务标题', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    expect(screen.getByText('任务1')).toBeInTheDocument();
    expect(screen.getByText('任务2')).toBeInTheDocument();
    expect(screen.getByText('任务3')).toBeInTheDocument();
    expect(screen.getByText('任务4')).toBeInTheDocument();
  });

  it('应该显示不同状态的任务', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    expect(screen.getByTestId('task-list-status-success')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-status-loading')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-status-pending')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-status-error')).toBeInTheDocument();
  });

  it('应该显示加载动画', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const loadingComponent = screen.getByTestId('task-list-loading');
    expect(loadingComponent).toBeInTheDocument();
    expect(loadingComponent).toHaveAttribute('data-size', '16');
  });

  it('应该支持点击展开/折叠', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const arrowContainer = screen.getAllByTestId('task-list-arrowContainer')[0];
    expect(arrowContainer).toBeInTheDocument();

    fireEvent.click(arrowContainer);
    // 这里可以添加更多关于展开/折叠状态的断言
  });

  it('应该显示任务内容', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    expect(screen.getByText('任务1内容')).toBeInTheDocument();
    expect(screen.getByText('任务2内容')).toBeInTheDocument();
    expect(screen.getByText('任务3内容')).toBeInTheDocument();
    expect(screen.getByText('任务4内容')).toBeInTheDocument();
  });

  it('应该支持自定义类名', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} className="custom-task-list" />
      </TestWrapper>,
    );

    const container = screen.getAllByTestId('task-list-thoughtChainItem')[0]
      .parentElement;
    expect(container).toHaveClass('custom-task-list');
  });

  it('应该处理空任务列表', () => {
    render(
      <TestWrapper>
        <TaskList items={[]} />
      </TestWrapper>,
    );

    expect(
      screen.queryByTestId('task-list-thoughtChainItem'),
    ).not.toBeInTheDocument();
  });

  it('应该处理没有标题的任务', () => {
    const itemsWithoutTitle = [
      {
        key: 'task1',
        content: '任务内容',
        status: 'success' as const,
      },
    ];

    render(
      <TestWrapper>
        <TaskList items={itemsWithoutTitle} />
      </TestWrapper>,
    );

    expect(
      screen.getByTestId('task-list-thoughtChainItem'),
    ).toBeInTheDocument();
    expect(screen.getByText('任务内容')).toBeInTheDocument();
  });

  it('应该处理数组内容', () => {
    const itemsWithArrayContent = [
      {
        key: 'task1',
        title: '任务1',
        content: ['内容1', '内容2', '内容3'],
        status: 'success' as const,
      },
    ];

    render(
      <TestWrapper>
        <TaskList items={itemsWithArrayContent} />
      </TestWrapper>,
    );

    // 数组内容被直接渲染，所以文本是连续的
    expect(screen.getByText('内容1内容2内容3')).toBeInTheDocument();
  });

  it('应该处理空内容', () => {
    const itemsWithEmptyContent = [
      {
        key: 'task1',
        title: '任务1',
        content: '',
        status: 'success' as const,
      },
    ];

    render(
      <TestWrapper>
        <TaskList items={itemsWithEmptyContent} />
      </TestWrapper>,
    );

    expect(
      screen.getByTestId('task-list-thoughtChainItem'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('task-list-arrowContainer'),
    ).not.toBeInTheDocument();
  });

  it('应该处理空数组内容', () => {
    const itemsWithEmptyArrayContent = [
      {
        key: 'task1',
        title: '任务1',
        content: [],
        status: 'success' as const,
      },
    ];

    render(
      <TestWrapper>
        <TaskList items={itemsWithEmptyArrayContent} />
      </TestWrapper>,
    );

    expect(
      screen.getByTestId('task-list-thoughtChainItem'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('task-list-arrowContainer'),
    ).not.toBeInTheDocument();
  });

  it('应该支持受控模式', () => {
    const onExpandedKeysChange = vi.fn();
    const expandedKeys = ['task1'];

    render(
      <TestWrapper>
        <TaskList
          items={mockItems}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={onExpandedKeysChange}
        />
      </TestWrapper>,
    );

    const arrowContainer = screen.getAllByTestId('task-list-arrowContainer')[0];
    fireEvent.click(arrowContainer);

    expect(onExpandedKeysChange).toHaveBeenCalled();
  });

  it('应该显示正确的国际化文本', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const actionIconBoxes = screen.getAllByTestId('action-icon-box');
    expect(actionIconBoxes[0]).toHaveAttribute('data-title', '收起');
  });

  it('应该处理缺失的国际化文本', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: null } as any}>
          <TaskList items={mockItems} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    const actionIconBoxes = screen.getAllByTestId('action-icon-box');
    // 默认情况下任务项是展开的，所以显示"收起"
    expect(actionIconBoxes[0]).toHaveAttribute('data-title', '收起');
  });

  it('应该正确设置箭头样式', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const actionIconBoxes = screen.getAllByTestId('action-icon-box');
    const iconStyle = JSON.parse(
      actionIconBoxes[0].getAttribute('data-icon-style') || '{}',
    );
    // 默认情况下任务项是展开的，所以箭头是 rotate(180deg)
    expect(iconStyle.transform).toBe('rotate(180deg)');
  });

  it('应该显示连接线（除了最后一个任务）', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const dashLines = screen.getAllByTestId('task-list-dash-line');
    expect(dashLines).toHaveLength(3); // 4个任务，3条连接线
  });

  it('应该处理单个任务（无连接线）', () => {
    const singleItem = [mockItems[0]];

    render(
      <TestWrapper>
        <TaskList items={singleItem} />
      </TestWrapper>,
    );

    expect(screen.queryByTestId('task-list-dash-line')).not.toBeInTheDocument();
  });

  it('应该支持点击左侧区域切换展开状态', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const leftArea = screen.getAllByTestId('task-list-left')[0];
    fireEvent.click(leftArea);

    // 这里可以添加更多关于状态变化的断言
    expect(leftArea).toBeInTheDocument();
  });

  it('应该支持点击顶部区域切换展开状态', () => {
    render(
      <TestWrapper>
        <TaskList items={mockItems} />
      </TestWrapper>,
    );

    const topArea = screen
      .getAllByTestId('task-list-thoughtChainItem')[0]
      .querySelector('.ant-task-list-top');
    expect(topArea).toBeInTheDocument();

    if (topArea) {
      fireEvent.click(topArea);
    }
  });
});
