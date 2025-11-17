import { ConfigProvider } from 'antd';
import {
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScriptableContext,
  Tooltip,
} from 'chart.js';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  ChartContainer,
  ChartContainerProps,
  ChartFilter,
  ChartStatistic,
  ChartToolBar,
  downloadChart,
} from '../components';
import { defaultColorList } from '../const';
import { StatisticConfigType } from '../hooks/useChartStatistic';
import {
  ChartDataItem,
  extractAndSortXValues,
  findDataPointByXValue,
} from '../utils';
import { useStyle } from './style';

/**
 * @fileoverview 面积图组件文件
 *
 * 该文件提供了面积图组件的实现，基于 Chart.js 和 react-chartjs-2。
 * 支持数据可视化、交互、配置、统计等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

let areaChartComponentsRegistered = false;

/**
 * 面积图数据项类型
 *
 * 继承自 ChartDataItem，用于面积图的数据表示。
 *
 * @typedef {ChartDataItem} AreaChartDataItem
 * @since 1.0.0
 */
export type AreaChartDataItem = ChartDataItem;

/**
 * 面积图配置项接口
 *
 * 定义了面积图的配置选项，包括数据集、主题、图例、网格等设置。
 *
 * @interface AreaChartConfigItem
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const config: AreaChartConfigItem = {
 *   datasets: [data1, data2],
 *   theme: 'light',
 *   showLegend: true,
 *   legendPosition: 'top',
 *   showGrid: true,
 *   xAxisLabel: '时间',
 *   yAxisLabel: '数值'
 * };
 * ```
 */
export interface AreaChartConfigItem {
  /** 数据集数组 */
  datasets: Array<(string | { x: number; y: number })[]>;
  /** 图表主题 */
  theme?: 'light' | 'dark';
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  /** 图例水平对齐方式 */
  legendAlign?: 'start' | 'center' | 'end';
  /** 是否显示网格线 */
  showGrid?: boolean;
  /** X轴标签 */
  xAxisLabel?: string;
  /** Y轴标签 */
  yAxisLabel?: string;
  /** X轴最小值 */
  xAxisMin?: number;
  /** X轴最大值 */
  xAxisMax?: number;
  /** Y轴最小值 */
  yAxisMin?: number;
  /** Y轴最大值 */
  yAxisMax?: number;
  /** X轴步长 */
  xAxisStep?: number;
  /** Y轴步长 */
  yAxisStep?: number;
}

/**
 * 面积图组件属性接口
 *
 * 定义了面积图组件的所有属性，继承自 ChartContainerProps。
 * 支持数据配置、样式设置、交互功能等。
 *
 * @interface AreaChartProps
 * @extends ChartContainerProps
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const props: AreaChartProps = {
 *   title: '销售趋势',
 *   data: [
 *     { x: '2024-01', y: 100, type: '产品A' },
 *     { x: '2024-02', y: 150, type: '产品A' }
 *   ],
 *   width: 800,
 *   height: 400,
 *   showLegend: true,
 *   showGrid: true
 * };
 * ```
 */
export interface AreaChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: AreaChartDataItem[];
  /** 图表标题 */
  title?: string;
  /** 图表宽度，默认600px */
  width?: number | string;
  /** 图表高度，默认400px */
  height?: number | string;
  /** 自定义CSS类名 */
  className?: string;
  /** 数据时间 */
  dataTime?: string;
  /** 图表主题 */
  theme?: 'dark' | 'light';
  /** 自定义主色（可选），支持 string 或 string[]；数组按序对应各数据序列 */
  color?: string | string[];
  /** 是否显示图例，默认true */
  showLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  /** 图例水平对齐方式 */
  legendAlign?: 'start' | 'center' | 'end';
  /** 是否显示网格线，默认true */
  showGrid?: boolean;
  /** X轴位置 */
  xPosition?: 'top' | 'bottom';
  /** Y轴位置 */
  yPosition?: 'left' | 'right';
  /** 是否隐藏X轴，默认false */
  hiddenX?: boolean;
  /** 是否隐藏Y轴，默认false */
  hiddenY?: boolean;
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** 是否将过滤器渲染到工具栏 */
  renderFilterInToolbar?: boolean;
  /** ChartStatistic组件配置：object表示单个配置，array表示多个配置 */
  statistic?: StatisticConfigType;
}

/**
 * 将十六进制颜色转换为带透明度的 RGBA 字符串
 *
 * 支持3位和6位十六进制颜色格式，并添加透明度。
 *
 * @param {string} hex - 十六进制颜色值（如 '#ff0000' 或 '#f00'）
 * @param {number} alpha - 透明度值（0-1之间）
 * @returns {string} RGBA 颜色字符串
 *
 * @example
 * ```typescript
 * hexToRgba('#ff0000', 0.5); // 'rgba(255, 0, 0, 0.5)'
 * hexToRgba('#f00', 0.8); // 'rgba(255, 0, 0, 0.8)'
 * ```
 *
 * @since 1.0.0
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  const isShort = sanitized.length === 3;
  const r = parseInt(
    isShort ? sanitized[0] + sanitized[0] : sanitized.slice(0, 2),
    16,
  );
  const g = parseInt(
    isShort ? sanitized[1] + sanitized[1] : sanitized.slice(2, 4),
    16,
  );
  const b = parseInt(
    isShort ? sanitized[2] + sanitized[2] : sanitized.slice(4, 6),
    16,
  );
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * 面积图组件
 *
 * 基于 Chart.js 和 react-chartjs-2 实现的面积图组件。
 * 支持数据可视化、交互、配置、统计等功能。
 *
 * @component
 * @param {AreaChartProps} props - 组件属性
 * @returns {React.ReactElement} 面积图组件
 *
 * @example
 * ```tsx
 * <AreaChart
 *   title="销售趋势"
 *   data={[
 *     { x: '2024-01', y: 100, type: '产品A' },
 *     { x: '2024-02', y: 150, type: '产品A' }
 *   ]}
 *   width={800}
 *   height={400}
 *   showLegend={true}
 *   showGrid={true}
 * />
 * ```
 *
 * @since 1.0.0
 */
const AreaChart: React.FC<AreaChartProps> = ({
  title,
  data,
  width = 600,
  height = 400,
  className,
  dataTime,
  theme = 'light',
  color,
  showLegend = true,
  legendPosition = 'bottom',
  legendAlign = 'start',
  showGrid = true,
  xPosition = 'bottom',
  yPosition = 'left',
  hiddenX = false,
  hiddenY = false,
  toolbarExtra,
  renderFilterInToolbar = false,
  statistic: statisticConfig,
  variant,
}) => {
  useMemo(() => {
    if (areaChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend,
    );
    areaChartComponentsRegistered = true;
    return undefined;
  }, []);

  const safeData = Array.isArray(data) ? data : [];
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

  // 样式注册
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('area-chart-container');
  const { wrapSSR, hashId } = useStyle(baseClassName);

  const chartRef = useRef<ChartJS<'line'>>(null);

  // 处理 ChartStatistic 组件配置
  const statistics = useMemo(() => {
    if (!statisticConfig) return null;
    return Array.isArray(statisticConfig) ? statisticConfig : [statisticConfig];
  }, [statisticConfig]);

  // 从数据中提取唯一的类别作为筛选选项
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(safeData.map((item) => item.category)),
    ].filter(Boolean);
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
    categories.find(Boolean) || '',
  );
  const [selectedFilterLabel, setSelectedFilterLabel] = useState(
    filterLabels && filterLabels.length > 0 ? filterLabels[0] : undefined,
  );

  // 当数据变化导致当前选中分类失效时，自动回退到首个有效分类或空（显示全部）
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

    // 统一过滤掉 x 为空（null/undefined）的数据，避免后续 toString 报错
    return withFilterLabel.filter(
      (item) => item.x !== null && item.x !== undefined,
    );
  }, [safeData, selectedFilter, filterLabels, selectedFilterLabel]);

  // 从数据中提取唯一的类型
  const types = useMemo(() => {
    return [...new Set(filteredData.map((item) => item.type))];
  }, [filteredData]);

  // 从数据中提取唯一的x值并排序
  const xValues = useMemo(() => {
    return extractAndSortXValues(filteredData);
  }, [filteredData]);

  // 从数据中获取xtitle和ytitle
  const xTitle = useMemo(() => {
    const titles = [
      ...new Set(filteredData.map((item) => item.xtitle).filter(Boolean)),
    ];
    return titles[0] || '';
  }, [filteredData]);

  const yTitle = useMemo(() => {
    const titles = [
      ...new Set(filteredData.map((item) => item.ytitle).filter(Boolean)),
    ];
    return titles[0] || '';
  }, [filteredData]);

  // 构建Chart.js数据结构
  const processedData: ChartData<'line'> = useMemo(() => {
    const labels = xValues.map((x) => x.toString());

    const datasets = types.map((type, index) => {
      const provided = color;
      const baseColor = Array.isArray(provided)
        ? provided[index % provided.length] ||
          defaultColorList[index % defaultColorList.length]
        : provided || defaultColorList[index % defaultColorList.length];

      // 为每个类型收集数据点
      const typeData = xValues.map((x) => {
        const dataPoint = findDataPointByXValue(filteredData, x, type);
        const v = dataPoint?.y;
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isFinite(n) ? n : null;
      });

      return {
        label: type || '默认',
        data: typeData,
        borderColor: baseColor,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const chart = ctx.chart;
          const chartArea = chart.chartArea;
          if (!chartArea) return hexToRgba(baseColor, 0.2);

          const { top, bottom } = chartArea;
          const gradient = chart.ctx.createLinearGradient(0, top, 0, bottom);
          // 顶部颜色更实，向下逐渐透明，形成柔和的面积过渡
          gradient.addColorStop(0, hexToRgba(baseColor, 0.28));
          gradient.addColorStop(1, hexToRgba(baseColor, 0.05));
          return gradient;
        },
        pointBackgroundColor: baseColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderWidth: 3,
        tension: 0,
        fill: true,
      };
    });

    return { labels, datasets };
  }, [filteredData, types, xValues]);

  // 筛选器选项
  const filterOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category || '默认',
      value: category || '默认',
    }));
  }, [categories]);

  // 根据 filterLabel 筛选数据 - 只有当 filterLabels 存在时才生成
  const filteredDataByFilterLabel = useMemo(() => {
    return filterLabels?.map((item) => ({
      key: item,
      label: item,
    }));
  }, [filterLabels]);

  const isLight = theme === 'light';
  const axisTextColor = isLight
    ? 'rgba(0, 25, 61, 0.3255)'
    : 'rgba(255, 255, 255, 0.8)';
  const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)';

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: legendPosition,
        align: legendAlign,
        labels: {
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
          padding: isMobile ? 10 : 12,
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      tooltip: {
        // 与交互保持一致：不要求点相交，并按 x 索引联动
        intersect: false,
        mode: 'index',
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
            const label = context.dataset.label || '';
            const y = context.parsed.y;
            return `${label}: ${y}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: !hiddenX,
        position: xPosition,
        title: {
          display: !!xTitle,
          text: xTitle,
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
          align: 'end',
        },
        grid: {
          display: showGrid,
          color: gridColor,
          lineWidth: 1,
          drawTicks: false,
          tickLength: 0,
        },
        ticks: {
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12 },
          padding: isMobile ? 10 : 12,
        },
        border: {
          color: gridColor,
        },
      },
      y: {
        display: !hiddenY,
        position: yPosition,
        beginAtZero: true,
        title: {
          display: !!yTitle,
          text: yTitle,
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12, weight: 'normal' },
          align: 'end',
        },
        grid: {
          display: showGrid,
          color: gridColor,
          lineWidth: 1,
          drawTicks: false,
          tickLength: 0,
        },
        ticks: {
          color: axisTextColor,
          font: { size: isMobile ? 10 : 12 },
          padding: isMobile ? 10 : 12,
        },
        border: {
          color: gridColor,
        },
      },
    },
    elements: {
      point: {
        radius: isMobile ? 2 : 3,
        hoverRadius: isMobile ? 3 : 5,
        borderWidth: isMobile ? 1 : 2,
        hoverBorderWidth: isMobile ? 1 : 2,
      },
      line: {
        borderWidth: 3,
      },
    },
  };

  const handleDownload = () => {
    downloadChart(chartRef.current, 'area-chart');
  };

  return wrapSSR(
    <ChartContainer
      baseClassName={baseClassName}
      className={className}
      theme={theme}
      isMobile={isMobile}
      variant={variant}
      style={{
        width: responsiveWidth,
        height: responsiveHeight,
      }}
    >
      <ChartToolBar
        title={title}
        theme={theme}
        onDownload={handleDownload}
        extra={toolbarExtra}
        dataTime={dataTime}
        filter={
          renderFilterInToolbar && filterOptions && filterOptions.length > 1 ? (
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
          className={classNames(`${baseClassName}-statistic-container`, hashId)}
        >
          {statistics.map((config, index) => (
            <ChartStatistic key={index} {...config} theme={theme} />
          ))}
        </div>
      )}

      {!renderFilterInToolbar && filterOptions && filterOptions.length > 1 && (
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
        className={`${baseClassName}-wrapper`}
        style={{ marginTop: '20px', height: responsiveHeight }}
      >
        <Line ref={chartRef} data={processedData} options={options} />
      </div>
    </ChartContainer>,
  );
};

export default AreaChart;
