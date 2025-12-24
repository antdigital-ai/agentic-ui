import dayjs from 'dayjs';
import React from 'react';
import { HistoryDataType } from '../types/HistoryData';
import { HistoryListConfig } from '../types/HistoryList';
import { formatTime, groupByCategory } from '../utils';
import { HistoryItem } from './HistoryItem';

/**
 * 生成历史记录菜单项
 *
 * 该函数将历史记录数据转换为菜单项格式，支持分组、排序、自定义格式化等功能。
 *
 * @function
 * @description 生成历史记录菜单项，支持分组和排序
 * @param {HistoryListConfig} config - 配置参数
 * @param {HistoryDataType[]} config.filteredList - 过滤后的历史记录列表
 * @param {string[]} config.selectedIds - 选中的记录ID列表
 * @param {Function} config.onSelectionChange - 选择状态变化回调
 * @param {Function} config.onSelected - 选择记录回调
 * @param {Function} [config.onDeleteItem] - 删除记录回调
 * @param {Function} [config.onFavorite] - 收藏记录回调
 * @param {Object} [config.agent] - Agent配置
 * @param {Function} [config.extra] - 额外渲染函数
 * @param {Function} [config.customDateFormatter] - 自定义日期格式化函数
 * @param {Function} [config.groupBy] - 自定义分组函数
 * @param {Function|boolean} [config.sessionSort] - 自定义排序函数
 * @param {string[]} [config.runningId] - 正在运行的记录ID列表
 *
 * @example
 * ```tsx
 * const menuItems = generateHistoryItems({
 *   filteredList: historyData,
 *   selectedIds: selectedIds,
 *   onSelectionChange: handleSelectionChange,
 *   onSelected: handleSelected,
 *   onDeleteItem: handleDelete,
 *   onFavorite: handleFavorite,
 *   agent: { enabled: true },
 *   customDateFormatter: (date) => dayjs(date).format('YYYY-MM-DD'),
 *   runningId: ['task-1', 'task-2']
 * });
 * ```
 *
 * @returns {Array} 生成的菜单项数组
 *
 * @remarks
 * - 支持按日期自动分组
 * - 支持自定义分组逻辑
 * - 支持自定义排序规则
 * - 支持自定义日期格式化
 * - 集成HistoryItem组件渲染
 * - 支持多选和收藏功能
 * - 支持运行状态图标显示
 */
export const generateHistoryItems = ({
  filteredList,
  selectedIds,
  onSelectionChange,
  onClick,
  onDeleteItem,
  agent,
  onFavorite,
  extra,
  customDateFormatter,
  groupBy,
  sessionSort,
  groupLabelRender,
  type,
  runningId,
  customOperationExtra,
  itemDateFormatter,
}: HistoryListConfig) => {
  const groupList = groupByCategory(
    filteredList || [],
    (item: HistoryDataType) => {
      if (groupBy) {
        return groupBy(item);
      }
      return formatTime(item.gmtCreate as number);
    },
  );

  // 对分组进行排序，按每个分组中最新记录的时间倒序排列
  const sortedGroupKeys = Object.entries(groupList)
    .map(([key, list]) => ({
      key,
      maxTime: Math.max(
        ...list.map((item) => +dayjs(item.gmtCreate) || 0),
      ),
    }))
    .sort((a, b) => b.maxTime - a.maxTime)
    .map(({ key }) => key);

  const items = sortedGroupKeys.map((key) => {
    const list = groupList[key];
    const firstItem = list?.at(0);
    const label =
      customDateFormatter && firstItem?.gmtCreate
        ? customDateFormatter(firstItem.gmtCreate)
        : formatTime(firstItem?.gmtCreate as number);
    return {
      key: `group-${key}`,
      type: 'group' as const,
      label: groupLabelRender ? groupLabelRender(key, list, label) : label,
      children: list
        ?.sort((a: HistoryDataType, b: HistoryDataType) => {
          if (sessionSort === false) {
            return 0;
          }
          if (sessionSort) {
            const result = sessionSort(a, b);
            return typeof result === 'boolean' ? 0 : result;
          }
          // 使用 +dayjs() 并提供 0 作为 NaN 的回退值，确保排序稳定
          const timeB = +dayjs(b.gmtCreate) || 0;
          const timeA = +dayjs(a.gmtCreate) || 0;
          return timeB - timeA;
        })
        ?.map((item: HistoryDataType) => {
          return {
            key: item.sessionId || `item-${item.id}`,
            type: 'item' as const,
            label: (
              <HistoryItem
                item={item}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                onClick={onClick}
                onDeleteItem={onDeleteItem}
                agent={agent}
                onFavorite={onFavorite}
                extra={extra}
                type={type}
                runningId={runningId}
                customOperationExtra={customOperationExtra}
                itemDateFormatter={itemDateFormatter}
              />
            ),
          };
        }),
    };
  });

  return items;
};
