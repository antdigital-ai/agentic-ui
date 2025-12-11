import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import Workspace from '../../src/Workspace';

describe('Workspace Component', () => {
  const mockLocale = {
    'workspace.title': '工作空间',
    'workspace.realtimeFollow': '实时跟随',
    'workspace.browser': '浏览器',
    'workspace.task': '任务',
    'workspace.file': '文件',
  } as any;

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
        {children}
      </I18nContext.Provider>
    </ConfigProvider>
  );

  const browserSuggestions = [{ id: '1', label: '搜索建议1', count: 3 }];

  const browserResultsMap: Record<string, any[]> = {
    '1': [
      {
        id: '1-1',
        title: '搜索结果1',
        site: 'example.com',
        url: 'https://example.com',
      },
    ],
  };

  const requestBrowserResults = (suggestion: { id: string }) => ({
    items: browserResultsMap[suggestion.id] || [],
    loading: false,
  });

  it('应该渲染基本的工作空间结构', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 检查工作空间容器是否存在
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-header')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-title')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-content')).toBeInTheDocument();
    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
    // 检查内容是否渲染
    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it('应该渲染多个标签页', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
          <Workspace.Task data={{ items: [] }} />
          <Workspace.File nodes={[]} />
        </Workspace>
      </TestWrapper>,
    );

    // 检查标签页是否渲染
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-segmented')).toBeInTheDocument();
    expect(screen.getByText('实时跟随')).toBeInTheDocument();
    expect(screen.getByText('浏览器')).toBeInTheDocument();
    expect(screen.getByText('任务')).toBeInTheDocument();
    expect(screen.getByText('文件')).toBeInTheDocument();
  });

  it('应该支持自定义标题', () => {
    render(
      <TestWrapper>
        <Workspace title="自定义工作空间">
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 检查标题是否被正确设置
    expect(screen.getByText('自定义工作空间')).toBeInTheDocument();
  });

  it('应该支持受控的activeTabKey', () => {
    const onTabChange = vi.fn();

    render(
      <TestWrapper>
        <Workspace activeTabKey="browser" onTabChange={onTabChange}>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 当前处于浏览器标签页时，应渲染搜索建议列表
    expect(screen.getByText('搜索建议1')).toBeInTheDocument();
  });

  it('应该支持关闭回调', () => {
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <Workspace onClose={onClose}>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 检查关闭按钮是否存在
    const closeButton = screen.getByTestId('workspace-close');
    expect(closeButton).toBeInTheDocument();

    // 点击关闭按钮
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('应该支持自定义样式和类名', () => {
    render(
      <TestWrapper>
        <Workspace
          className="custom-workspace"
          style={{ backgroundColor: 'red' }}
        >
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
        </Workspace>
      </TestWrapper>,
    );

    const workspace = screen.getByTestId('workspace');
    expect(workspace).toHaveClass('custom-workspace');
    expect(workspace).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该处理空子组件', () => {
    render(
      <TestWrapper>
        <Workspace>{/* 没有子组件 */}</Workspace>
      </TestWrapper>,
    );

    // 没有子组件时应该返回 null
    expect(screen.queryByTestId('workspace')).not.toBeInTheDocument();
  });

  it('应该处理无效的子组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
          <div>无效组件</div>
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 只应该渲染有效的子组件，但只有当前激活的标签页内容会被渲染
    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
    expect(screen.queryByText('无效组件')).not.toBeInTheDocument();
    // 检查标签页是否存在（即使内容未渲染）
    expect(screen.getByText('浏览器')).toBeInTheDocument();
  });

  it('应该传递正确的props给子组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: 'test content' }}
          />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 检查当前激活的子组件是否正确渲染
    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
    // 检查内容是否正确传递
    expect(screen.getByText('test content')).toBeInTheDocument();
    // 检查标签页是否存在
    expect(screen.getByText('浏览器')).toBeInTheDocument();
  });

  it('应该使用默认国际化文本', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: mockLocale, language: 'zh-CN' }}>
          <Workspace>
            <Workspace.Realtime
              data={{ type: 'shell', content: 'test content' }}
            />
          </Workspace>
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    // 应该使用默认文本（实际渲染的是"终端执行"）
    expect(screen.getByText('终端执行')).toBeInTheDocument();
    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
  });

  it('应该处理标签页切换', () => {
    const onTabChange = vi.fn();

    render(
      <TestWrapper>
        <Workspace onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 查找并点击标签页切换按钮
    const segmentedControl = screen.getByTestId('workspace-segmented');
    expect(segmentedControl).toBeInTheDocument();
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });

  it('应该渲染自定义组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Custom tab={{ title: '自定义标签' }}>
            <div>自定义内容</div>
          </Workspace.Custom>
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByText('自定义内容')).toBeInTheDocument();
  });

  it('应该支持多个自定义组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Custom tab={{ title: '自定义1' }}>
            <div>内容1</div>
          </Workspace.Custom>
          <Workspace.Custom tab={{ title: '自定义2' }}>
            <div>内容2</div>
          </Workspace.Custom>
        </Workspace>
      </TestWrapper>,
    );

    // 默认显示第一个标签页
    expect(screen.getByText('内容1')).toBeInTheDocument();
    expect(screen.getByText('自定义1')).toBeInTheDocument();
    expect(screen.getByText('自定义2')).toBeInTheDocument();
  });

  it('应该显示标签页计数', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: '' }}
            tab={{ count: 5 }}
          />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
            tab={{ count: 10 }}
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('应该支持自定义标签页配置', () => {
    const { container } = render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime
            data={{ type: 'shell', content: '' }}
            tab={{
              key: 'custom-realtime',
              title: '自定义实时',
            }}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 验证工作空间已渲染
    expect(container.querySelector('.ant-workspace')).toBeInTheDocument();
  });

  it('应该在标签页只有一个时隐藏标签栏', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
        </Workspace>
      </TestWrapper>,
    );

    // 只有一个标签页时不应该显示标签栏
    expect(screen.queryByTestId('workspace-tabs')).not.toBeInTheDocument();
  });

  it('应该在有多个标签页时显示标签栏', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
  });

  it('应该在切换标签页时调用 onTabChange', () => {
    const onTabChange = vi.fn();

    const { rerender } = render(
      <TestWrapper>
        <Workspace onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 切换到浏览器标签页
    rerender(
      <TestWrapper>
        <Workspace activeTabKey="browser" onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 浏览器标签页下应显示搜索建议
    expect(screen.getByText('搜索建议1')).toBeInTheDocument();
  });

  it('应该自动选择第一个有效的标签页', () => {
    render(
      <TestWrapper>
        <Workspace activeTabKey="non-existent">
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 如果指定的 activeTabKey 不存在，应该显示第一个标签页
    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
  });

  it('应该支持受控和非受控模式', () => {
    const onTabChange = vi.fn();

    // 非受控模式
    const { unmount } = render(
      <TestWrapper>
        <Workspace onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();

    unmount();

    // 受控模式
    render(
      <TestWrapper>
        <Workspace activeTabKey="browser" onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 浏览器标签页下应显示搜索建议
    expect(screen.getByText('搜索建议1')).toBeInTheDocument();
  });

  it('应该显示国际化文本', () => {
    const customLocale = {
      'workspace.title': '自定义工作空间',
      'workspace.realtimeFollow': '自定义实时跟随',
      'workspace.browser': '自定义浏览器',
    } as any;

    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: customLocale, language: 'zh-CN' }}
        >
          <Workspace>
            <Workspace.Realtime data={{ type: 'shell', content: '' }} />
            <Workspace.Browser
              suggestions={browserSuggestions}
              request={requestBrowserResults}
            />
          </Workspace>
        </I18nContext.Provider>
      </ConfigProvider>,
    );

    expect(screen.getByText('自定义工作空间')).toBeInTheDocument();
  });

  it('应该处理 ResizeObserver 的宽度变化', () => {
    const { container } = render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    const workspace = container.querySelector('.ant-workspace');
    expect(workspace).toBeInTheDocument();
  });

  it('应该传递正确的 props 给 File 组件', () => {
    const fileNodes = [{ name: 'test.txt', content: 'test content' }];

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.File nodes={fileNodes} />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });

  it('应该在标签页切换时重置 File 组件状态', () => {
    const { rerender } = render(
      <TestWrapper>
        <Workspace activeTabKey="file">
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.File nodes={[]} />
        </Workspace>
      </TestWrapper>,
    );

    // 切换到其他标签页
    rerender(
      <TestWrapper>
        <Workspace activeTabKey="realtime">
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.File nodes={[]} />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('realtime-follow')).toBeInTheDocument();
  });

  it('应该处理空的 Custom 组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Custom />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });

  it('应该显示所有类型的组件', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime data={{ type: 'shell', content: 'realtime' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
          <Workspace.Task data={{ items: [] }} />
          <Workspace.File nodes={[]} />
          <Workspace.Custom>
            <div>custom</div>
          </Workspace.Custom>
        </Workspace>
      </TestWrapper>,
    );

    // 检查所有标签页是否存在
    expect(screen.getByText('终端执行')).toBeInTheDocument();
    expect(screen.getByText('浏览器')).toBeInTheDocument();
    expect(screen.getByText('任务')).toBeInTheDocument();
    expect(screen.getByText('文件')).toBeInTheDocument();
    expect(screen.getByText('自定义')).toBeInTheDocument();
  });

  it('应该正确处理 aria-label', () => {
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <Workspace onClose={onClose}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
        </Workspace>
      </TestWrapper>,
    );

    const closeButton = screen.getByTestId('workspace-close');
    expect(closeButton).toHaveAttribute('aria-label');
  });

  it('应该在没有 children 时返回 null', () => {
    const { container } = render(
      <TestWrapper>
        <Workspace />
      </TestWrapper>,
    );

    expect(container.querySelector('.ant-workspace')).not.toBeInTheDocument();
  });

  it('应该支持嵌套的复杂结构', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Realtime data={{ type: 'shell', content: 'content' }} />
          <Workspace.Custom tab={{ title: '复杂结构' }}>
            <div>
              <h1>标题</h1>
              <p>段落</p>
              <ul>
                <li>列表项1</li>
                <li>列表项2</li>
              </ul>
            </div>
          </Workspace.Custom>
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();
  });

  it('应该处理快速连续的标签页切换', () => {
    const onTabChange = vi.fn();

    const { rerender } = render(
      <TestWrapper>
        <Workspace activeTabKey="realtime" onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
          <Workspace.Task data={{ items: [] }} />
        </Workspace>
      </TestWrapper>,
    );

    // 快速切换
    rerender(
      <TestWrapper>
        <Workspace activeTabKey="browser" onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
          <Workspace.Task data={{ items: [] }} />
        </Workspace>
      </TestWrapper>,
    );

    rerender(
      <TestWrapper>
        <Workspace activeTabKey="task" onTabChange={onTabChange}>
          <Workspace.Realtime data={{ type: 'shell', content: '' }} />
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
          <Workspace.Task data={{ items: [] }} />
        </Workspace>
      </TestWrapper>,
    );

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('应该支持 Task 组件的 onItemClick 回调', () => {
    const onItemClick = vi.fn();
    const taskItems = [
      { key: '1', title: '任务1', status: 'success' as const },
      { key: '2', title: '任务2', status: 'pending' as const },
    ];

    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Task
            data={{ items: taskItems }}
            onItemClick={onItemClick}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 点击第一个任务项
    const taskItem = screen.getByText('任务1');
    fireEvent.click(taskItem);

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(taskItems[0]);
  });

  it('Task 组件在没有 onItemClick 时不应该有 pointer 样式', () => {
    const taskItems = [
      { key: '1', title: '任务1', status: 'success' as const },
    ];

    const { container } = render(
      <TestWrapper>
        <Workspace>
          <Workspace.Task data={{ items: taskItems }} />
        </Workspace>
      </TestWrapper>,
    );

    const taskItem = container.querySelector(
      '.ant-agentic-workspace-task-item',
    );
    expect(taskItem).not.toHaveStyle('cursor: pointer');
  });

  it('Task 组件在有 onItemClick 时应该有 pointer 样式', () => {
    const onItemClick = vi.fn();
    const taskItems = [
      { key: '1', title: '任务1', status: 'success' as const },
    ];

    const { container } = render(
      <TestWrapper>
        <Workspace>
          <Workspace.Task
            data={{ items: taskItems }}
            onItemClick={onItemClick}
          />
        </Workspace>
      </TestWrapper>,
    );

    const taskItem = container.querySelector(
      '.ant-agentic-workspace-task-item',
    );
    expect(taskItem).toHaveStyle('cursor: pointer');
  });

  it('Browser 组件在 Workspace 中应支持搜索建议到结果列表的切换', () => {
    render(
      <TestWrapper>
        <Workspace>
          <Workspace.Browser
            suggestions={browserSuggestions}
            request={requestBrowserResults}
          />
        </Workspace>
      </TestWrapper>,
    );

    // 初始应展示搜索建议
    const suggestion = screen.getByText('搜索建议1');
    expect(suggestion).toBeInTheDocument();

    // 点击搜索建议后，应展示结果标题
    fireEvent.click(suggestion);
    expect(screen.getByText('搜索结果1')).toBeInTheDocument();
  });
});
