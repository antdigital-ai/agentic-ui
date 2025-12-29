import React from 'react';
import { MOBILE_MAX_CHART_SIZE } from './constants';
import { DonutChartData } from './types';

export const useMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, windowWidth } as const;
};

export const useResponsiveDimensions = (
  isMobile: boolean,
  windowWidth: number,
  width: number | string,
  height: number | string,
) => {
  if (isMobile) {
    const mobileWidth = Math.min(
      windowWidth - 40,
      Number(width),
      MOBILE_MAX_CHART_SIZE,
    );
    const mobileHeight = Math.min(
      windowWidth - 40,
      Number(height),
      MOBILE_MAX_CHART_SIZE,
    );
    return {
      width: mobileWidth,
      height: mobileHeight,
      chartWidth: mobileWidth,
      chartHeight: mobileHeight,
    } as const;
  }
  return {
    width,
    height,
    chartWidth: width,
    chartHeight: height,
  } as const;
};

export const useFilterLabels = (data: DonutChartData[]) => {
  const validFilterLabels = React.useMemo(() => {
    return data
      .map((item) => item.filterLabel)
      .filter(
        (filterLabel): filterLabel is string => filterLabel !== undefined,
      );
  }, [data]);

  const filterLabels = React.useMemo(() => {
    return validFilterLabels.length > 0
      ? [...new Set(validFilterLabels)]
      : undefined;
  }, [validFilterLabels]);

  const [selectedFilterLabel, setSelectedFilterLabel] = React.useState<
    string | undefined
  >(filterLabels && filterLabels.length > 0 ? filterLabels[0] : undefined);

  // 当 data 变化导致 filterLabels 变化时，自动纠正选中项，避免残留无效选择
  React.useEffect(() => {
    if (!filterLabels || filterLabels.length === 0) {
      if (selectedFilterLabel !== undefined) {
        setSelectedFilterLabel(undefined);
      }
      return;
    }
    if (!selectedFilterLabel || !filterLabels.includes(selectedFilterLabel)) {
      setSelectedFilterLabel(filterLabels[0]);
    }
  }, [filterLabels]);

  const filteredDataByFilterLabel = React.useMemo(() => {
    return filterLabels?.map((item) => ({ key: item, label: item }));
  }, [filterLabels]);

  return {
    filterLabels,
    filteredDataByFilterLabel,
    selectedFilterLabel,
    setSelectedFilterLabel,
  } as const;
};

export const useAutoCategory = (
  data: DonutChartData[],
  enableAutoCategory: boolean,
  externalSelectedFilter?: string,
) => {
  const autoCategoryData = React.useMemo(() => {
    if (!enableAutoCategory || !data) {
      return null;
    }

    const allData = data;
    const categories = [
      ...new Set(allData.map((item) => item.category).filter(Boolean)),
    ];

    if (categories.length <= 1) {
      return null;
    }

    return {
      categories,
      allData,
    } as const;
  }, [data, enableAutoCategory]);

  const [internalSelectedCategory, setInternalSelectedCategory] =
    React.useState<string>('');

  // 初始化：当存在多类目时，选中第一个有效类目
  React.useEffect(() => {
    if (autoCategoryData && !internalSelectedCategory) {
      setInternalSelectedCategory(
        autoCategoryData.categories.find(Boolean) || '',
      );
    }
  }, [autoCategoryData, internalSelectedCategory]);

  // 当自动分类关闭或类目不足（autoCategoryData 为空）时，清理内部选中项，避免残留影响
  React.useEffect(() => {
    if (!enableAutoCategory || !autoCategoryData) {
      if (internalSelectedCategory) {
        setInternalSelectedCategory('');
      }
    }
  }, [enableAutoCategory, autoCategoryData]);

  const selectedCategory = externalSelectedFilter || internalSelectedCategory;

  return {
    autoCategoryData,
    internalSelectedCategory,
    setInternalSelectedCategory,
    selectedCategory,
  } as const;
};
