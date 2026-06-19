import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';

describe('gfmTableLine', () => {
  describe('isGfmTableLine', () => {
    it('识别包含对齐标记的 GFM 表格分隔行', () => {
      expect(isGfmTableLine('|:---|:---:|---:|')).toBe(true);
    });

    it('拒绝普通文本行', () => {
      expect(isGfmTableLine('plain text with | pipe')).toBe(false);
    });
  });

  describe('endsInsideGfmTable', () => {
    it('忽略表格后的尾随空行', () => {
      expect(endsInsideGfmTable('| a | b |\n| - | - |\n\n')).toBe(true);
    });

    it('末尾为普通文本时返回 false', () => {
      expect(endsInsideGfmTable('| a | b |\nplain text')).toBe(false);
    });
  });
});
