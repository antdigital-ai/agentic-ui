/**
 * History utils 分支覆盖：formatTime、getItemTimestamp、groupByCategory。
 */
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { formatTime, getItemTimestamp, groupByCategory } from '../utils';

describe('History utils branches', () => {
  describe('formatTime', () => {
    it('time 为空返回空串', () => {
      expect(formatTime()).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(0)).toBe('');
    });

    it('当天返回 today 文案', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-03T12:00:00Z'));
      try {
        expect(formatTime(Date.now())).toBe('今日');
        expect(formatTime(Date.now(), { today: 'Today' })).toBe('Today');
      } finally {
        vi.useRealTimers();
      }
    });

    it('昨天返回 yesterday 文案', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-03T12:00:00Z'));
      try {
        const yesterday = dayjs().subtract(1, 'day').valueOf();
        expect(formatTime(yesterday)).toBe('昨日');
        expect(formatTime(yesterday, { yesterday: 'Yesterday' })).toBe(
          'Yesterday',
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it('恰好七日前返回 withinWeek 文案', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-03T12:00:00Z'));
      try {
        const sevenDaysAgo = dayjs().subtract(7, 'day').valueOf();
        expect(formatTime(sevenDaysAgo)).toBe('一周内');
        expect(formatTime(sevenDaysAgo, { withinWeek: 'This week' })).toBe(
          'This week',
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it('更早时间走 fromNow', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-08-03T12:00:00Z'));
      try {
        const old = dayjs().subtract(30, 'day').valueOf();
        expect(formatTime(old)).toContain('ago');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('getItemTimestamp', () => {
    it('缺失 gmtCreate 返回 0', () => {
      expect(getItemTimestamp({})).toBe(0);
      expect(getItemTimestamp({ gmtCreate: null as unknown as undefined })).toBe(
        0,
      );
    });

    it('number 直接返回', () => {
      expect(getItemTimestamp({ gmtCreate: 12345 })).toBe(12345);
    });

    it('Date / string 走 dayjs', () => {
      const d = new Date('2026-01-01T00:00:00Z');
      expect(getItemTimestamp({ gmtCreate: d })).toBe(d.valueOf());
      expect(getItemTimestamp({ gmtCreate: '2026-01-01' })).toBeTruthy();
    });

    it('无法解析时返回 0', () => {
      expect(getItemTimestamp({ gmtCreate: 'not-a-date' })).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    it('空数组返回空对象', () => {
      expect(groupByCategory([], () => 'k')).toEqual({});
    });

    it('同键元素归入同组并保持顺序', () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const grouped = groupByCategory(list, (item) =>
        item.id <= 2 ? 'a' : 'b',
      );
      expect(grouped.a?.map((x) => x.id)).toEqual([1, 2]);
      expect(grouped.b?.map((x) => x.id)).toEqual([3]);
    });

    it('首次出现键创建新数组', () => {
      const grouped = groupByCategory([{ v: 'x' }], () => 'solo');
      expect(grouped.solo).toHaveLength(1);
    });
  });
});
