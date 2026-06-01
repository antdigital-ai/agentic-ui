import { useContext, useMemo } from 'react';
import { I18nContext } from '../../I18n';
import type { FormatTimeLocale } from '../utils';

/**
 * 从 I18nContext 中读取 chat.history.time.* 系列文案，
 * 组装成 `formatTime(timestamp, locale)` 所需的 `FormatTimeLocale` 对象。
 *
 * 之前在 HistoryItem (单行 + 多行) 与 HistoryList 三处分别写了一份完全相同的
 * `useContext(I18nContext) + useMemo([locale])` 样板，存在以下问题：
 * 1. 任何一处漏改 i18n key 都会导致 fallback 不一致
 * 2. useMemo 依赖只写了 `[locale]`，但实际只关心 `chat.history.time.*` 三个字段
 * 3. 三处重复 = 三次维护成本
 *
 * 抽到独立 hook 后，调用点只需 `const formatTimeLocale = useFormatTimeLocale();`，
 * 内部统一保证：
 * - 仅读取真正使用的 3 个 i18n key（语义清晰）
 * - 引用稳定（相同 locale 下 useMemo 复用）
 * - 任何字段缺失时由 `formatTime` 内部 fallback 到中文默认值
 *
 * @returns 可直接传给 `formatTime` 的 i18n 文案对象
 */
export const useFormatTimeLocale = (): FormatTimeLocale => {
  const { locale } = useContext(I18nContext);
  return useMemo(
    () => ({
      today: locale?.['chat.history.time.today'],
      yesterday: locale?.['chat.history.time.yesterday'],
      withinWeek: locale?.['chat.history.time.withinWeek'],
    }),
    [locale],
  );
};
