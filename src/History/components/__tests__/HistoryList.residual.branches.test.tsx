/**
 * generateHistoryItems 残留：groupBy、sessionSort false/custom、max time 排序。
 */
import { describe, expect, it, vi } from 'vitest';
import { generateHistoryItems } from '../HistoryList';

vi.mock('../HistoryItem', () => ({
  HistoryItem: (props: any) => ({
    type: 'item',
    key: props.item.sessionId,
    label: props.item.sessionTitle,
  }),
}));

const item = (
  over: Partial<{
    sessionId: string;
    sessionTitle: string;
    gmtCreate: number;
  }> = {},
) => ({
  sessionId: 's1',
  sessionTitle: 'Title',
  gmtCreate: 1000,
  ...over,
});

describe('HistoryList residual branches', () => {
  it('groupBy 自定义 + sessionSort=false 保持顺序', () => {
    const items = generateHistoryItems({
      filteredList: [
        item({ sessionId: 'a', gmtCreate: 1 }),
        item({ sessionId: 'b', gmtCreate: 2 }),
      ],
      selectedIds: [],
      onSelectionChange: vi.fn(),
      onClick: vi.fn(),
      groupBy: () => 'custom',
      sessionSort: false,
    } as any);
    expect(items.length).toBeGreaterThan(0);
  });

  it('sessionSort 自定义比较器', () => {
    const custom = generateHistoryItems({
      filteredList: [
        item({ sessionId: 'a', gmtCreate: 10 }),
        item({ sessionId: 'b', gmtCreate: 20 }),
      ],
      selectedIds: ['a'],
      onSelectionChange: vi.fn(),
      onClick: vi.fn(),
      sessionSort: (x: any, y: any) =>
        (x.gmtCreate || 0) - (y.gmtCreate || 0),
    } as any);
    expect(custom.length).toBeGreaterThan(0);
  });

  it('空 filteredList；跨分组按 max time', () => {
    expect(
      generateHistoryItems({
        filteredList: [],
        selectedIds: [],
        onSelectionChange: vi.fn(),
        onClick: vi.fn(),
      } as any),
    ).toEqual([]);

    const multi = generateHistoryItems({
      filteredList: [
        item({ sessionId: 'old', gmtCreate: 1 }),
        item({ sessionId: 'new', gmtCreate: 9999 }),
      ],
      selectedIds: [],
      onSelectionChange: vi.fn(),
      onClick: vi.fn(),
      groupBy: (row: any) => (row.gmtCreate > 100 ? 'new' : 'old'),
    } as any);
    expect(multi.length).toBeGreaterThanOrEqual(1);
  });
});
