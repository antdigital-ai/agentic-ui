import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatTime, getItemTimestamp, groupByCategory } from '../index';

describe('History utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTime', () => {
    it('应在无 time 时返回空字符串', () => {
      expect(formatTime()).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(null as unknown as undefined)).toBe('');
      expect(formatTime(0)).toBe('');
    });

    it('应返回当天文案', () => {
      const ts = dayjs('2024-06-15T08:00:00').valueOf();
      expect(formatTime(ts, { today: 'Today' })).toBe('Today');
      expect(formatTime(ts)).toBe('今日');
    });

    it('应返回昨天文案', () => {
      const ts = dayjs('2024-06-14T08:00:00').valueOf();
      expect(formatTime(ts, { yesterday: 'Yesterday' })).toBe('Yesterday');
      expect(formatTime(ts)).toBe('昨日');
    });

    it('应返回一周内文案', () => {
      const ts = dayjs('2024-06-08T08:00:00').valueOf();
      expect(formatTime(ts, { withinWeek: 'Within a week' })).toBe(
        'Within a week',
      );
      expect(formatTime(ts)).toBe('一周内');
    });

    it('更早时间应使用 fromNow', () => {
      const ts = dayjs('2024-01-01T08:00:00').valueOf();
      const result = formatTime(ts);
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe('今日');
    });
  });

  describe('getItemTimestamp', () => {
    it('缺失 gmtCreate 时返回 0', () => {
      expect(getItemTimestamp({})).toBe(0);
      expect(getItemTimestamp({ gmtCreate: undefined })).toBe(0);
      expect(getItemTimestamp({ gmtCreate: null as unknown as undefined })).toBe(
        0,
      );
    });

    it('数字时间戳原样返回', () => {
      expect(getItemTimestamp({ gmtCreate: 1234567890 })).toBe(1234567890);
    });

    it('字符串与 Date 应解析为毫秒', () => {
      const date = new Date('2024-06-15T08:00:00');
      expect(getItemTimestamp({ gmtCreate: '2024-06-15T08:00:00' })).toBe(
        dayjs('2024-06-15T08:00:00').valueOf(),
      );
      expect(getItemTimestamp({ gmtCreate: date })).toBe(date.getTime());
    });

    it('无法解析时返回 0', () => {
      expect(getItemTimestamp({ gmtCreate: 'invalid-date' })).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    it('应按分组键聚合并保持原顺序', () => {
      const list = [
        { id: 1, category: 'a' },
        { id: 2, category: 'b' },
        { id: 3, category: 'a' },
      ];

      const grouped = groupByCategory(list, (item) => item.category);

      expect(grouped).toEqual({
        a: [
          { id: 1, category: 'a' },
          { id: 3, category: 'a' },
        ],
        b: [{ id: 2, category: 'b' }],
      });
    });

    it('空数组应返回空对象', () => {
      expect(groupByCategory([], () => 'x')).toEqual({});
    });
  });
});
