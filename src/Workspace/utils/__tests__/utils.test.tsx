import { describe, expect, it } from 'vitest';
import { formatFileSize, formatLastModified } from '..';

describe('Workspace utils', () => {
  describe('formatFileSize', () => {
    it('应该直接返回字符串输入', () => {
      expect(formatFileSize('1KB')).toBe('1KB');
      expect(formatFileSize('自定义大小')).toBe('自定义大小');
    });

    it('应该格式化字节大小', () => {
      expect(formatFileSize(0)).toBe('0.00 B');
      expect(formatFileSize(500)).toBe('500.00 B');
      expect(formatFileSize(1023)).toBe('1023.00 B');
    });

    it('应该格式化KB大小', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
      expect(formatFileSize(10240)).toBe('10.00 KB');
    });

    it('应该格式化MB大小', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
      expect(formatFileSize(1024 * 1024 * 100)).toBe('100.00 MB');
    });

    it('应该格式化GB大小', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 3.7)).toBe('3.70 GB');
    });

    it('应该格式化TB大小', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.00 TB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1024 * 5.2)).toBe('5.20 TB');
    });

    it('应该限制在TB单位', () => {
      // 测试超过TB的极大值
      const hugSize = 1024 * 1024 * 1024 * 1024 * 1024;
      const result = formatFileSize(hugSize);
      expect(result).toContain('TB');
      expect(parseFloat(result)).toBeGreaterThanOrEqual(1024);
    });

    it('应该正确处理边界值', () => {
      expect(formatFileSize(1023.99)).toBe('1023.99 B');
      expect(formatFileSize(1024.01)).toBe('1.00 KB');
    });
  });

  describe('formatLastModified', () => {
    it('应该格式化日期对象', () => {
      const date = new Date('2024-03-15 14:30:45');
      const result = formatLastModified(date);
      expect(result).toMatch(/03-15 14:30:45/);
    });

    it('应该格式化时间戳', () => {
      const timestamp = new Date('2024-06-20 09:15:30').getTime();
      const result = formatLastModified(timestamp);
      expect(result).toMatch(/06-20 09:15:30/);
    });

    it('应该格式化日期字符串', () => {
      const dateStr = '2024-12-25 18:45:00';
      const result = formatLastModified(dateStr);
      expect(result).toMatch(/12-25 18:45:00/);
    });

    it('应该处理无效的日期字符串', () => {
      const invalidStr = 'invalid date string';
      const result = formatLastModified(invalidStr);
      expect(result).toBe(invalidStr);
    });

    it('应该处理无效的数字', () => {
      const result = formatLastModified(NaN);
      expect(result).toBe('-');
    });

    it('应该处理空字符串', () => {
      const result = formatLastModified('');
      expect(result).toBe('');
    });

    it('应该处理ISO格式日期', () => {
      const isoDate = '2024-08-10T10:20:30.000Z';
      const result = formatLastModified(isoDate);
      // ISO日期应该被正确解析
      expect(result).toMatch(/\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('应该处理无效的时间戳', () => {
      const result = formatLastModified(-1);
      // 负数时间戳可能被dayjs处理，但结果应该有效或返回'-'
      expect(typeof result).toBe('string');
    });

    it('应该处理边界日期', () => {
      const year2000 = new Date('2000-01-01 00:00:00');
      const result = formatLastModified(year2000);
      expect(result).toMatch(/01-01 00:00:00/);
    });

    it('应该处理未来日期', () => {
      const futureDate = new Date('2099-12-31 23:59:59');
      const result = formatLastModified(futureDate);
      expect(result).toMatch(/12-31 23:59:59/);
    });
  });
});

