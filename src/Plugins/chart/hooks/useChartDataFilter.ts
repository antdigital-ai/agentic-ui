import { useEffect, useMemo, useState } from 'react';
import { ChartDataItem, getDataHash } from '../utils';

const EMPTY_DATA: ChartDataItem[] = [];

/**
 * 图表数据筛选 Hook
 *
 * 用于管理图表数据的筛选逻辑，包括分类筛选和 filterLabel 筛选。
 * 自动处理数据变化时的筛选状态重置。
 *
 * @param {ChartDataItem[]} data - 原始数据数组
 * @returns {object} 包含筛选后的数据、筛选选项和筛选状态的对象
 *
 * @example
 * ```typescript
 * const {
 *   filteredData,
 *   categories,
 *   filterOptions,
 *   filterLabels,
 *   selectedFilter,
 *   setSelectedFilter,
 *   selectedFilterLabel,
 *   setSelectedFilterLabel,
 *   filteredDataByFilterLabel,
 * } = useChartDataFilter(data);
 * ```
 *
 * @since 1.0.0
 */
export const useChartDataFilter = (data: ChartDataItem[]) => {
  const safeData = Array.isArray(data) ? data : EMPTY_DATA;

  // 使用数据哈希来优化依赖项比较
  const dataHash = useMemo(() => getDataHash(safeData), [safeData]);

  // 从数据中提取唯一的类别作为筛选选项
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(safeData.map((item) => item.category)),
    ].filter((category): category is string => Boolean(category));
    return uniqueCategories;
  }, [safeData]);

  // 从数据中提取 filterLabel，过滤掉 undefined 值
  const validFilterLabels = useMemo(() => {
    return safeData
      .map((item) => item.filterLabel)
      .filter(
        (filterLabel): filterLabel is string => filterLabel !== undefined,
      );
  }, [safeData]);

  const filterLabels = useMemo(() => {
    return validFilterLabels.length > 0
      ? [...new Set(validFilterLabels)]
      : undefined;
  }, [validFilterLabels]);

  // 状态管理
  const [selectedFilter, setSelectedFilter] = useState<string>(
    categories[0] || '',
  );
  const [selectedFilterLabel, setSelectedFilterLabel] = useState(
    filterLabels?.[0],
  );

  // 当数据变化导致当前选中分类失效时，自动回退到首个有效分类或空（显示全部）
  useEffect(() => {
    if (selectedFilter && !categories.includes(selectedFilter)) {
      setSelectedFilter(categories[0] || '');
    }
  }, [categories, selectedFilter]);

  // 同步 filterLabel 选中态：失效或 filterLabels 消失时清空，避免残留无效筛选
  useEffect(() => {
    if (!filterLabels || filterLabels.length === 0) {
      if (selectedFilterLabel !== undefined) {
        setSelectedFilterLabel(undefined);
      }
      return;
    }
    if (selectedFilterLabel && !filterLabels.includes(selectedFilterLabel)) {
      setSelectedFilterLabel(undefined);
    }
  }, [filterLabels, selectedFilterLabel]);

  const resolvedFilterLabel = useMemo(() => {
    if (!filterLabels?.length || !selectedFilterLabel) {
      return undefined;
    }
    return filterLabels.includes(selectedFilterLabel)
      ? selectedFilterLabel
      : undefined;
  }, [filterLabels, selectedFilterLabel]);

  // 筛选数据
  const filteredData = useMemo(() => {
    const base = selectedFilter
      ? safeData.filter((item) => item.category === selectedFilter)
      : safeData;

    const withFilterLabel =
      !filterLabels || !resolvedFilterLabel
        ? base
        : base.filter((item) => item.filterLabel === resolvedFilterLabel);

    // 统一过滤掉 x 为空（null/undefined）的数据，避免后续 toString 报错
    return withFilterLabel.filter(
      (item) => item.x !== null && item.x !== undefined,
    );
  }, [dataHash, selectedFilter, filterLabels, resolvedFilterLabel, safeData]);

  // 筛选器选项
  const filterOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category,
      value: category,
    }));
  }, [categories]);

  // 根据 filterLabel 筛选数据 - 只有当 filterLabels 存在时才生成
  const filteredDataByFilterLabel = useMemo(() => {
    return filterLabels?.map((item) => ({
      key: item,
      label: item,
    }));
  }, [filterLabels]);

  return {
    filteredData,
    categories,
    filterOptions,
    filterLabels,
    selectedFilter,
    setSelectedFilter,
    selectedFilterLabel,
    setSelectedFilterLabel,
    filteredDataByFilterLabel,
    safeData,
  };
};
