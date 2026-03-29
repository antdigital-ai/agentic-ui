import dayjs from 'dayjs';
import React from 'react';
import { MenuItemType } from '../menu';
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
}: HistoryListConfig): MenuItemType[] => {
  const groupList = groupByCategory(
    filteredList || [],
    (item: HistoryDataType) => {
      if (groupBy) {
        return groupBy(item);
      }
      return formatTime(item.gmtCreate as number);
    },
  );

  const groupMaxTimes = Object.fromEntries(
    Object.entries(groupList).map(([key, list]) => [
      key,
      Math.max(...list.map((item) => dayjs(item.gmtCreate).valueOf())),
    ]),
  );

  const MIN_GROUP_SIZE = 3;

  // 按照时间顺序对分组进行排序：今日 > 昨日 > 一周内 > 其他
  const sortedGroupKeys = Object.keys(groupList).sort(
    (keyA, keyB) => (groupMaxTimes[keyB] || 0) - (groupMaxTimes[keyA] || 0),
  );

  const buildItemNodes = (list: HistoryDataType[]) =>
    list
      .sort((a, b) => {
        if (sessionSort === false) return 0;
        if (sessionSort) {
          const result = sessionSort(a, b);
          return typeof result === 'boolean' ? 0 : result;
        }
        return dayjs(b.gmtCreate).valueOf() - dayjs(a.gmtCreate).valueOf();
      })
      .map((item) => ({
        key: item.sessionId || `item-${item.id}`,
        type: 'item' as const,
        onClick: () => {
          if (!item.sessionId) return;
          onClick(item.sessionId, item);
        },
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
      }));

  const items: MenuItemType[] = sortedGroupKeys.flatMap((key): MenuItemType[] => {
    const list = groupList[key];

    // 少于最小数量时，直接平铺为普通条目，不展示分组标题
    if (list.length < MIN_GROUP_SIZE) {
      return buildItemNodes(list);
    }

    const firstItem = list.at(0);
    const label =
      customDateFormatter && firstItem?.gmtCreate
        ? customDateFormatter(firstItem.gmtCreate)
        : formatTime(firstItem?.gmtCreate as number);

    return [
      {
        key: `group-${key}`,
        type: 'group' as const,
        label: groupLabelRender ? groupLabelRender(key, list, label) : label,
        children: buildItemNodes(list),
      },
    ];
  });

  return items;
};
