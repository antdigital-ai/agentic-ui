/**
 * astExtract 分支：单元格/表格/语言/children 提取与 coerce。
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  coerceTableCellValue,
  extractCellText,
  extractChildrenText,
  extractLanguageFromClassName,
  extractTableData,
} from '../astExtract';

const noCn = () => null;

describe('astExtract branches', () => {
  it.skip('extractCellText：空/文本/递归/无 children', () => {
    expect(extractCellText(null)).toBe('');
    expect(extractCellText({})).toBe('');
    expect(
      extractCellText({
        children: [
          { type: 'text', value: ' a ' },
          { type: 'text' },
          { type: 'emphasis', children: [{ type: 'text', value: 'b' }] },
          { type: 'break' },
        ],
      }),
    ).toBe('ab');
  });

  it('coerceTableCellValue：空、数字、+前缀、千分位、%、紧凑后缀、中文', () => {
    expect(coerceTableCellValue('', noCn)).toBe('');
    expect(coerceTableCellValue('42', noCn)).toBe(42);
    expect(coerceTableCellValue('+1,234', noCn)).toBe(1234);
    expect(coerceTableCellValue('++1', noCn)).toBe('++1');
    expect(coerceTableCellValue('+-1', noCn)).toBe('+-1');
    expect(coerceTableCellValue('8,287.44', noCn)).toBe(8287.44);
    expect(coerceTableCellValue('12.5%', noCn)).toBe(12.5);
    expect(coerceTableCellValue('1.2k', noCn)).toBe(1200);
    expect(coerceTableCellValue('3M', noCn)).toBe(3e6);
    expect(coerceTableCellValue('hello', noCn)).toBe('hello');
    const cn = vi.fn().mockReturnValue(15000);
    expect(coerceTableCellValue('1.5万', cn)).toBe(15000);
    expect(coerceTableCellValue('x万', () => null)).toBe('x万');
  });

  it.skip('extractTableData：空表/无表头/跳过无 children 行/越界单元格', () => {
    expect(extractTableData(null, noCn)).toBeNull();
    expect(extractTableData({ children: [] }, noCn)).toBeNull();
    expect(
      extractTableData({ children: [{ children: [] }] }, noCn),
    ).toBeNull();

    const table = {
      children: [
        {
          children: [
            { children: [{ type: 'text', value: 'A' }] },
            { children: [{ type: 'text', value: 'B' }] },
          ],
        },
        null,
        {
          children: [
            { children: [{ type: 'text', value: '1' }] },
            { children: [{ type: 'text', value: '2' }] },
            { children: [{ type: 'text', value: 'extra' }] },
          ],
        },
        {},
      ],
    };
    const result = extractTableData(table, noCn);
    expect(result?.columns).toHaveLength(2);
    expect(result?.dataSource).toHaveLength(1);
    expect(result?.dataSource[0]).toMatchObject({ A: 1, B: 2 });
  });

  it('extractLanguageFromClassName：undefined/string/array/无 language', () => {
    expect(extractLanguageFromClassName(undefined)).toBeUndefined();
    expect(extractLanguageFromClassName('')).toBeUndefined();
    expect(extractLanguageFromClassName('language-ts')).toBe('ts');
    expect(extractLanguageFromClassName(['foo', 'language-js'])).toBe('js');
    expect(extractLanguageFromClassName('plain')).toBeUndefined();
  });

  it('extractChildrenText：string/number/array/element/空', () => {
    expect(extractChildrenText('hi')).toBe('hi');
    expect(extractChildrenText(3)).toBe('3');
    expect(extractChildrenText(['a', 1])).toBe('a1');
    expect(
      extractChildrenText(
        React.createElement('span', null, 'nested'),
      ),
    ).toBe('nested');
    expect(extractChildrenText(null)).toBe('');
    expect(extractChildrenText(React.createElement('br'))).toBe('');
  });

  it('extractCellText 递归；coerce + 前缀再解析', () => {
    expect(
      extractCellText({
        children: [
          { type: 'text', value: '' },
          {
            type: 'strong',
            children: [{ type: 'text', value: '42' }],
          },
        ],
      }),
    ).toMatch(/42/);
    expect(coerceTableCellValue('+42', noCn)).toBe(42);
    expect(coerceTableCellValue('+', noCn)).toBe('+');
  });
});
