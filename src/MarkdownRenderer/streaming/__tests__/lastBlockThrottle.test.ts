import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';
import { shouldReparseLastBlock } from '../lastBlockThrottle';

describe('gfmTableLine', () => {
  it('recognizes aligned GFM separator rows as table lines', () => {
    expect(isGfmTableLine('|:---|:---:|---:|')).toBe(true);
    expect(isGfmTableLine('  | --- | --- |  ')).toBe(true);
  });

  it('keeps trailing blank lines in table streaming context', () => {
    const source = '| a | b |\n| --- | --- |\n| 1 | 2 |\n\n';
    expect(endsInsideGfmTable(source)).toBe(true);
  });

  it('stops table streaming context after ordinary text', () => {
    const source = '| a | b |\n| --- | --- |\n| 1 | 2 |\n\nplain text';
    expect(endsInsideGfmTable(source)).toBe(false);
  });
});

describe('shouldReparseLastBlock', () => {
  it('流式末块在未闭合围栏内应每帧重 parse', () => {
    const prev = '```json\n{"value":1';
    const next = '```json\n{"value":12';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块围栏外仍可按字符节流', () => {
    const prev = 'hello';
    const next = 'hello world';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('围栏闭合后恢复节流', () => {
    const prev = '```js\nx\n```\n';
    const next = '```js\nx\n```\nmore';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内不因 | 或 - 立即重 parse', () => {
    const prev = '| a | b |\n| - | - |\n| 1';
    const next = '| a | b |\n| - | - |\n| 1 |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内换行仍立即重 parse', () => {
    const prev = '| a | b |';
    const next = '| a | b |\n| - | - |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块离开 GFM 表格后不再忽略 | 边界符', () => {
    const prev = '| a | b |\n| - | - |\n| 1 | 2 |\n\nplain';
    const next = '| a | b |\n| - | - |\n| 1 | 2 |\n\nplain |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });
});
