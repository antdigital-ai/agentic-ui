import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// 显式注册 relativeTime 插件以启用 dayjs().fromNow()，
// 取代之前 `@ts-ignore + ?.fromNow?.()` 的隐式依赖（一旦上游没注册插件就会静默返回 undefined）。
dayjs.extend(relativeTime);

/**
 * 用于覆盖 formatTime 输出的可选 i18n 文案。
 * 全部可选；未提供时回落到默认中文。
 */
export interface FormatTimeLocale {
  /** 当天 */
  today?: string;
  /** 昨天 */
  yesterday?: string;
  /** 一周内 */
  withinWeek?: string;
}

/**
 * 格式化时间显示
 *
 * @param time 时间戳或时间字符串
 * @param locale 可选的文案覆盖，用于 i18n。未传时回落到中文默认值。
 * @returns 格式化后的时间字符串；time 为空时返回空串
 */
export const formatTime = (
  time?: number | string,
  locale?: FormatTimeLocale,
): string => {
  if (!time) {
    return '';
  }
  const target = dayjs(time);
  const now = dayjs();

  if (now.isSame(target, 'day')) {
    return locale?.today ?? '今日';
  }
  if (now.isSame(target.add(1, 'day'), 'day')) {
    return locale?.yesterday ?? '昨日';
  }
  if (now.isSame(target.add(7, 'day'), 'day')) {
    return locale?.withinWeek ?? '一周内';
  }
  return target.fromNow();
};

/**
 * 把 HistoryDataType.gmtCreate 安全地转成毫秒时间戳。
 *
 * `gmtCreate` 在类型定义里是 `number | string | Date | undefined`，
 * 之前在多处直接 `item.gmtCreate as number` 强转，既不安全也无法表达"缺失"语义。
 * 这里集中处理：缺失返回 `0`（dayjs 会回落到 epoch），其它走 `dayjs.valueOf()`。
 *
 * @param item 历史记录数据项；只读取 `gmtCreate` 字段
 * @returns 毫秒时间戳；缺失或无法解析时返回 0
 */
export const getItemTimestamp = (item: {
  gmtCreate?: number | string | Date;
}): number => {
  const raw = item.gmtCreate;
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return raw;
  const t = dayjs(raw).valueOf();
  return Number.isNaN(t) ? 0 : t;
};

/**
 * 按指定键对数组进行分组（保持原顺序）。
 *
 * 单遍 reduce 实现，对每个元素调用一次 `getCategoryKey` 计算分组键，
 * 同一键下的元素按原数组中的相对顺序追加到对应分组数组末尾。
 *
 * 典型用法是按日期分组历史记录：
 * ```ts
 * groupByCategory(historyList, (item) => formatTime(getItemTimestamp(item)));
 * // => { '今日': [...], '昨日': [...], '一周内': [...], '2024-01-01': [...] }
 * ```
 *
 * 时间复杂度 O(n)，空间复杂度 O(n)。返回的对象未做特殊排序，
 * 调用方如需按分组键排序请在拿到结果后自行 `Object.keys(...).sort(...)`。
 *
 * @template T 数组元素类型
 * @param list 要分组的数组；为空数组时返回空对象 `{}`
 * @param getCategoryKey 分组键计算函数；返回相同字符串的元素归入同组
 * @returns 分组后的对象，键为分组名，值为该分组下的元素数组（按原顺序）
 */
export const groupByCategory = <T>(
  list: T[],
  getCategoryKey: (item: T) => string,
): Record<string, T[]> => {
  return list.reduce(
    (prev, curr) => {
      const group = getCategoryKey(curr);
      if (!prev[group]) {
        prev[group] = [];
      }
      prev[group].push(curr);
      return prev;
    },
    {} as Record<string, T[]>,
  );
};
