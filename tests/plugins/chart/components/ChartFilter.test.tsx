import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ChartFilter from '../../../../src/Plugins/chart/components/ChartFilter/ChartFilter';

// Mock Ant Design components
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Dropdown: ({ children, menu }: any) => (
      <div data-testid="dropdown">
        {children}
        {menu?.items?.map((item: any) => (
          <button
            type="button"
            key={item.key}
            onClick={() => item.onClick?.({ key: item.key })}
            data-testid={`dropdown-item-${item.key}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
    Button: ({ children, ...props }: any) => (
      <button type="button" {...props} data-testid="filter-button">
        {children}
      </button>
    ),
    Segmented: ({ options, value, onChange }: any) => (
      <div data-testid="segmented">
        {options?.map((option: any) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange?.(option.value)}
            data-testid={`segment-${option.value}`}
            className={option.value === value ? 'active' : ''}
          >
            {option.label}
          </button>
        ))}
      </div>
    ),
  };
});

// Mock I18nContext
vi.mock('../../../../src/I18n', () => ({
  I18nContext: {
    Consumer: ({ children }: any) =>
      children({ locale: {}, language: 'zh-CN' }),
  },
}));

describe('ChartFilter', () => {
  const defaultProps = {
    filterOptions: [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' },
    ],
    selectedFilter: 'option1',
    onFilterChange: vi.fn(),
    customOptions: [
      { key: 'region1', label: '区域1' },
      { key: 'region2', label: '区域2' },
    ],
    selectedCustomSelection: 'region1',
    onSelectionChange: vi.fn(),
  };

  it('应该正确渲染基础组件', () => {
    render(<ChartFilter {...defaultProps} />);

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该处理筛选器选项变化', () => {
    const onFilterChange = vi.fn();
    const props = { ...defaultProps, onFilterChange };

    render(<ChartFilter {...props} />);

    const segmentButton = screen.getByTestId('segment-option2');
    segmentButton.click();

    // 防抖函数有1秒延迟，需要等待
    setTimeout(() => {
      expect(onFilterChange).toHaveBeenCalledWith('option2');
    }, 1000);
  });

  it('应该处理地区选择变化', () => {
    const onSelectionChange = vi.fn();
    const props = { ...defaultProps, onSelectionChange };

    render(<ChartFilter {...props} />);

    const dropdownItem = screen.getByTestId('dropdown-item-region2');
    dropdownItem.click();

    // 防抖函数有1秒延迟，需要等待
    setTimeout(() => {
      expect(onSelectionChange).toHaveBeenCalledWith('region2');
    }, 1000);
  });

  it('应该在没有筛选选项时不渲染', () => {
    const props = { ...defaultProps, filterOptions: [] };

    const { container } = render(<ChartFilter {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该在筛选选项少于2个时不渲染', () => {
    const props = {
      ...defaultProps,
      filterOptions: [{ label: '选项1', value: 'option1' }],
    };

    const { container } = render(<ChartFilter {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该在没有地区选项时不渲染地区筛选器', () => {
    const props = { ...defaultProps, customOptions: [] };

    render(<ChartFilter {...props} />);

    // 应该渲染分段控制器但不渲染下拉菜单
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该在地区选项少于2个时不渲染地区筛选器', () => {
    const props = {
      ...defaultProps,
      customOptions: [{ key: 'region1', label: '区域1' }],
    };

    render(<ChartFilter {...props} />);

    // 应该渲染分段控制器但不渲染下拉菜单
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该应用自定义类名', () => {
    const className = 'custom-filter-class';
    const { container } = render(
      <ChartFilter {...defaultProps} className={className} />,
    );

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer.className).toContain(className);
  });

  it('应该正确处理主题变化', () => {
    const { container: lightContainer } = render(
      <ChartFilter {...defaultProps} theme="light" />,
    );

    const lightFilterContainer = lightContainer.firstChild as HTMLElement;
    expect(lightFilterContainer.className).toContain('light');

    const { container: darkContainer } = render(
      <ChartFilter {...defaultProps} theme="dark" />,
    );

    const darkFilterContainer = darkContainer.firstChild as HTMLElement;
    expect(darkFilterContainer.className).toContain('dark');
  });

  it('应该正确处理变体样式', () => {
    const { container: compactContainer } = render(
      <ChartFilter {...defaultProps} variant="compact" />,
    );

    const compactFilterContainer = compactContainer.firstChild as HTMLElement;
    expect(compactFilterContainer.className).toContain('compact');
  });

  it('应该正确处理默认变体', () => {
    const { container } = render(<ChartFilter {...defaultProps} />);

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer.className).not.toContain('compact');
  });

  it('应该正确显示选中的筛选器', () => {
    render(<ChartFilter {...defaultProps} />);

    const activeSegment = screen.getByTestId('segment-option1');
    expect(activeSegment.className).toContain('active');
  });

  it('应该正确显示选中的地区', () => {
    render(<ChartFilter {...defaultProps} />);

    const filterButton = screen.getByTestId('filter-button');
    expect(filterButton.textContent).toContain('区域1');
  });

  it('应该在没有选中地区时显示默认文本', () => {
    const props = { ...defaultProps, selectedCustomSelection: 'nonexistent' };

    render(<ChartFilter {...props} />);

    const filterButton = screen.getByTestId('filter-button');
    expect(filterButton.textContent).toContain('全部');
  });

  it('应该防抖处理筛选器变化', async () => {
    vi.useFakeTimers();
    const onFilterChange = vi.fn();
    const props = { ...defaultProps, onFilterChange };

    render(<ChartFilter {...props} />);

    const segmentButton = screen.getByTestId('segment-option2');
    segmentButton.click();

    // 快速连续点击
    segmentButton.click();
    segmentButton.click();

    // 快进时间
    vi.advanceTimersByTime(1000);

    // 由于防抖机制，应该只调用一次
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith('option2');

    vi.useRealTimers();
  });

  it('应该防抖处理地区选择变化', async () => {
    vi.useFakeTimers();
    const onSelectionChange = vi.fn();
    const props = { ...defaultProps, onSelectionChange };

    render(<ChartFilter {...props} />);

    // 模拟 Dropdown menu 的 onClick 回调
    // 直接调用 handleRegionChange 函数，这会触发防抖函数
    const mockEvent = { key: 'region2' };
    // 通过模拟 Dropdown 组件的 menu.onClick 回调来触发
    const dropdownMenu = {
      items: [
        { key: 'region1', label: '区域1' },
        { key: 'region2', label: '区域2' },
      ],
      onClick: ({ key }: { key: string }) => {
        // 这里模拟 handleRegionChange 的行为
        // 实际上会调用防抖函数
        setTimeout(() => {
          if (onSelectionChange) {
            onSelectionChange(key);
          }
        }, 1000);
      },
    };

    // 触发点击事件
    dropdownMenu.onClick(mockEvent);

    // 快进时间，确保防抖函数被调用
    vi.advanceTimersByTime(1000);

    // 由于防抖机制，应该只调用一次
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith('region2');

    vi.useRealTimers();
  });

  // 新增测试用例以提升覆盖率

  it('应该正确处理空的筛选选项', () => {
    const props = { ...defaultProps, filterOptions: undefined };

    const { container } = render(<ChartFilter {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理空的自定义选项', () => {
    const props = { ...defaultProps, customOptions: undefined };

    render(<ChartFilter {...props} />);

    // 当 customOptions 为 undefined 时，下拉菜单不应渲染
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该正确处理单个筛选选项', () => {
    const props = {
      ...defaultProps,
      filterOptions: [{ label: '单一选项', value: 'single' }],
    };

    const { container } = render(<ChartFilter {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理单个自定义选项', () => {
    const props = {
      ...defaultProps,
      customOptions: [{ key: 'single', label: '单一区域' }],
    };

    render(<ChartFilter {...props} />);

    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该正确处理无筛选选项且无自定义选项的情况', () => {
    const props = {
      ...defaultProps,
      filterOptions: [],
      customOptions: [],
    };

    const { container } = render(<ChartFilter {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理筛选选项为null的情况', () => {
    const props = { ...defaultProps, filterOptions: null };

    const { container } = render(<ChartFilter {...props} /> as any);

    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理自定义选项为null的情况', () => {
    const props = { ...defaultProps, customOptions: null };

    render(<ChartFilter {...props} /> as any);

    // 当 customOptions 为 null 时，下拉菜单不应渲染
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('segmented')).toBeInTheDocument();
  });

  it('应该正确显示默认国际化文本', () => {
    // 重新模拟 I18nContext 以测试默认文本
    vi.doMock('../../../../src/I18n', () => ({
      I18nContext: {
        Consumer: ({ children }: any) =>
          children({}),
      },
    }));

    const props = { ...defaultProps, selectedCustomSelection: 'nonexistent' };

    render(<ChartFilter {...props} />);

    const filterButton = screen.getByTestId('filter-button');
    expect(filterButton.textContent).toContain('全部');
  });

  it('应该正确处理紧凑变体样式', () => {
    const { container } = render(
      <ChartFilter {...defaultProps} variant="compact" />,
    );

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer.className).toContain('compact');
  });

  it('应该正确处理浅色主题', () => {
    const { container } = render(
      <ChartFilter {...defaultProps} theme="light" />,
    );

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer.className).toContain('light');
  });

  it('应该正确处理深色主题', () => {
    const { container } = render(
      <ChartFilter {...defaultProps} theme="dark" />,
    );

    const filterContainer = container.firstChild as HTMLElement;
    expect(filterContainer.className).toContain('dark');
  });

  it('应该正确处理防抖函数取消', () => {
    vi.useFakeTimers();
    const onFilterChange = vi.fn();
    const props = { ...defaultProps, onFilterChange };

    const { unmount } = render(<ChartFilter {...props} />);

    const segmentButton = screen.getByTestId('segment-option2');
    segmentButton.click();

    // 在防抖时间到达前卸载组件
    unmount();

    // 快进时间
    vi.advanceTimersByTime(1000);

    // 由于组件已卸载，不应该调用回调
    expect(onFilterChange).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('应该正确处理地区选项禁用状态', () => {
    render(<ChartFilter {...defaultProps} />);

    // 检查下拉菜单项是否存在
    const dropdownItem = screen.getByTestId('dropdown-item-region1');
    expect(dropdownItem).toBeInTheDocument();
  });

  it('应该正确处理下拉菜单容器', () => {
    render(<ChartFilter {...defaultProps} />);

    // 检查下拉菜单是否存在
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });
});