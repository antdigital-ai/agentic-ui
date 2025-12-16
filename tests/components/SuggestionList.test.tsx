import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionList } from '../../src/Components/SuggestionList';

describe('SuggestionList 组件', () => {
  const mockItems = [
    { key: '1', text: '建议1', tooltip: '这是建议1' },
    { key: '2', text: '建议2', tooltip: '这是建议2' },
    { key: '3', text: '建议3', disabled: true },
  ];

  it('应该渲染建议列表', () => {
    render(<SuggestionList items={mockItems} />);

    expect(screen.getByText('建议1')).toBeInTheDocument();
    expect(screen.getByText('建议2')).toBeInTheDocument();
    expect(screen.getByText('建议3')).toBeInTheDocument();
  });

  it('应该处理项点击事件', async () => {
    const handleClick = vi.fn();

    render(<SuggestionList items={mockItems} onItemClick={handleClick} />);

    const item = screen.getByText('建议1');

    await act(async () => {
      fireEvent.click(item);
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(handleClick).toHaveBeenCalledWith('建议1');
  });

  it('应该支持项的自定义 onClick', async () => {
    const customClick = vi.fn();
    const items = [{ key: '1', text: '自定义点击', onClick: customClick }];

    render(<SuggestionList items={items} />);

    const item = screen.getByText('自定义点击');

    await act(async () => {
      fireEvent.click(item);
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(customClick).toHaveBeenCalledWith('自定义点击');
  });

  it('应该在禁用状态下阻止点击', async () => {
    const handleClick = vi.fn();

    render(<SuggestionList items={mockItems} onItemClick={handleClick} />);

    const disabledItem = screen.getByText('建议3');

    await act(async () => {
      fireEvent.click(disabledItem);
      // 等待 Promise 完成
      await Promise.resolve();
    });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该支持最大显示数量限制', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      key: `${i}`,
      text: `建议${i}`,
    }));

    render(<SuggestionList items={manyItems} maxItems={5} />);

    // 应该只显示前5个
    expect(screen.getByText('建议0')).toBeInTheDocument();
    expect(screen.getByText('建议4')).toBeInTheDocument();
    expect(screen.queryByText('建议5')).not.toBeInTheDocument();
  });

  it('应该支持垂直布局', () => {
    const { container } = render(
      <SuggestionList items={mockItems} layout="vertical" />,
    );

    const suggestions = container.querySelector('.ant-follow-up');
    expect(suggestions).toHaveClass('ant-follow-up-vertical');
  });

  it('应该支持水平布局', () => {
    const { container } = render(
      <SuggestionList items={mockItems} layout="horizontal" />,
    );

    const suggestions = container.querySelector('.ant-follow-up');
    expect(suggestions).toHaveClass('ant-follow-up-horizontal');
  });

  it('应该支持基础类型样式', () => {
    const { container } = render(
      <SuggestionList items={mockItems} type="basic" />,
    );

    const suggestions = container.querySelector('.ant-follow-up');
    expect(suggestions).toHaveClass('ant-follow-up-basic');
  });

  it('应该支持透明类型样式', () => {
    const { container } = render(
      <SuggestionList items={mockItems} type="transparent" />,
    );

    const suggestions = container.querySelector('.ant-follow-up');
    expect(suggestions).toHaveClass('ant-follow-up-transparent');
  });

  it('应该支持白色类型样式', () => {
    const { container } = render(
      <SuggestionList items={mockItems} type="white" />,
    );

    const suggestions = container.querySelector('.ant-follow-up');
    expect(suggestions).toHaveClass('ant-follow-up-white');
  });

  it('应该显示项图标', () => {
    const ItemIcon = () => <span data-testid="item-icon">🔍</span>;
    const items = [{ key: '1', text: '带图标', icon: <ItemIcon /> }];

    render(<SuggestionList items={items} />);

    expect(screen.getByTestId('item-icon')).toBeInTheDocument();
  });

  it('应该显示项的操作图标', () => {
    const ActionIcon = () => <span data-testid="action-icon">→</span>;
    const items = [{ key: '1', text: '操作图标', actionIcon: <ActionIcon /> }];

    render(<SuggestionList items={items} />);

    expect(screen.getByTestId('action-icon')).toBeInTheDocument();
  });

  it('应该显示"搜索更多"入口', () => {
    render(
      <SuggestionList
        items={mockItems}
        showMore={{ enable: true, text: '搜索更多' }}
      />,
    );

    expect(screen.getByText('搜索更多')).toBeInTheDocument();
  });

  it('应该处理"搜索更多"点击', () => {
    const handleMore = vi.fn();

    const { container } = render(
      <SuggestionList
        items={mockItems}
        showMore={{ enable: true, onClick: handleMore }}
      />,
    );

    const moreIcon = container.querySelector('.ant-follow-up-more-icon');
    if (moreIcon) {
      fireEvent.click(moreIcon);
      expect(handleMore).toHaveBeenCalledTimes(1);
    }
  });

  it('应该支持自定义"搜索更多"图标', () => {
    const CustomIcon = () => <span data-testid="custom-more-icon">+</span>;

    render(
      <SuggestionList
        items={mockItems}
        showMore={{ enable: true, icon: <CustomIcon /> }}
      />,
    );

    expect(screen.getByTestId('custom-more-icon')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <SuggestionList items={mockItems} className="custom-list" />,
    );

    const root = container.querySelector('.ant-follow-up');
    expect(root).toHaveClass('custom-list');
  });

  it('应该支持自定义样式', () => {
    const { container } = render(
      <SuggestionList
        items={mockItems}
        style={{ backgroundColor: 'rgb(255, 0, 0)' }}
      />,
    );

    const root = container.querySelector('.ant-follow-up');
    expect(root).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('应该在提交时禁用所有项', async () => {
    const asyncClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(<SuggestionList items={mockItems} onItemClick={asyncClick} />);

    const item1 = screen.getByText('建议1');
    const item2 = screen.getByText('建议2');

    // 第一个点击正在处理时，第二个点击应该被阻止
    await act(async () => {
      fireEvent.click(item1);
      // 等待状态更新（loading 状态）
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.click(item2);
      // 等待 Promise 完成
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(asyncClick).toHaveBeenCalledTimes(1);
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <SuggestionList items={mockItems} />
      </ConfigProvider>,
    );

    expect(container.querySelector('.custom-follow-up')).toBeInTheDocument();
  });

  it('应该处理空的 items 数组', () => {
    const { container } = render(<SuggestionList items={[]} />);

    const suggestions = container.querySelector('.ant-follow-up-suggestions');
    expect(suggestions).not.toBeInTheDocument();
  });

  it('应该处理 undefined items', () => {
    const { container } = render(<SuggestionList />);

    const suggestions = container.querySelector('.ant-follow-up-suggestions');
    expect(suggestions).not.toBeInTheDocument();
  });

  it('应该设置可访问性属性', () => {
    render(<SuggestionList items={mockItems} />);

    // 检查 role 和 aria-label
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', '追问区域');

    const firstButton = screen.getByRole('button', { name: /选择建议：建议1/ });
    expect(firstButton).toBeInTheDocument();
  });

  it('应该默认使用垂直布局', () => {
    const { container } = render(<SuggestionList items={mockItems} />);

    const root = container.querySelector('.ant-follow-up');
    expect(root).toHaveClass('ant-follow-up-vertical');
  });

  it('应该默认使用基础类型', () => {
    const { container } = render(<SuggestionList items={mockItems} />);

    const root = container.querySelector('.ant-follow-up');
    expect(root).toHaveClass('ant-follow-up-basic');
  });

  it('应该默认最多显示6个项', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      key: `${i}`,
      text: `建议${i}`,
    }));

    render(<SuggestionList items={manyItems} />);

    expect(screen.getByText('建议5')).toBeInTheDocument();
    expect(screen.queryByText('建议6')).not.toBeInTheDocument();
  });

  it('应该使用文本作为 key 的后备值', () => {
    const items = [{ text: '无key的项' }];

    render(<SuggestionList items={items} />);

    expect(screen.getByText('无key的项')).toBeInTheDocument();
  });

  it('应该显示默认箭头图标', () => {
    const { container } = render(<SuggestionList items={mockItems} />);

    const arrows = container.querySelectorAll('.ant-follow-up-arrow');
    expect(arrows.length).toBeGreaterThan(0);
  });

  it('应该在禁用项上应用禁用样式', () => {
    render(<SuggestionList items={mockItems} />);

    const disabledItem = screen.getByText('建议3').closest('[role="button"]');
    expect(disabledItem).toHaveClass('ant-follow-up-suggestion-disabled');
  });

  it('应该处理异步点击回调', async () => {
    const asyncOnItemClick = vi.fn(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    render(<SuggestionList items={mockItems} onItemClick={asyncOnItemClick} />);

    const item = screen.getByText('建议1');

    await act(async () => {
      fireEvent.click(item);
      // 等待真实的 setTimeout 完成
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(asyncOnItemClick).toHaveBeenCalled();
  });
});
