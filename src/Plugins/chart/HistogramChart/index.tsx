import { ConfigProvider } from 'antd';
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartStatistic from '../ChartStatistic';
import {
  ChartContainer,
  ChartContainerProps,
  ChartFilter,
  ChartToolBar,
  downloadChart,
} from '../components';
import { defaultColorList } from '../const';
import { StatisticConfigType } from '../hooks/useChartStatistic';
import type { ChartClassNames, ChartStyles } from '../types/classNames';
import { hexToRgba, resolveCssVariable } from '../utils';
import { useStyle } from './style';

let histogramChartComponentsRegistered = false;

/**
 * 直方图数据项接口
 */
export interface HistogramChartDataItem {
  /** 原始数据值 */
  value: number;
  /** 数据系列（用于分组显示） */
  type?: string;
  /** 分类（用于筛选） */
  category?: string;
  /** 筛选标签 */
  filterLabel?: string;
}

export interface HistogramChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: HistogramChartDataItem[];
  /** 图表标题 */
  title?: string;
  /** 图表宽度，默认600px */
  width?: number | string;
  /** 图表高度，默认400px */
  height?: number | string;
  /** 自定义CSS类名 */
  className?: string;
  /** 自定义CSS类名（支持对象格式，为每层DOM设置类名） */
  classNames?: ChartClassNames;
  /** 数据时间 */
  dataTime?: string;
  /** 图表主题 */
  theme?: 'dark' | 'light';
  /** 自定义主色 */
  color?: string | string[];
  /** 是否显示图例，默认true */
  showLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  /** 是否显示网格线，默认true */
  showGrid?: boolean;
  /** X轴标签 */
  xAxisLabel?: string;
  /** Y轴标签 */
  yAxisLabel?: string;
  /** 是否堆叠显示，默认true */
  stacked?: boolean;
  /** 自定义分箱数量（不设置则自动计算） */
  binCount?: number;
  /** 是否显示频率而非计数 */
  showFrequency?: boolean;
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** 是否将过滤器渲染到工具栏 */
  renderFilterInToolbar?: boolean;
  /** ChartStatistic组件配置 */
  statistic?: StatisticConfigType;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 自定义样式对象 */
  styles?: ChartStyles;
}

/**
 * 计算 Sturges 规则的分箱数量
 * k = ceil(log2(n) + 1)
 */
function calculateBinCount(n: number): number {
  if (n <= 0) return 1;
  return Math.ceil(Math.log2(n) + 1);
}

/**
 * 计算分箱边界
 */
function calculateBinEdges(
  values: number[],
  binCount: number,
): { edges: number[]; min: number; max: number } {
  if (values.length === 0) {
    return { edges: [], min: 0, max: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  // 如果所有值相同，创建一个默认范围
  if (min === max) {
    const edge = min;
    return {
      edges: [edge - 0.5, edge + 0.5],
      min: edge - 0.5,
      max: edge + 0.5,
    };
  }

  const range = max - min;
  const binWidth = range / binCount;

  const edges: number[] = [];
  for (let i = 0; i <= binCount; i++) {
    edges.push(min + i * binWidth);
  }

  return { edges, min, max };
}

/**
 * 格式化分箱标签
 */
function formatBinLabel(start: number, end: number): string {
  const formatNum = (n: number) => {
    if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) {
      return n.toExponential(1);
    }
    return n.toFixed(2);
  };
  return `${formatNum(start)} - ${formatNum(end)}`;
}

const HistogramChart: React.FC<HistogramChartProps> = ({
  title,
  data,
  width = 600,
  height = 400,
  className,
  classNames: classNamesProp,
  style,
  styles,
  dataTime,
  theme = 'light',
  color,
  showLegend = true,
  legendPosition = 'bottom',
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  stacked = true,
  binCount: customBinCount,
  showFrequency = false,
  toolbarExtra,
  renderFilterInToolbar = false,
  statistic: statisticConfig,
  loading = false,
  ...props
}) => {
  // 注册 Chart.js 组件
  useMemo(() => {
    if (histogramChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
    histogramChartComponentsRegistered = true;
    return undefined;
  }, []);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('histogram-chart');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  // 处理 ChartStatistic 组件配置
  const statistics = useMemo(() => {
    if (!statisticConfig) return null;
    if (Array.isArray(statisticConfig) && statisticConfig.length === 0)
      return null;
    return Array.isArray(statisticConfig) ? statisticConfig : [statisticConfig];
  }, [statisticConfig]);

  // 响应式尺寸计算
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768,
  );
  const isMobile = windowWidth <= 768;
  const responsiveWidth = isMobile ? '100%' : width;
  const responsiveHeight = isMobile ? Math.min(windowWidth * 0.8, 400) : height;

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const chartRef = useRef<ChartJS<'bar'>>(null);

  // 数据安全检查
  const safeData = Array.isArray(data) ? data : [];

  // 从数据中提取分类
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(safeData.map((item) => item?.category)),
    ].filter(Boolean);
    return uniqueCategories;
  }, [safeData]);

  // 从数据中提取 filterLabel
  const validFilterLabels = useMemo(() => {
    return safeData
      .map((item) => item?.filterLabel)
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
    categories.find(Boolean) || '',
  );
  const [selectedFilterLabel, setSelectedFilterLabel] = useState(
    filterLabels && filterLabels.length > 0 ? filterLabels[0] : undefined,
  );

  // 当数据变化导致当前选中分类失效时，自动回退
  useEffect(() => {
    if (selectedFilter && !categories.includes(selectedFilter)) {
      setSelectedFilter(categories.find(Boolean) || '');
    }
  }, [categories, selectedFilter]);

  // 筛选数据
  const filteredData = useMemo(() => {
    const base = selectedFilter
      ? safeData.filter((item) => item.category === selectedFilter)
      : safeData;

    const withFilterLabel =
      !filterLabels || !selectedFilterLabel
        ? base
        : base.filter((item) => item.filterLabel === selectedFilterLabel);

    return withFilterLabel.filter(
      (item) =>
        item && typeof item.value === 'number' && Number.isFinite(item.value),
    );
  }, [safeData, selectedFilter, filterLabels, selectedFilterLabel]);

  // 从数据中提取唯一的类型
  const types = useMemo(() => {
    const allTypes = filteredData.map((item) => item.type).filter(Boolean);
    return allTypes.length > 0 ? [...new Set(allTypes)] : ['默认'];
  }, [filteredData]);

  // 计算分箱
  const binning = useMemo(() => {
    if (filteredData.length === 0) {
      return { edges: [], labels: [], binCount: 0 };
    }

    const allValues = filteredData.map((item) => item.value);
    const autoBinCount = customBinCount || calculateBinCount(allValues.length);
    const { edges } = calculateBinEdges(allValues, autoBinCount);

    // 生成分箱标签
    const labels: string[] = [];
    for (let i = 0; i < edges.length - 1; i++) {
      labels.push(formatBinLabel(edges[i], edges[i + 1]));
    }

    return { edges, labels, binCount: autoBinCount };
  }, [filteredData, customBinCount]);

  // 计算每个分箱的频率/计数
  const histogramData = useMemo(() => {
    const { edges, labels } = binning;
    if (edges.length === 0 || types.length === 0) {
      return {};
    }

    const result: Record<string, number[]> = {};

    types.forEach((type) => {
      if (!type) return; // Skip undefined types
      const typeData = filteredData.filter(
        (item) => (item.type || '默认') === type,
      );
      const counts = new Array(labels.length).fill(0);

      typeData.forEach((item) => {
        const value = item.value;
        // 找到所属分箱
        for (let i = 0; i < edges.length - 1; i++) {
          if (
            value >= edges[i] &&
            (value < edges[i + 1] || i === edges.length - 2)
          ) {
            counts[i]++;
            break;
          }
        }
      });

      // 如果需要显示频率而非计数
      if (showFrequency && typeData.length > 0) {
        const total = typeData.length;
        result[type] = counts.map((c) => c / total);
      } else {
        result[type] = counts;
      }
    });

    return result;
  }, [filteredData, types, binning, showFrequency]);

  // 构建 Chart.js 数据结构
  const processedData: ChartData<'bar'> = useMemo(() => {
    const { labels } = binning;
    if (labels.length === 0) {
      return { labels: [], datasets: [] };
    }

    const datasets = types.map((type, index) => {
      if (!type) return null;
      const provided = color;
      const pickByIndex = (i: number) =>
        Array.isArray(provided)
          ? provided[i] ||
            provided[0] ||
            defaultColorList[i % defaultColorList.length]
          : provided || defaultColorList[i % defaultColorList.length];
      const baseColor = pickByIndex(index);

      const resolvedBaseColor = resolveCssVariable(baseColor);

      return {
        label: type,
        data: histogramData[type] || [],
        backgroundColor: hexToRgba(resolvedBaseColor, 0.6),
        borderColor: resolvedBaseColor,
        borderWidth: 1,
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        stack: stacked ? 'stack' : undefined,
        borderRadius: 4,
        borderSkipped: false,
      };
    });

    return {
      labels,
      datasets: datasets.filter((d): d is NonNullable<typeof d> => d !== null),
    };
  }, [histogramData, types, binning, color, stacked]);

  const isLight = theme === 'light';
  const axisTextColor = isLight
    ? 'rgba(0, 25, 61, 0.3255)'
    : 'rgba(255, 255, 255, 0.8)';
  const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)';

  // 图表配置选项
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend && types.length > 1,
        position: legendPosition,
        labels: {
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
          padding: isMobile ? 10 : 12,
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      tooltip: {
        backgroundColor: isLight
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(0,0,0,0.85)',
        titleColor: isLight ? '#333' : '#fff',
        bodyColor: isLight ? '#333' : '#fff',
        borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        cornerRadius: isMobile ? 6 : 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${(value ?? 0).toFixed(showFrequency ? 4 : 0)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel || '值范围',
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
        },
        grid: {
          display: showGrid,
          color: gridColor,
          lineWidth: 1,
        },
        ticks: {
          color: axisTextColor,
          font: { size: isMobile ? 8 : 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        stacked,
        beginAtZero: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel || (showFrequency ? '频率' : '计数'),
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
        },
        grid: {
          display: showGrid,
          color: gridColor,
          lineWidth: 1,
        },
        ticks: {
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12 },
        },
      },
    },
    animation: {
      duration: isMobile ? 200 : 400,
    },
  };

  const handleDownload = () => {
    downloadChart(chartRef.current, 'histogram-chart');
  };

  // 筛选器选项
  const filterOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category || '默认',
      value: category || '默认',
    }));
  }, [categories]);

  const filteredDataByFilterLabel = useMemo(() => {
    return filterLabels?.map((item) => ({
      key: item,
      label: item,
    }));
  }, [filterLabels]);

  // 空数据处理
  if (safeData.length === 0 || filteredData.length === 0) {
    return wrapSSR(
      <ChartContainer
        baseClassName={classNames(`${prefixCls}-container`, hashId)}
        theme={theme}
        className={classNames(classNamesProp?.root, className)}
        isMobile={isMobile}
        variant={props.variant}
        style={{
          width: responsiveWidth,
          height: responsiveHeight,
          ...style,
          ...styles?.root,
        }}
      >
        <ChartToolBar
          title={title || '直方图'}
          onDownload={() => {}}
          extra={toolbarExtra}
          dataTime={dataTime}
          loading={loading}
        />
        <div
          className={classNames(`${prefixCls}-empty-wrapper`, hashId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: responsiveHeight,
            color: '#999',
            fontSize: '14px',
          }}
        >
          暂无有效数据
        </div>
      </ChartContainer>,
    );
  }

  return wrapSSR(
    <ChartContainer
      baseClassName={classNames(`${prefixCls}-container`, hashId)}
      theme={theme}
      className={classNames(classNamesProp?.root, className)}
      isMobile={isMobile}
      variant={props.variant}
      style={{
        width: responsiveWidth,
        height: responsiveHeight,
        ...style,
        ...styles?.root,
      }}
    >
      <ChartToolBar
        title={title || '直方图'}
        theme={theme}
        onDownload={handleDownload}
        extra={toolbarExtra}
        dataTime={dataTime}
        loading={loading}
        filter={
          renderFilterInToolbar && filterOptions.length > 1 ? (
            <ChartFilter
              filterOptions={filterOptions}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              {...(filterLabels && {
                customOptions: filteredDataByFilterLabel,
                selectedCustomSelection: selectedFilterLabel,
                onSelectionChange: setSelectedFilterLabel,
              })}
              theme={theme}
              variant="compact"
            />
          ) : undefined
        }
      />

      {statistics && (
        <div
          className={classNames(
            classNamesProp?.statisticContainer,
            `${prefixCls}-statistic-container`,
          )}
          style={styles?.statisticContainer}
        >
          {statistics.map((config, index) => (
            <ChartStatistic key={index} {...config} theme={theme} />
          ))}
        </div>
      )}

      {!renderFilterInToolbar && filterOptions.length > 1 && (
        <ChartFilter
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          {...(filterLabels && {
            customOptions: filteredDataByFilterLabel,
            selectedCustomSelection: selectedFilterLabel,
            onSelectionChange: setSelectedFilterLabel,
          })}
          theme={theme}
        />
      )}

      <div
        className={classNames(classNamesProp?.wrapper, `${prefixCls}-wrapper`)}
        style={{
          height: responsiveHeight,
          ...styles?.wrapper,
        }}
      >
        <Bar ref={chartRef} data={processedData} options={options} />
      </div>
    </ChartContainer>,
  );
};

export default HistogramChart;
