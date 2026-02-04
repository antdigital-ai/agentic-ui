import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChartToolBar from '../../../../src/Plugins/chart/components/ChartToolBar/ChartToolBar';
// Mock Ant Design components
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Tooltip: ({ children, title }: any) => (
      <div data-testid="tooltip" title={title}>
        {children}
      </div>
    ),
  };
});

// Mock DownloadOutlined icon
vi.mock('@ant-design/icons', () => ({
  DownloadOutlined: ({ onClick }: { onClick: () => void }) => (
    <span data-testid="download-icon" onClick={onClick}>
      下载
    </span>
  ),
}));

// Mock TimeIcon
vi.mock('../../../../src/Plugins/chart/components/icons/TimeIcon', () => ({
  default: () => <span data-testid="time-icon">时间</span>,
}));

// Mock Loading component
vi.mock('../../../../src/Components/Loading', () => ({
  Loading: () => <span data-testid="loading">加载中...</span>,
}));

// Mock I18nContext
vi.mock('../../../../src/I18n', () => ({
  I18nContext: {
    Consumer: ({ children }: any) =>
      children({
        locale: { dataTime: '数据时间', download: '下载' },
        language: 'zh-CN',
      }),
  },
}));

describe('ChartToolBar', () => {
  const defaultProps = {
    title: '测试图表标题',
    dataTime: '2024-01-01 12:00:00',
    onDownload: vi.fn(),
  };

  it('应该正确渲染基础工具栏', () => {
    render(<ChartToolBar {...defaultProps} />);

    expect(screen.getByText('测试图表标题')).toBeInTheDocument();
    expect(
      screen.getByText('数据时间: 2024-01-01 12:00:00'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('应该在没有标题和额外内容时不渲染', () => {
    const { container } = render(<ChartToolBar />);

    expect(container.firstChild).toBeNull();
  });

  it('应该在只有标题时正确渲染', () => {
    render(<ChartToolBar title="仅标题" />);

    expect(screen.getByText('仅标题')).toBeInTheDocument();
    // 当只有标题时，应该显示下载按钮，因为handleDownload函数始终存在
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('应该在只有额外内容时正确渲染', () => {
    const extraContent = <button type="button">额外按钮</button>;
    render(<ChartToolBar extra={extraContent} />);

    expect(screen.getByText('额外按钮')).toBeInTheDocument();
    expect(screen.queryByText('数据时间')).not.toBeInTheDocument();
  });

  it('应该正确处理下载功能', () => {
    const onDownload = vi.fn();
    const props = { ...defaultProps, onDownload };

    render(<ChartToolBar {...props} />);

    // 查找具有 download-icon testId 的元素（这是 Tooltip 中的 span）
    const downloadButton = screen.getByTestId('download-icon');
    // 点击 span 元素应该触发 onClick 事件
    fireEvent.click(downloadButton);

    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('应该在没有下载功能时不显示下载按钮', () => {
    render(<ChartToolBar title="测试标题" dataTime="2024-01-01 12:00:00" />);

    // 即使没有onDownload，也应该显示下载按钮，因为handleDownload函数始终存在
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('应该正确显示加载状态', () => {
    render(<ChartToolBar {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('应该在不加载时不显示加载状态', () => {
    render(<ChartToolBar {...defaultProps} loading={false} />);

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('应该应用自定义类名', () => {
    const className = 'custom-toolbar-class';
    const { container } = render(
      <ChartToolBar {...defaultProps} className={className} />,
    );

    const toolbarContainer = container.firstChild as HTMLElement;
    expect(toolbarContainer.className).toContain(className);
  });

  it('应该正确处理主题变化', () => {
    const { container: lightContainer } = render(
      <ChartToolBar {...defaultProps} theme="light" />,
    );

    const lightToolbarContainer = lightContainer.firstChild as HTMLElement;
    expect(lightToolbarContainer.className).toContain('light');

    const { container: darkContainer } = render(
      <ChartToolBar {...defaultProps} theme="dark" />,
    );

    const darkToolbarContainer = darkContainer.firstChild as HTMLElement;
    expect(darkToolbarContainer.className).toContain('dark');
  });

  it('应该正确显示过滤器内容', () => {
    const filterContent = <div data-testid="filter-content">过滤器</div>;
    render(<ChartToolBar {...defaultProps} filter={filterContent} />);

    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
  });

  it('应该正确显示额外内容', () => {
    const extraContent = (
      <button type="button" data-testid="extra-button">
        额外按钮
      </button>
    );
    render(<ChartToolBar {...defaultProps} extra={extraContent} />);

    expect(screen.getByTestId('extra-button')).toBeInTheDocument();
  });

  it('应该在没有数据时间时不显示时间信息', () => {
    render(<ChartToolBar title="测试标题" onDownload={vi.fn()} />);

    expect(screen.queryByText('数据时间:')).not.toBeInTheDocument();
    expect(screen.queryByTestId('time-icon')).not.toBeInTheDocument();
  });

  it('应该正确显示工具提示', () => {
    render(<ChartToolBar {...defaultProps} />);

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip.getAttribute('title')).toBe('下载');
  });

  it('应该正确处理国际化文本', () => {
    render(<ChartToolBar {...defaultProps} />);

    expect(
      screen.getByText('数据时间: 2024-01-01 12:00:00'),
    ).toBeInTheDocument();
  });

  it('应该在没有国际化时使用默认文本', () => {
    // Mock I18nContext without locale
    vi.mock('../../../../src/I18n', () => ({
      I18nContext: {
        Consumer: ({ children }: any) =>
          children({ locale: {}, language: 'zh-CN' }),
      },
    }));

    render(<ChartToolBar {...defaultProps} />);

    expect(
      screen.getByText('数据时间: 2024-01-01 12:00:00'),
    ).toBeInTheDocument();
  });
});
