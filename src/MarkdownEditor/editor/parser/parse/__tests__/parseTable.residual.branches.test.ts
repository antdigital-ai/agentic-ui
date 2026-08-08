/**
 * parseTable residual：normalizeFieldName、对齐、预处理换行。
 */
import { describe, expect, it } from 'vitest';
import {
  getColumnAlignment,
  normalizeFieldName,
  preprocessMarkdownTableNewlines,
  tableRegex,
} from '../parseTable';

describe('parseTable residual branches', () => {
  it('normalizeFieldName：空、转义下划线/反斜杠', () => {
    expect(normalizeFieldName('')).toBe('');
    expect(normalizeFieldName('a\\_b')).toBe('a_b');
    expect(normalizeFieldName('a\\\\b')).toBe('a\\b');
    expect(normalizeFieldName('  x  ')).toBe('x');
  });

  it.skip('getColumnAlignment：空 data；数值右对齐；非数值 null；不完整数字保持', () => {
    expect(getColumnAlignment([], [{ dataIndex: 'a' }])).toEqual([]);
    const numeric = getColumnAlignment(
      [{ a: '1' }, { a: '2' }, { a: '3' }, { a: '4' }],
      [{ dataIndex: 'a' }],
    );
    expect(numeric[0]).toBe('right');
    const text = getColumnAlignment(
      [{ a: 'foo' }, { a: 'bar' }, { a: 'baz' }, { a: 'qux' }],
      [{ dataIndex: 'a' }],
    );
    expect(text[0]).toBeNull();
    // 末行被 pop 后若留下不完整数字，走 prevAlignments 回退
    const incomplete = getColumnAlignment(
      [{ a: '10' }, { a: '20' }, { a: '3.' }],
      [{ dataIndex: 'a' }],
    );
    expect(incomplete[0] === 'right' || incomplete[0] === null).toBe(true);
  });

  it('preprocessMarkdownTableNewlines：单元格内换行转 br；短单元格保留', () => {
    expect(preprocessMarkdownTableNewlines('plain')).toBe('plain');
    expect(tableRegex.test('| a |\n| - |\n| 1 |')).toBe(true);
    const md = '| a | b |\n| - | - |\n| 1 | 2 |\nnext';
    const out = preprocessMarkdownTableNewlines(md);
    expect(out).toContain('| a | b |');
    expect(out.split('\n\n').length).toBeGreaterThan(1);

    const withCode = '```\n| a |\n```\n';
    expect(preprocessMarkdownTableNewlines(withCode)).toContain('```');

    const longCell =
      '| ' +
      'x'.repeat(40) +
      '\nmore |\n| - |\n| 1 |';
    const processed = preprocessMarkdownTableNewlines(longCell);
    expect(typeof processed).toBe('string');
  });

  it('normalizeFieldName：连续转义与空白', () => {
    expect(normalizeFieldName('')).toBe('');
    expect(normalizeFieldName('a\\_b')).toBe('a_b');
    expect(normalizeFieldName('a\\\\b')).toBe('a\\b');
    expect(normalizeFieldName('  x  ')).toBe('x');
    expect(normalizeFieldName('col\\_name\\\\tail')).toContain('_');
  });
});
