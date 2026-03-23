import {
  BoxAndWiskers,
  BoxPlotController,
} from '@sgratzl/chartjs-chart-boxplot';
import { ConfigProvider } from 'antd';
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Chart } from 'react-chartjs-2';
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

let boxPlotChartComponentsRegistered = false;

/**
 * 箱线图数据项接口
 *
 * 传入原始数据数组，组件自动计算统计值
 */
export interface BoxPlotChartDataItem {
  /** X轴标签 */
  label: string;
  /** 原始数据值数组 */
  values: number[];
  /** 数据系列（用于分组显示） */
  type?: string;
  /** 分类（用于筛选） */
  category?: string;
  /** 筛选标签 */
  filterLabel?: string;
}

export interface BoxPlotChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: BoxPlotChartDataItem[];
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
  /** 是否显示异常点 */
  showOutliers?: boolean;
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
 * 计算箱线图统计值
 */
function calculateBoxPlotStats(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  outliers: number[];
} {
  if (!values || values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, outliers: [] };
  }

  // 过滤有效数值并排序
  const sorted = values
    .filter((v) => typeof v === 'number' && Number.isFinite(v))
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, outliers: [] };
  }

  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  // 计算四分位数
  const q1Index = Math.floor(n * 0.25);
  const medianIndex = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sorted[q1Index];
  const median = sorted[medianIndex];
  const q3 = sorted[q3Index];

  // 计算 IQR 和异常值边界
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // 找出非异常值的范围
  const nonOutliers = sorted.filter((v) => v >= lowerBound && v <= upperBound);
  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  const min = nonOutliers.length > 0 ? Math.min(...nonOutliers) : sorted[0];
  const max = nonOutliers.length > 0 ? Math.max(...nonOutliers) : sorted[n - 1];

  return { min, q1, median, q3, max, mean, outliers };
}

const BoxPlotChart: React.FC<BoxPlotChartProps> = ({
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
  showOutliers = true,
  toolbarExtra,
  renderFilterInToolbar = false,
  statistic: statisticConfig,
  loading = false,
  ...props
}) => {
  // 注册 Chart.js 组件
  useMemo(() => {
    if (boxPlotChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
      BoxPlotController,
      BoxAndWiskers,
    );
    boxPlotChartComponentsRegistered = true;
    return undefined;
  }, []);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('boxplot-chart');
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

  const chartRef = useRef<any>(null);

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
        item &&
        item.label !== null &&
        item.label !== undefined &&
        item.label !== '',
    );
  }, [safeData, selectedFilter, filterLabels, selectedFilterLabel]);

  // 从数据中提取唯一的类型
  const types = useMemo(() => {
    return [...new Set(filteredData.map((item) => item.type))].filter(Boolean);
  }, [filteredData]);

  // 从数据中提取唯一的标签
  const labels = useMemo(() => {
    return [...new Set(filteredData.map((item) => item.label))];
  }, [filteredData]);

  // 构建 Chart.js 数据结构
  const processedData = useMemo(() => {
    const datasets = types.map((type, index) => {
      const provided = color;
      const pickByIndex = (i: number) =>
        Array.isArray(provided)
          ? provided[i] ||
            provided[0] ||
            defaultColorList[i % defaultColorList.length]
          : provided || defaultColorList[i % defaultColorList.length];
      const baseColor = pickByIndex(index);

      // 解析 CSS 变量为实际颜色值
      const resolvedBaseColor = resolveCssVariable(baseColor);

      // 为每个标签收集数据
      const typeData = labels.map((label) => {
        const dataPoint = filteredData.find(
          (item) => item.label === label && item.type === type,
        );
        if (!dataPoint || !dataPoint.values || dataPoint.values.length === 0) {
          return null;
        }

        const stats = calculateBoxPlotStats(dataPoint.values);
        return {
          min: stats.min,
          q1: stats.q1,
          median: stats.median,
          q3: stats.q3,
          max: stats.max,
          mean: stats.mean,
          ...(showOutliers && stats.outliers.length > 0
            ? { outliers: stats.outliers }
            : {}),
        };
      });

      return {
        label: type || '默认',
        data: typeData,
        backgroundColor: hexToRgba(resolvedBaseColor, 0.5),
        borderColor: resolvedBaseColor,
        borderWidth: 1,
        outlierColor: hexToRgba(resolvedBaseColor, 0.8),
        padding: 10,
        itemRadius: showOutliers ? 3 : 0,
      };
    });

    // 如果没有类型分组，创建默认数据集
    if (datasets.length === 0) {
      const boxplotData = labels.map((label) => {
        const dataPoint = filteredData.find((item) => item.label === label);
        if (!dataPoint || !dataPoint.values || dataPoint.values.length === 0) {
          return null;
        }

        const stats = calculateBoxPlotStats(dataPoint.values);
        return {
          min: stats.min,
          q1: stats.q1,
          median: stats.median,
          q3: stats.q3,
          max: stats.max,
          mean: stats.mean,
          ...(showOutliers && stats.outliers.length > 0
            ? { outliers: stats.outliers }
            : {}),
        };
      });

      const resolvedColor = resolveCssVariable(defaultColorList[0]);
      datasets.push({
        label: '默认',
        data: boxplotData,
        backgroundColor: hexToRgba(resolvedColor, 0.5),
        borderColor: resolvedColor,
        borderWidth: 1,
        outlierColor: hexToRgba(resolvedColor, 0.8),
        padding: 10,
        itemRadius: showOutliers ? 3 : 0,
      });
    }

    return { labels, datasets };
  }, [filteredData, types, labels, color, showOutliers]);

  const isLight = theme === 'light';
  const axisTextColor = isLight
    ? 'rgba(0, 25, 61, 0.3255)'
    : 'rgba(255, 255, 255, 0.8)';
  const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)';

  // 图表配置选项
  const options: ChartOptions<'boxplot'> = {
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
            const raw = context.raw as any;
            if (!raw) return '';
            const lines = [
              `最大值: ${raw.max?.toFixed(2) ?? '-'}`,
              `Q3: ${raw.q3?.toFixed(2) ?? '-'}`,
              `中位数: ${raw.median?.toFixed(2) ?? '-'}`,
              `Q1: ${raw.q1?.toFixed(2) ?? '-'}`,
              `最小值: ${raw.min?.toFixed(2) ?? '-'}`,
            ];
            if (raw.mean !== undefined) {
              lines.push(`均值: ${raw.mean.toFixed(2)}`);
            }
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel || '',
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
      y: {
        display: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel || '',
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
    downloadChart(chartRef.current, 'boxplot-chart');
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
  if (safeData.length === 0 || labels.length === 0) {
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
          title={title || '箱线图'}
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
        title={title || '箱线图'}
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
        <Chart
          ref={chartRef}
          type="boxplot"
          data={processedData}
          options={options}
        />
      </div>
    </ChartContainer>,
  );
};

export default BoxPlotChart;
