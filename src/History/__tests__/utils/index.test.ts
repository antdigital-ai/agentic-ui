import { describe, expect, it } from 'vitest';
import { formatTime, getItemTimestamp, groupByCategory } from '../../utils';

describe('History utils', () => {
  describe('formatTime', () => {
    it('应在无 time 时返回空字符串', () => {
      expect(formatTime()).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(null as any)).toBe('');
      expect(formatTime(0)).toBe('');
    });
  });

  describe('getItemTimestamp', () => {
    it('缺失或 null gmtCreate 应返回 0', () => {
      expect(getItemTimestamp({})).toBe(0);
      expect(getItemTimestamp({ gmtCreate: undefined })).toBe(0);
      expect(getItemTimestamp({ gmtCreate: null as unknown as number })).toBe(
        0,
      );
    });

    it('number 应原样返回', () => {
      expect(getItemTimestamp({ gmtCreate: 1700000000000 })).toBe(
        1700000000000,
      );
    });

    it('Date / ISO 字符串应解析为毫秒时间戳', () => {
      const date = new Date('2024-01-15T08:00:00.000Z');
      expect(getItemTimestamp({ gmtCreate: date })).toBe(date.getTime());
      expect(getItemTimestamp({ gmtCreate: '2024-01-15T08:00:00.000Z' })).toBe(
        date.getTime(),
      );
    });

    it('无法解析的字符串应返回 0', () => {
      expect(getItemTimestamp({ gmtCreate: 'not-a-date' })).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    it('应按键分组并保持原顺序', () => {
      const list = [
        { id: 1, group: 'a' },
        { id: 2, group: 'b' },
        { id: 3, group: 'a' },
      ];
      expect(groupByCategory(list, (item) => item.group)).toEqual({
        a: [
          { id: 1, group: 'a' },
          { id: 3, group: 'a' },
        ],
        b: [{ id: 2, group: 'b' }],
      });
    });

    it('空列表应返回空对象', () => {
      expect(groupByCategory([], () => 'x')).toEqual({});
    });
  });
});
