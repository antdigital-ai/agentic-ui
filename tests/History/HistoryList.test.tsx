import { HistoryDataType } from '@ant-design/agentic-ui';
import { render } from '@testing-library/react';
import dayjs from 'dayjs';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { generateHistoryItems } from '../../src/History/components/HistoryList';

// Mock HistoryItem 组件
vi.mock('../../src/History/components/HistoryItem', () => ({
  HistoryItem: ({ item }: { item: HistoryDataType }) => (
    <div data-testid={`history-item-${item.sessionId}`}>
      {item.sessionTitle}
    </div>
  ),
}));

// Mock 工具函数
vi.mock('../../src/History/utils', () => ({
  formatTime: (timestamp: number) => {
    const date = dayjs(timestamp);
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');

    if (date.isSame(today, 'day')) {
      return '今日';
    } else if (date.isSame(yesterday, 'day')) {
      return '昨日';
    } else {
      return date.format('MM-DD');
    }
  },
  groupByCategory: (
    list: HistoryDataType[],
    keyFn: (item: HistoryDataType) => string,
  ) => {
    const groups: Record<string, HistoryDataType[]> = {};
    list.forEach((item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  },
}));

describe('HistoryList - generateHistoryItems', () => {
  const mockHistoryData: HistoryDataType[] = [
    {
      sessionId: 'session1',
      id: '1',
      sessionTitle: '今天的对话1',
      gmtCreate: dayjs().valueOf(),
    },
    {
      sessionId: 'session2',
      id: '2',
      sessionTitle: '今天的对话2',
      gmtCreate: dayjs().valueOf(),
    },
    {
      sessionId: 'session3',
      id: '3',
      sessionTitle: '昨天的对话',
      gmtCreate: dayjs().subtract(1, 'day').valueOf(),
    },
    {
      sessionId: 'session4',
      id: '4',
      sessionTitle: '前天的对话',
      gmtCreate: dayjs().subtract(2, 'day').valueOf(),
    },
  ];

  const defaultConfig = {
    filteredList: mockHistoryData,
    selectedIds: [],
    onSelectionChange: vi.fn(),
    onClick: vi.fn(),
  };

  it('should generate history items with default group labels', () => {
    const items = generateHistoryItems(defaultConfig);

    expect(items).toHaveLength(3); // 今日、昨日、前天 3个分组

    // 验证分组结构
    expect(items[0]).toMatchObject({
      type: 'group',
      label: '今日',
    });
    expect(items[0].children).toHaveLength(2); // 今日有2个对话

    expect(items[1]).toMatchObject({
      type: 'group',
      label: '昨日',
    });
    expect(items[1].children).toHaveLength(1); // 昨日有1个对话

    expect(items[2]).toMatchObject({
      type: 'group',
    });
    expect(items[2].children).toHaveLength(1); // 前天有1个对话
  });

  it('should use custom groupLabelRender to render group labels', () => {
    const mockGroupLabelRender = vi.fn(
      (key: string, list: HistoryDataType[], defaultLabel: React.ReactNode) => {
        return (
          <div data-testid={`custom-group-${key}`}>
            <span className="group-title">自定义 {defaultLabel}</span>
            <span className="group-count">({list.length} 条记录)</span>
          </div>
        );
      },
    );

    const items = generateHistoryItems({
      ...defaultConfig,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证 groupLabelRender 被正确调用
    expect(mockGroupLabelRender).toHaveBeenCalledTimes(3); // 3个分组

    // 验证第一个分组的调用参数
    expect(mockGroupLabelRender).toHaveBeenNthCalledWith(
      1,
      '今日', // key
      expect.arrayContaining([
        expect.objectContaining({ sessionId: 'session1' }),
        expect.objectContaining({ sessionId: 'session2' }),
      ]), // list
      '今日', // defaultLabel
    );

    // 验证第二个分组的调用参数
    expect(mockGroupLabelRender).toHaveBeenNthCalledWith(
      2,
      '昨日', // key
      expect.arrayContaining([
        expect.objectContaining({ sessionId: 'session3' }),
      ]), // list
      '昨日', // defaultLabel
    );

    // 验证返回的自定义标签
    const { container } = render(<div>{items[0].label}</div>);
    expect(
      container.querySelector('[data-testid="custom-group-今日"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('.group-title')).toHaveTextContent(
      '自定义 今日',
    );
    expect(container.querySelector('.group-count')).toHaveTextContent(
      '(2 条记录)',
    );
  });

  it('should work with custom groupBy function and groupLabelRender', () => {
    const mockGroupBy = vi.fn((item: HistoryDataType) => {
      // 按标题首字符分组
      return String(item.sessionTitle).charAt(0);
    });

    const mockGroupLabelRender = vi.fn(
      (key: string, list: HistoryDataType[]) => {
        return `${key} 组 (${list.length}个)`;
      },
    );

    const items = generateHistoryItems({
      ...defaultConfig,
      groupBy: mockGroupBy,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证自定义分组函数被调用
    expect(mockGroupBy).toHaveBeenCalledTimes(4); // 4个历史记录

    // 验证 groupLabelRender 被调用
    expect(mockGroupLabelRender).toHaveBeenCalled();

    // 验证自定义分组结果
    const groupKeys = items.map((item) => item.key);
    expect(groupKeys).toContain('group-今'); // "今天的对话"分组
    expect(groupKeys).toContain('group-昨'); // "昨天的对话"分组
    expect(groupKeys).toContain('group-前'); // "前天的对话"分组
  });

  it('should use customDateFormatter with groupLabelRender', () => {
    const mockCustomDateFormatter = vi.fn((date: number | string | Date) => {
      return dayjs(date).format('YYYY年MM月DD日');
    });

    const mockGroupLabelRender = vi.fn(
      (key: string, list: HistoryDataType[], defaultLabel: React.ReactNode) => {
        return `📅 ${defaultLabel}`;
      },
    );

    const items = generateHistoryItems({
      ...defaultConfig,
      customDateFormatter: mockCustomDateFormatter,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证自定义日期格式化函数被调用
    expect(mockCustomDateFormatter).toHaveBeenCalled();

    // 验证 groupLabelRender 接收到格式化后的日期
    expect(mockGroupLabelRender).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.stringMatching(/\d{4}年\d{2}月\d{2}日/), // 格式化后的日期
    );

    // 验证最终的标签格式
    expect(items[0].label).toMatch(/^📅 \d{4}年\d{2}月\d{2}日$/);
  });

  it('should handle empty filteredList gracefully', () => {
    const mockGroupLabelRender = vi.fn();

    const items = generateHistoryItems({
      ...defaultConfig,
      filteredList: [],
      groupLabelRender: mockGroupLabelRender,
    });

    expect(items).toHaveLength(0);
    expect(mockGroupLabelRender).not.toHaveBeenCalled();
  });

  it('should preserve original functionality when groupLabelRender is not provided', () => {
    const items = generateHistoryItems(defaultConfig);

    // 验证没有 groupLabelRender 时使用默认标签
    expect(items[0]).toMatchObject({
      type: 'group',
      label: '今日',
    });

    expect(items[1]).toMatchObject({
      type: 'group',
      label: '昨日',
    });
  });

  it('should pass correct parameters to groupLabelRender for different group sizes', () => {
    const mockGroupLabelRender = vi.fn(
      (key: string, list: HistoryDataType[], defaultLabel: React.ReactNode) => {
        return `${defaultLabel} - ${list.length}项`;
      },
    );

    generateHistoryItems({
      ...defaultConfig,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证今日分组（2个项目）
    expect(mockGroupLabelRender).toHaveBeenCalledWith(
      '今日',
      expect.arrayContaining([
        expect.objectContaining({ sessionId: 'session1' }),
        expect.objectContaining({ sessionId: 'session2' }),
      ]),
      '今日',
    );

    // 验证昨日分组（1个项目）
    expect(mockGroupLabelRender).toHaveBeenCalledWith(
      '昨日',
      expect.arrayContaining([
        expect.objectContaining({ sessionId: 'session3' }),
      ]),
      '昨日',
    );
  });

  it('should handle groupLabelRender returning React elements', () => {
    const mockGroupLabelRender = vi.fn(
      (key: string, list: HistoryDataType[], defaultLabel: React.ReactNode) => {
        return (
          <div className="custom-group-header">
            <span className="group-icon">📋</span>
            <span className="group-label">{defaultLabel}</span>
            <span className="group-badge">{list.length}</span>
          </div>
        );
      },
    );

    const items = generateHistoryItems({
      ...defaultConfig,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证返回的是 React 元素
    const { container } = render(<div>{items[0].label}</div>);

    expect(container.querySelector('.custom-group-header')).toBeInTheDocument();
    expect(container.querySelector('.group-icon')).toHaveTextContent('📋');
    expect(container.querySelector('.group-label')).toHaveTextContent('今日');
    expect(container.querySelector('.group-badge')).toHaveTextContent('2');
  });

  it('should handle groupLabelRender with null or undefined returns', () => {
    const mockGroupLabelRender = vi.fn(() => null);

    const items = generateHistoryItems({
      ...defaultConfig,
      groupLabelRender: mockGroupLabelRender,
    });

    // 验证 null 返回值被正确处理
    expect(items[0].label).toBeNull();
    expect(mockGroupLabelRender).toHaveBeenCalled();
  });

  it('sessionSort 为 false 时排序应返回 0', () => {
    const items = generateHistoryItems({
      ...defaultConfig,
      sessionSort: false,
    });
    expect(items).toHaveLength(3);
    expect(items[0].children!.length).toBe(2);
  });

  it('sessionSort 为函数且返回 number 时应作为排序结果', () => {
    const sessionSort = vi.fn((a: HistoryDataType, b: HistoryDataType) => {
      return dayjs(a.gmtCreate).valueOf() - dayjs(b.gmtCreate).valueOf();
    });
    const items = generateHistoryItems({
      ...defaultConfig,
      sessionSort,
    });
    expect(sessionSort).toHaveBeenCalled();
    expect(items).toHaveLength(3);
  });

  it('sessionSort 返回 boolean 时应当作 0 处理', () => {
    const sessionSort = vi.fn(() => true);
    const items = generateHistoryItems({
      ...defaultConfig,
      sessionSort,
    });
    expect(items).toHaveLength(3);
  });

  it('item 无 sessionId 时 onClick 应直接 return', () => {
    const onClick = vi.fn();
    const listWithNoSessionId = [
      ...mockHistoryData,
      {
        id: 'no-session',
        sessionId: undefined as unknown as string,
        sessionTitle: '无 session',
        gmtCreate: dayjs().valueOf(),
      },
    ];
    const items = generateHistoryItems({
      ...defaultConfig,
      filteredList: listWithNoSessionId as HistoryDataType[],
      onClick,
    });
    const noSessionItem = items
      .flatMap((g) => g.children || [])
      .find((c: any) => c.key === 'item-no-session');
    expect(noSessionItem).toBeDefined();
    noSessionItem!.onClick!();
    expect(onClick).not.toHaveBeenCalled();
  });
});
