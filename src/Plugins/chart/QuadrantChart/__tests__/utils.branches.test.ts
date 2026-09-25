import { describe, expect, it } from 'vitest';
import { parseQuadrantsFromRows, splitItems } from '../utils';

describe('QuadrantChart utils 分支覆盖', () => {
  it('splitItems null/undefined/empty 返回空数组', () => {
    expect(splitItems(null)).toEqual([]);
    expect(splitItems(undefined)).toEqual([]);
    expect(splitItems('')).toEqual([]);
    expect(splitItems('   ')).toEqual([]);
  });

  it('parseQuadrantsFromRows 无列时使用默认 label 且 items 为空', () => {
    const groups = parseQuadrantsFromRows([{ a: 'x' }], []);
    expect(groups).toHaveLength(4);
    expect(groups[0]).toEqual({ label: 'Q1', items: [] });
  });

  it('parseQuadrantsFromRows 仅 label 列无 items 列', () => {
    const groups = parseQuadrantsFromRows(
      [{ label: '象限A' }],
      [{ dataIndex: 'label' }],
    );
    expect(groups[0]).toEqual({ label: '象限A', items: [] });
  });
});
