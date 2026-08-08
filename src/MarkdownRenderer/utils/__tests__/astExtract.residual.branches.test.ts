/**
 * astExtract residual：解除 skip 场景 + coerce 紧凑后缀失败臂。
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

describe('astExtract residual branches', () => {
  it('extractCellText：空/文本/递归/无 children', () => {
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
    ).toBe('a b');
  });

  it('coerce：紧凑后缀无效倍数 / + 后非数字保持原串', () => {
    expect(coerceTableCellValue('1.2z', noCn)).toBe('1.2z');
    expect(coerceTableCellValue('+abc', noCn)).toBe('+abc');
    expect(coerceTableCellValue('99%', noCn)).toBe(99);
  });

  it('extractTableData：空表/无表头/跳过无 children 行/越界单元格', () => {
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

  it('extractLanguage / extractChildrenText 边角', () => {
    expect(extractLanguageFromClassName(undefined)).toBeUndefined();
    expect(extractLanguageFromClassName(['foo', 'language-ts'])).toBe('ts');
    expect(extractLanguageFromClassName('no-lang')).toBeUndefined();
    expect(extractChildrenText(3)).toBe('3');
    expect(extractChildrenText(['a', 1])).toBe('a1');
    expect(
      extractChildrenText(
        React.createElement('span', null, 'nested'),
      ),
    ).toBe('nested');
    expect(extractChildrenText(null)).toBe('');
    const cn = vi.fn().mockReturnValue(null);
    expect(coerceTableCellValue('一万', cn)).toBe('一万');
  });
});
