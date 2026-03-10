import { describe, expect, it } from 'vitest';
import { getReadonlyTableColWidths } from '../getTableColWidths';
import {
  TABLE_COL_WIDTH_MIN_COLUMNS,
  TABLE_DEFAULT_COL_WIDTH,
} from '../../../../../../Constants/mobile';

describe('getReadonlyTableColWidths', () => {
  it('显式传入 colWidths 时返回该值', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 3,
      otherProps: { colWidths: [100, 150, 200] },
    });
    expect(result).toEqual([100, 150, 200]);
  });

  it('colWidths 为空数组时回退到默认逻辑', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 6,
      otherProps: { colWidths: [] },
    });
    expect(result).toEqual(Array(6).fill(TABLE_DEFAULT_COL_WIDTH));
  });

  it('columnCount 为 0 时返回空数组', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 0,
      otherProps: {},
    });
    expect(result).toEqual([]);
  });

  it('1–4 列时返回百分比实现平分', () => {
    expect(getReadonlyTableColWidths({ columnCount: 1, otherProps: {} })).toEqual([
      '100.00%',
    ]);
    expect(getReadonlyTableColWidths({ columnCount: 2, otherProps: {} })).toEqual([
      '50.00%',
      '50.00%',
    ]);
    expect(getReadonlyTableColWidths({ columnCount: 3, otherProps: {} })).toEqual([
      '33.33%',
      '33.33%',
      '33.33%',
    ]);
    expect(getReadonlyTableColWidths({ columnCount: 4, otherProps: {} })).toEqual([
      '25.00%',
      '25.00%',
      '25.00%',
      '25.00%',
    ]);
  });

  it('5 列及以上时使用默认 120px', () => {
    const result = getReadonlyTableColWidths({
      columnCount: TABLE_COL_WIDTH_MIN_COLUMNS,
      otherProps: {},
    });
    expect(result).toHaveLength(TABLE_COL_WIDTH_MIN_COLUMNS);
    expect(result).toEqual(
      Array(TABLE_COL_WIDTH_MIN_COLUMNS).fill(TABLE_DEFAULT_COL_WIDTH),
    );
  });

  it('otherProps 缺失时按默认逻辑计算', () => {
    const result = getReadonlyTableColWidths({
      columnCount: 6,
      otherProps: undefined,
    });
    expect(result).toEqual(Array(6).fill(TABLE_DEFAULT_COL_WIDTH));
  });
});
