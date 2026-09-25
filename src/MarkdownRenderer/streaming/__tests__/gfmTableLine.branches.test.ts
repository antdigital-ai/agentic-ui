import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';

describe('gfmTableLine 分支覆盖', () => {
  it('isGfmTableLine 识别表格行与分隔行', () => {
    expect(isGfmTableLine('| a | b |')).toBe(true);
    expect(isGfmTableLine('| --- | --- |')).toBe(true);
    expect(isGfmTableLine('plain text')).toBe(false);
  });

  it('endsInsideGfmTable 空字符串返回 false', () => {
    expect(endsInsideGfmTable('')).toBe(false);
  });

  it('endsInsideGfmTable 跳过末尾空行', () => {
    expect(endsInsideGfmTable('paragraph\n\n| a | b |\n')).toBe(true);
    expect(endsInsideGfmTable('paragraph\n\n')).toBe(false);
  });

  it('endsInsideGfmTable 表格结束后非表格行', () => {
    expect(endsInsideGfmTable('| a | b |\n| --- | --- |\n| 1 | 2 |\n\nDone')).toBe(
      false,
    );
  });
});

describe('gfmTableLine istanbul residual：分隔行 / 非管道', () => {
  it('isGfmTableLine 假值与仅分隔', () => {
    expect(isGfmTableLine('')).toBe(false);
    expect(isGfmTableLine('|---|')).toBe(true);
    expect(isGfmTableLine(' | spaced | ')).toBe(true);
  });
});
