import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  extractCellText,
  extractChildrenText,
  extractLanguageFromClassName,
  extractTableData,
} from '../../utils/astExtract';

/** 简易的中文金额转数字 stub：仅用于覆盖 extractTableData 的回退分支 */
const stubChineseCurrency = (val: string): number | null => {
  if (val === '一千') return 1000;
  return null;
};

describe('astExtract / extractCellText', () => {
  it('returns empty string when cell has no children', () => {
    expect(extractCellText(null)).toBe('');
    expect(extractCellText({})).toBe('');
    expect(extractCellText({ children: undefined })).toBe('');
  });

  it('joins text node values', () => {
    const cell = {
      children: [
        { type: 'text', value: 'hello' },
        { type: 'text', value: ' world' },
      ],
    };
    expect(extractCellText(cell)).toBe('hello world');
  });

  it('recurses into nested children', () => {
    const cell = {
      children: [
        { type: 'emphasis', children: [{ type: 'text', value: 'inner' }] },
        { type: 'text', value: ' outer' },
      ],
    };
    expect(extractCellText(cell)).toBe('inner outer');
  });

  it('trims surrounding whitespace', () => {
    const cell = {
      children: [{ type: 'text', value: '  padded  ' }],
    };
    expect(extractCellText(cell)).toBe('padded');
  });

  it('skips unknown node types without value', () => {
    const cell = {
      children: [{ type: 'unknown' }, { type: 'text', value: 'kept' }],
    };
    expect(extractCellText(cell)).toBe('kept');
  });
});

describe('astExtract / extractTableData', () => {
  it('returns null when table has no header row', () => {
    expect(extractTableData({ children: [] }, stubChineseCurrency)).toBeNull();
    expect(
      extractTableData({ children: [{ children: [] }] }, stubChineseCurrency),
    ).toBeNull();
  });

  it('extracts columns and dataSource with numeric coercion', () => {
    const tableNode = {
      children: [
        {
          children: [
            { children: [{ type: 'text', value: 'name' }] },
            { children: [{ type: 'text', value: 'value' }] },
          ],
        },
        {
          children: [
            { children: [{ type: 'text', value: 'a' }] },
            { children: [{ type: 'text', value: '10' }] },
          ],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result).not.toBeNull();
    expect(result!.columns).toEqual([
      { title: 'name', dataIndex: 'name', key: 'name' },
      { title: 'value', dataIndex: 'value', key: 'value' },
    ]);
    expect(result!.dataSource).toHaveLength(1);
    expect(result!.dataSource[0]).toMatchObject({
      key: 'row-1',
      name: 'a',
      value: 10,
    });
  });

  it('falls back to chinese currency parser when number coercion fails', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'amount' }] }],
        },
        {
          children: [{ children: [{ type: 'text', value: '一千' }] }],
        },
        {
          children: [{ children: [{ type: 'text', value: 'xx' }] }],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].amount).toBe(1000);
    // currency parser 返回 null 时保留原字符串
    expect(result!.dataSource[1].amount).toBe('xx');
  });

  it('keeps empty string for empty cell value', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'col' }] }],
        },
        {
          children: [{ children: [] }],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].col).toBe('');
  });

  it('skips rows without children', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'col' }] }],
        },
        null,
        { children: undefined },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource).toHaveLength(0);
  });

  /**
   * 千分位数字识别：表头 `销售额(元)` 单元格写 `8,287.44` / `29,337.76` 时
   * 应被解析为 number，而不是字符串，否则 ChartRenderer 无法用 row[y] 取数。
   */
  it('parses thousand-separated numbers like "8,287.44" and "29,337.76"', () => {
    const tableNode = {
      children: [
        {
          children: [
            { children: [{ type: 'text', value: 'category' }] },
            { children: [{ type: 'text', value: 'amount' }] },
          ],
        },
        {
          children: [
            { children: [{ type: 'text', value: '休闲食品' }] },
            { children: [{ type: 'text', value: '29,337.76' }] },
          ],
        },
        {
          children: [
            { children: [{ type: 'text', value: '个人清洁' }] },
            { children: [{ type: 'text', value: '8,287.44' }] },
          ],
        },
        {
          children: [
            { children: [{ type: 'text', value: '香烟' }] },
            { children: [{ type: 'text', value: '10,575' }] },
          ],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].amount).toBe(29337.76);
    expect(result!.dataSource[1].amount).toBe(8287.44);
    expect(result!.dataSource[2].amount).toBe(10575);
  });

  it('parses negative thousand-separated numbers', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'delta' }] }],
        },
        {
          children: [{ children: [{ type: 'text', value: '-1,234.56' }] }],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].delta).toBe(-1234.56);
  });

  it('parses thousand-separated numbers using full-width comma', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'amount' }] }],
        },
        {
          children: [{ children: [{ type: 'text', value: '1，234.5' }] }],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].amount).toBe(1234.5);
  });

  it('parses loose grouped numbers like "12,3456" and "1,2,3456"', () => {
    // 放宽规则：仅要求最后一段 ≥ 3 位数字
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'amount' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '12,3456' }] }] },
        { children: [{ children: [{ type: 'text', value: '1,2,3456' }] }] },
        { children: [{ children: [{ type: 'text', value: '1,234,567' }] }] },
        { children: [{ children: [{ type: 'text', value: '-12,3456.78' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].amount).toBe(123456);
    expect(result!.dataSource[1].amount).toBe(123456);
    expect(result!.dataSource[2].amount).toBe(1234567);
    expect(result!.dataSource[3].amount).toBe(-123456.78);
  });

  it('does not misidentify when last segment is shorter than 3 digits', () => {
    // 末段 < 3 位 / 含非数字 → 走 currency 回退 → 仍 null → 保留原字符串
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'col' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '1,2' }] }] },
        { children: [{ children: [{ type: 'text', value: '12,34' }] }] },
        { children: [{ children: [{ type: 'text', value: '1,2,3' }] }] },
        { children: [{ children: [{ type: 'text', value: '1,234,abc' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].col).toBe('1,2');
    expect(result!.dataSource[1].col).toBe('12,34');
    expect(result!.dataSource[2].col).toBe('1,2,3');
    expect(result!.dataSource[3].col).toBe('1,234,abc');
  });

  it('keeps existing fallbacks: plain numeric, chinese currency, raw string', () => {
    // 同时验证三条解析路径互不影响
    const tableNode = {
      children: [
        {
          children: [
            { children: [{ type: 'text', value: 'a' }] },
            { children: [{ type: 'text', value: 'b' }] },
            { children: [{ type: 'text', value: 'c' }] },
          ],
        },
        {
          children: [
            { children: [{ type: 'text', value: '42' }] }, // 走 Number
            { children: [{ type: 'text', value: '一千' }] }, // 走 chinese currency stub
            { children: [{ type: 'text', value: 'NA' }] }, // 全部失败 → 保留字符串
          ],
        },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0]).toMatchObject({ a: 42, b: 1000, c: 'NA' });
  });

  /**
   * 百分比识别：保留字面值（12.5% → 12.5），不做 /100 转换。
   * 这样 chart y 轴显示百分比时不会被错误缩放。
   */
  it('parses percent values keeping the literal numeric part', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'rate' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '12.5%' }] }] },
        { children: [{ children: [{ type: 'text', value: '-3%' }] }] },
        { children: [{ children: [{ type: 'text', value: '+12,345.6%' }] }] },
        { children: [{ children: [{ type: 'text', value: '100 %' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].rate).toBe(12.5);
    expect(result!.dataSource[1].rate).toBe(-3);
    expect(result!.dataSource[2].rate).toBe(12345.6);
    expect(result!.dataSource[3].rate).toBe(100);
  });

  it('parses leading-plus numbers and combines with thousand separators', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'val' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '+3.14' }] }] },
        { children: [{ children: [{ type: 'text', value: '+1,234' }] }] },
        { children: [{ children: [{ type: 'text', value: '+12,3456.78' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].val).toBe(3.14);
    expect(result!.dataSource[1].val).toBe(1234);
    expect(result!.dataSource[2].val).toBe(123456.78);
  });

  /**
   * 英文紧凑后缀：k = 1e3, m = 1e6, b = 1e9, t = 1e12（大小写均可）。
   */
  it('parses English compact suffixes (k/m/b/t, case-insensitive)', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'val' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '1.2k' }] }] },
        { children: [{ children: [{ type: 'text', value: '3M' }] }] },
        { children: [{ children: [{ type: 'text', value: '-2.5B' }] }] },
        { children: [{ children: [{ type: 'text', value: '+1,234t' }] }] },
        { children: [{ children: [{ type: 'text', value: '5 K' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].val).toBe(1200);
    expect(result!.dataSource[1].val).toBe(3_000_000);
    expect(result!.dataSource[2].val).toBe(-2_500_000_000);
    expect(result!.dataSource[3].val).toBe(1_234_000_000_000_000);
    expect(result!.dataSource[4].val).toBe(5000);
  });

  it('rejects malformed compact / percent strings and keeps them as raw text', () => {
    // 非法形态应一路走到最后保留原字符串（除非命中 chinese currency stub）
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'col' }] }],
        },
        // 紧凑后缀后还跟内容 → 不命中
        { children: [{ children: [{ type: 'text', value: '3M.5' }] }] },
        // 不在 k/m/b/t 集合内 → 不命中
        { children: [{ children: [{ type: 'text', value: '1.2x' }] }] },
        // 双 % → 不命中
        { children: [{ children: [{ type: 'text', value: '12%%' }] }] },
        // ++ 前缀 → 防御递归后保留原值
        { children: [{ children: [{ type: 'text', value: '++1' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].col).toBe('3M.5');
    expect(result!.dataSource[1].col).toBe('1.2x');
    expect(result!.dataSource[2].col).toBe('12%%');
    expect(result!.dataSource[3].col).toBe('++1');
  });

  it('parses chinese compact units like "1.5万" / "2亿" via injected parser', () => {
    // 用真正的中文金额解析器 stub，覆盖 1.5万 / 2亿 路径
    const richChineseCurrency = (val: string): number | null => {
      const wan = val.match(/^(-?\d+(?:\.\d+)?)\s*万$/);
      if (wan) return Number(wan[1]) * 10_000;
      const yi = val.match(/^(-?\d+(?:\.\d+)?)\s*亿$/);
      if (yi) return Number(yi[1]) * 100_000_000;
      return null;
    };
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'val' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '1.5万' }] }] },
        { children: [{ children: [{ type: 'text', value: '2亿' }] }] },
      ],
    };
    const result = extractTableData(tableNode, richChineseCurrency);
    expect(result!.dataSource[0].val).toBe(15_000);
    expect(result!.dataSource[1].val).toBe(200_000_000);
  });

  /**
   * 裸科学计数法应直接走 `Number(val)` 路径，无需特殊处理。
   */
  it('parses bare scientific notation via Number()', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'val' }] }],
        },
        { children: [{ children: [{ type: 'text', value: '1.2e3' }] }] },
        { children: [{ children: [{ type: 'text', value: '+1.2e3' }] }] },
        { children: [{ children: [{ type: 'text', value: '-3.14E+10' }] }] },
        { children: [{ children: [{ type: 'text', value: '1e-5' }] }] },
        { children: [{ children: [{ type: 'text', value: '1E0' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].val).toBe(1200);
    expect(result!.dataSource[1].val).toBe(1200);
    expect(result!.dataSource[2].val).toBe(-3.14e10);
    expect(result!.dataSource[3].val).toBe(1e-5);
    expect(result!.dataSource[4].val).toBe(1);
  });

  /**
   * 科学计数法可与百分比 / 紧凑后缀组合使用。
   */
  it('parses scientific notation combined with percent / compact suffix', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'val' }] }],
        },
        // 1.2e2 = 120 → 百分比保留字面值 → 120
        { children: [{ children: [{ type: 'text', value: '1.2e2%' }] }] },
        // 1.5e3 = 1500 → 紧凑后缀 k → 1500 * 1000
        { children: [{ children: [{ type: 'text', value: '1.5e3k' }] }] },
        // -2.5E3 = -2500 → 紧凑后缀 M → -2500 * 1e6
        { children: [{ children: [{ type: 'text', value: '-2.5E3M' }] }] },
        // 带正号 + 科学计数 + k
        { children: [{ children: [{ type: 'text', value: '+1.5e2k' }] }] },
        // 科学计数 + 负指数 + 百分比
        { children: [{ children: [{ type: 'text', value: '1e-2%' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].val).toBe(120);
    expect(result!.dataSource[1].val).toBe(1_500_000);
    expect(result!.dataSource[2].val).toBe(-2.5e9);
    expect(result!.dataSource[3].val).toBe(150_000);
    expect(result!.dataSource[4].val).toBe(0.01);
  });

  /**
   * 残缺的科学计数法格式不应被识别为数字。
   */
  it('rejects malformed scientific notation strings', () => {
    const tableNode = {
      children: [
        {
          children: [{ children: [{ type: 'text', value: 'col' }] }],
        },
        // 指数缺位
        { children: [{ children: [{ type: 'text', value: '1e' }] }] },
        // 双 e
        { children: [{ children: [{ type: 'text', value: '1.2ee3' }] }] },
        // 缺底数
        { children: [{ children: [{ type: 'text', value: 'e3' }] }] },
        // 指数缺位 + %
        { children: [{ children: [{ type: 'text', value: '1e%' }] }] },
        // 指数缺位 + k
        { children: [{ children: [{ type: 'text', value: '1ek' }] }] },
      ],
    };
    const result = extractTableData(tableNode, stubChineseCurrency);
    expect(result!.dataSource[0].col).toBe('1e');
    expect(result!.dataSource[1].col).toBe('1.2ee3');
    expect(result!.dataSource[2].col).toBe('e3');
    expect(result!.dataSource[3].col).toBe('1e%');
    expect(result!.dataSource[4].col).toBe('1ek');
  });
});

describe('astExtract / extractLanguageFromClassName', () => {
  it('returns undefined for missing className', () => {
    expect(extractLanguageFromClassName(undefined)).toBeUndefined();
  });

  it('extracts language from `language-xxx`', () => {
    expect(extractLanguageFromClassName('language-typescript')).toBe(
      'typescript',
    );
  });

  it('handles className arrays', () => {
    expect(
      extractLanguageFromClassName(['hljs', 'language-json']),
    ).toBe('json');
  });

  it('returns undefined when no language- class is present', () => {
    expect(extractLanguageFromClassName('hljs other')).toBeUndefined();
  });
});

describe('astExtract / extractChildrenText', () => {
  it('returns string children directly', () => {
    expect(extractChildrenText('hello')).toBe('hello');
  });

  it('stringifies number children', () => {
    expect(extractChildrenText(42)).toBe('42');
  });

  it('joins array of mixed children', () => {
    expect(extractChildrenText(['a', 1, 'b'])).toBe('a1b');
  });

  it('recurses into React element props.children', () => {
    const el = React.createElement('span', null, 'inner');
    expect(extractChildrenText(el)).toBe('inner');
  });

  it('returns empty string for null/undefined/booleans', () => {
    expect(extractChildrenText(null)).toBe('');
    expect(extractChildrenText(undefined)).toBe('');
    expect(extractChildrenText(true as unknown as React.ReactNode)).toBe('');
  });
});
