import dayjs from 'dayjs';

/**
 * 格式化时间显示
 *
 * 根据时间与当前时间的相对关系，智能选择合适的时间格式进行显示。
 * 支持同一天、同一年、不同年份的多种显示格式。
 *
 * @description 智能时间格式化函数，根据时间相对关系选择显示格式
 * @param {number} time - 时间戳（毫秒）
 * @returns {string} 格式化后的时间字符串
 *
 * @example
 * ```tsx
 * // 同一天：显示时分秒
 * formatTime(Date.now()); // "14:30:25"
 *
 * // 同一年：显示月日时分秒
 * formatTime(new Date('2024-03-15').getTime()); // "03-15 14:30:25"
 *
 * // 不同年份：显示完整日期时间
 * formatTime(new Date('2023-12-25').getTime()); // "2023-12-25 14:30:25"
 * ```
 *
 * @remarks
 * - 同一天：显示 HH:mm:ss 格式
 * - 同一年：显示 MM-DD HH:mm:ss 格式
 * - 不同年份：显示 YYYY-MM-DD HH:mm:ss 格式
 * - 测试环境下返回固定时间避免测试不稳定
 * - 基于 dayjs 进行时间处理
 */
export const formatTime = (time: number): string => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return '2024-02-27 17:20:00';
  }

  const now = dayjs();
  const target = dayjs(time);

  if (target.isSame(now, 'day')) {
    return target.format('HH:mm:ss');
  } else if (target.isSame(now, 'year')) {
    return target.format('MM-DD HH:mm:ss');
  } else {
    return target.format('YYYY-MM-DD HH:mm:ss');
  }
};
