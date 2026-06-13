import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';
import { shouldReparseLastBlock } from '../lastBlockThrottle';

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
});

describe('GFM table streaming detection', () => {
  it('识别包含对齐标记的 GFM 表格分隔行', () => {
    expect(isGfmTableLine('|:---|:---:|---:|')).toBe(true);
    expect(isGfmTableLine('| :--- | :---: | ---: |')).toBe(true);
  });

  it('从末尾扫描时跳过空行但不跨过非表格正文', () => {
    const tableWithTrailingBlankLine = [
      '| a | b |',
      '| - | - |',
      '| 1 | 2 |',
      '',
    ].join('\n');
    const tableFollowedByParagraph = `${tableWithTrailingBlankLine}\nsummary`;

    expect(endsInsideGfmTable(tableWithTrailingBlankLine)).toBe(true);
    expect(endsInsideGfmTable(tableFollowedByParagraph)).toBe(false);
  });
});
