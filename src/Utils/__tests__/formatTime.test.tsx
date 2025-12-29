import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatTime } from '@ant-design/agentic-ui/Utils/formatTime';

describe('formatTime', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  describe('测试环境下', () => {
    it('应该返回固定的测试时间', () => {
      process.env.NODE_ENV = 'test';
      const result = formatTime(Date.now());
      expect(result).toBe('2024-02-27 17:20:00');
    });
  });

  describe('非测试环境下', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('同一天内应该只显示时分秒', () => {
      // 设置当前时间为 2024-07-14 15:30:00
      vi.spyOn(dayjs.prototype, 'isSame').mockImplementation(function (
        this: any,
        time: any,
        unit: any,
      ) {
        if (unit === 'day') {
          return dayjs(this._d || this).format('YYYY-MM-DD') === '2024-07-14';
        }
        if (unit === 'year') {
          return dayjs(this._d || this).format('YYYY') === '2024';
        }
        return false;
      });

      const sameDay = dayjs('2024-07-14 10:15:30').valueOf();
      const result = formatTime(sameDay);
      expect(result).toBe('10:15:30');
    });

    it('同一年内不同天应该显示月-日 时:分:秒', () => {
      vi.spyOn(dayjs.prototype, 'isSame').mockImplementation(function (
        this: any,
        time: any,
        unit: any,
      ) {
        if (unit === 'day') {
          return false; // 不是同一天
        }
        if (unit === 'year') {
          return dayjs(this._d || this).format('YYYY') === '2024';
        }
        return false;
      });

      const differentDay = dayjs('2024-06-15 08:45:20').valueOf();
      const result = formatTime(differentDay);
      expect(result).toBe('06-15 08:45:20');
    });

    it('不同年份应该显示完整的年-月-日 时:分:秒', () => {
      vi.spyOn(dayjs.prototype, 'isSame').mockImplementation(function (
        this: any,
        time: any,
        unit: any,
      ) {
        if (unit === 'day') {
          return false; // 不是同一天
        }
        if (unit === 'year') {
          return false; // 不是同一年
        }
        return false;
      });

      const differentYear = dayjs('2023-12-25 22:10:05').valueOf();
      const result = formatTime(differentYear);
      expect(result).toBe('2023-12-25 22:10:05');
    });

    it('应该正确处理0时刻的时间', () => {
      vi.spyOn(dayjs.prototype, 'isSame').mockImplementation(function (
        this: any,
        time: any,
        unit: any,
      ) {
        if (unit === 'day') {
          return (
            dayjs(this._d || this).format('YYYY-MM-DD') ===
            dayjs().format('YYYY-MM-DD')
          );
        }
        if (unit === 'year') {
          return (
            dayjs(this._d || this).format('YYYY') === dayjs().format('YYYY')
          );
        }
        return false;
      });

      const midnightToday = dayjs().startOf('day').valueOf();
      const result = formatTime(midnightToday);
      expect(result).toBe('00:00:00');
    });
  });

  describe('真实时间测试（无mock）', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('应该正确处理当前时间', () => {
      const now = Date.now();
      const result = formatTime(now);
      // 当前时间应该只显示时分秒
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('应该正确处理一年前的时间', () => {
      const oneYearAgo = dayjs().subtract(1, 'year').valueOf();
      const result = formatTime(oneYearAgo);
      // 一年前的时间应该显示完整格式
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('应该正确处理一周前的时间', () => {
      const oneWeekAgo = dayjs().subtract(1, 'week').valueOf();
      const result = formatTime(oneWeekAgo);
      // 一周前的时间应该显示月-日格式
      expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('应该正确处理未来时间', () => {
      const futureTime = dayjs().add(2, 'hour').valueOf();
      const result = formatTime(futureTime);
      // 未来时间，根据是否同一天来判断格式
      // 如果是同一天，显示时分秒；如果是第二天，显示月-日格式
      const now = dayjs();
      const future = dayjs(futureTime);
      if (future.isSame(now, 'day')) {
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      } else if (future.isSame(now, 'year')) {
        expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      } else {
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      }
    });
  });

  describe('边界情况测试', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('应该正确处理特定时间戳', () => {
      const timestamp = 1689336600000; // 2023-07-14 15:30:00 UTC
      const result = formatTime(timestamp);
      // 结果应该是有效的时间格式
      expect(result).toMatch(
        /^\d{2}:\d{2}:\d{2}$|^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$|^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      );
    });

    it('应该正确处理0时间戳', () => {
      const result = formatTime(0);
      // Unix 纪元时间应该显示完整格式
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('应该正确处理极大的时间戳', () => {
      const largeTimestamp = 4102444800000; // 2100-01-01
      const result = formatTime(largeTimestamp);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('参数验证', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('应该接受有效的数字时间戳', () => {
      expect(() => formatTime(Date.now())).not.toThrow();
      expect(() => formatTime(0)).not.toThrow();
      expect(() => formatTime(1689336600000)).not.toThrow();
    });

    it('返回值应该是字符串类型', () => {
      const result = formatTime(Date.now());
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
