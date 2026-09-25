/**
 * HistoryList deepen：MIN_GROUP_SIZE 分组标题、groupLabelRender、customDateFormatter、无 sessionId。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MIN_GROUP_SIZE } from '../../constants';
import { generateHistoryItems } from '../HistoryList';

vi.mock('../HistoryItem', () => ({
  HistoryItem: (props: any) => ({
    type: 'item',
    key: props.item.sessionId || props.item.id,
    label: props.item.sessionTitle,
  }),
}));

const item = (
  over: Partial<{
    sessionId: string;
    sessionTitle: string;
    gmtCreate: number;
    id: string;
  }> = {},
) => ({
  sessionId: 's1',
  sessionTitle: 'Title',
  gmtCreate: 1000,
  ...over,
});

describe('HistoryList deepen residual branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('达到 MIN_GROUP_SIZE 生成 group + groupLabelRender / customDateFormatter', () => {
    const list = Array.from({ length: Math.max(MIN_GROUP_SIZE, 2) }, (_, i) =>
      item({
        sessionId: `s${i}`,
        gmtCreate: 1000 + i,
        sessionTitle: `T${i}`,
      }),
    );
    const groupLabelRender = vi.fn((key: string, rows: any[], label: string) =>
      `G:${key}:${rows.length}:${label}`,
    );
    const customDateFormatter = vi.fn(() => 'FMT');
    const items = generateHistoryItems({
      filteredList: list,
      selectedIds: [],
      onSelectionChange: vi.fn(),
      onClick: vi.fn(),
      groupBy: () => 'day',
      groupLabelRender,
      customDateFormatter,
    } as any);
    const group = items.find((x) => x.type === 'group');
    expect(group).toBeTruthy();
    expect(groupLabelRender).toHaveBeenCalled();
    expect(customDateFormatter).toHaveBeenCalled();
    expect(String(group?.label)).toContain('G:day');
  });

  it('sessionSort 返回 boolean 视为 0；无 sessionId 的 onClick 早退；item-${id} key', () => {
    const onClick = vi.fn();
    const items = generateHistoryItems({
      filteredList: [
        item({ sessionId: undefined as any, id: 'noid', gmtCreate: 5 }),
        item({ sessionId: 'has', gmtCreate: 1 }),
      ],
      selectedIds: [],
      onSelectionChange: vi.fn(),
      onClick,
      sessionSort: () => true as any,
      groupBy: () => 'g',
    } as any);
    const flat = items.flatMap((x: any) =>
      x.type === 'group' ? x.children || [] : [x],
    );
    const noId = flat.find((x: any) => String(x.key).includes('noid'));
    expect(noId?.key).toBe('item-noid');
    noId?.onClick?.();
    expect(onClick).not.toHaveBeenCalled();
    const has = flat.find((x: any) => x.key === 'has');
    has?.onClick?.();
    expect(onClick).toHaveBeenCalledWith('has', expect.any(Object));
  });

  it('filteredList undefined；formatTimeLocale / 缺 gmtCreate 的 group label', () => {
    expect(
      generateHistoryItems({
        filteredList: undefined,
        selectedIds: [],
        onSelectionChange: vi.fn(),
        onClick: vi.fn(),
      } as any),
    ).toEqual([]);

    const big = Array.from({ length: MIN_GROUP_SIZE }, (_, i) =>
      item({
        sessionId: `x${i}`,
        gmtCreate: undefined as any,
        sessionTitle: `X${i}`,
      }),
    );
    const items = generateHistoryItems({
      filteredList: big,
      selectedIds: [],
      onSelectionChange: vi.fn(),
      onClick: vi.fn(),
      groupBy: () => 'empty-time',
      formatTimeLocale: 'zh-CN' as any,
    } as any);
    expect(items.some((x) => x.type === 'group')).toBe(true);
  });
});
