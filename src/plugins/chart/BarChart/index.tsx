import { ConfigProvider } from 'antd';
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  ScriptableContext,
  Tooltip,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import classNamesLib from 'classnames';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
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
import type { ChartClassNames, ChartStyles } from '../types/classNames';
import {
  ChartDataItem,
  extractAndSortXValues,
  findDataPointByXValue,
  hexToRgba,
} from '../utils';
import { useStyle } from './style';

/**
 * @fileoverview 柱状图组件文件
 *
 * 该文件提供了柱状图组件的实现，基于 Chart.js 和 react-chartjs-2。
 * 支持数据可视化、交互、配置、统计等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

let barChartComponentsRegistered = false;

/**
 * 柱状图数据项类型
 *
 * 继承自 ChartDataItem，用于柱状图的数据表示。
 *
 * @typedef {ChartDataItem} BarChartDataItem
 * @since 1.0.0
 */
export type BarChartDataItem = ChartDataItem;

/**
 * 柱状图配置项接口
 *
 * 定义了柱状图的配置选项，包括数据集、主题、图例、网格等设置。
 *
 * @interface BarChartConfigItem
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const config: BarChartConfigItem = {
 *   datasets: [data1, data2],
 *   theme: 'light',
 *   showLegend: true,
 *   legendPosition: 'top',
 *   showGrid: true,
 *   xAxisLabel: '类别',
 *   yAxisLabel: '数值',
 *   stacked: false,
 *   indexAxis: 'x'
 * };
 * ```
 */
export interface BarChartConfigItem {
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
  /** 是否堆叠显示 */
  stacked?: boolean;
  /** 索引轴方向 */
  indexAxis?: 'x' | 'y';
  /** 柱子最大宽度 */
  maxBarThickness?: number;
}

export interface BarChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: BarChartDataItem[];
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
  /** 自定义主色（可选），支持 string 或 string[]；
   *  - 非正负图：数组按序对应各数据序列
   *  - 正负图：取数组前两位分别作为正/负色；仅一位则全用同色
   */
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
  /** 是否启用堆叠显示，将多个数据集叠加显示 */
  stacked?: boolean;
  /** 图表轴向，'x'为垂直柱状图，'y'为水平柱状图 */
  indexAxis?: 'x' | 'y';
  /** 柱子最大宽度 */
  maxBarThickness?: number;
  /** 是否显示数据标签，默认false */
  showDataLabels?: boolean;
  /** 数据标签格式化函数 */
  dataLabelFormatter?: (params: {
    value: number;
    label: string | number;
    datasetLabel: string;
    dataIndex: number;
    datasetIndex: number;
  }) => string;
  /** 外部传入的 Chart.js 选项，会与默认选项合并 */
  chartOptions?: Partial<ChartOptions<'bar'>>;
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** 是否将过滤器渲染到工具栏 */
  renderFilterInToolbar?: boolean;
  /** ChartStatistic组件配置：object表示单个配置，array表示多个配置 */
  statistic?: StatisticConfigType;
  /** 是否显示加载状态（当图表未闭合时显示） */
  loading?: boolean;
  /** 自定义样式对象（支持对象格式，为每层DOM设置样式） */
  styles?: ChartStyles;
}

// 正负柱状图颜色（与需求给定的 rgba 保持一致）
const POSITIVE_COLOR_HEX = '#388BFF'; // rgba(56, 139, 255, 1)
const NEGATIVE_COLOR_HEX = '#F78826'; // rgba(247, 136, 38, 1)

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  width = 600,
  height = 400,
  className,
  classNames,
  style,
  styles,
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
  stacked = false,
  indexAxis = 'x',
  maxBarThickness,
  toolbarExtra,
  renderFilterInToolbar = false,
  statistic: statisticConfig,
  variant,
  showDataLabels = false,
  dataLabelFormatter,
  chartOptions,
  loading = false,
}) => {
  useMemo(() => {
    if (barChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
    barChartComponentsRegistered = true;
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
  const baseClassName = context?.getPrefixCls('bar-chart-container');
  const { wrapSSR } = useStyle(baseClassName);

  const chartRef = useRef<ChartJS<'bar'>>(null);

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
    // 先按分类与可选的 filterLabel 进行筛选
    const base = selectedFilter
      ? safeData.filter((item) => item.category === selectedFilter)
      : safeData;

    const withFilterLabel =
      !filterLabels || !selectedFilterLabel
        ? base
        : base.filter((item) => item.filterLabel === selectedFilterLabel);

    // 最终统一过滤掉 x 为空（null/undefined）的数据，避免后续 toString 报错
    return withFilterLabel.filter(
      (item) => item.x !== null && item.x !== undefined,
    );
  }, [safeData, selectedFilter, filterLabels, selectedFilterLabel]);

  // 从数据中提取唯一的类型
  const types = useMemo(() => {
    return [...new Set(filteredData.map((item) => item.type))];
  }, [filteredData]);

  // 从数据中提取唯一的x值 - 水平柱状图时保持原始顺序
  const xValues = useMemo(() => {
    if (indexAxis === 'y') {
      // 水平柱状图时，x是类目轴，应保持原始顺序而不排序
      const uniqueValues = [
        ...new Set(
          filteredData
            .map((item) => item.x)
            .filter((x) => x !== null && x !== undefined),
        ),
      ];
      return uniqueValues;
    }
    return extractAndSortXValues(filteredData);
  }, [filteredData, indexAxis]);

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

  // 是否是正负柱图（同一批次同时存在正值与负值）
  const hasPositive = useMemo(() => {
    return filteredData.some((item) => {
      const v = typeof item.y === 'number' ? item.y : Number(item.y);
      return Number.isFinite(v) && v > 0;
    });
  }, [filteredData]);
  const hasNegative = useMemo(() => {
    return filteredData.some((item) => {
      const v = typeof item.y === 'number' ? item.y : Number(item.y);
      return Number.isFinite(v) && v < 0;
    });
  }, [filteredData]);
  const isDiverging = hasPositive && hasNegative;

  // 构建Chart.js数据结构
  const processedData: ChartData<'bar'> = useMemo(() => {
    const labels = xValues.map((x) => x.toString());

    const datasets = types.map((type, index) => {
      const provided = color;
      const pickByIndex = (i: number) =>
        Array.isArray(provided)
          ? provided[i] ||
            provided[0] ||
            defaultColorList[i % defaultColorList.length]
          : provided || defaultColorList[i % defaultColorList.length];
      const baseColor = pickByIndex(index);

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
        borderColor: (ctx: ScriptableContext<'bar'>) => {
          const parsed: any = ctx.parsed as any;
          const value =
            indexAxis === 'y'
              ? typeof parsed?.x === 'number'
                ? parsed.x
                : 0
              : typeof parsed?.y === 'number'
                ? parsed.y
                : 0;
          let base = baseColor;
          if (!color && isDiverging) {
            base = value >= 0 ? POSITIVE_COLOR_HEX : NEGATIVE_COLOR_HEX;
          } else if (Array.isArray(color) && isDiverging) {
            const pos = color[0] || baseColor;
            const neg = color[1] || color[0] || baseColor;
            base = value >= 0 ? pos : neg;
          }
          return hexToRgba(base, 0.95);
        },
        backgroundColor: (ctx: ScriptableContext<'bar'>) => {
          const chart = ctx.chart;
          const chartArea = chart.chartArea;
          const parsed: any = ctx.parsed as any;
          if (!chartArea) return hexToRgba(baseColor, 0.6);

          const xScale = chart.scales['x'];
          const yScale = chart.scales['y'];
          const startAlpha = 0.65;
          const endAlpha = 0.95;

          // 安全检查：确保坐标轴已正确初始化
          if (
            !xScale ||
            !yScale ||
            typeof xScale.getPixelForValue !== 'function' ||
            typeof yScale.getPixelForValue !== 'function'
          ) {
            return hexToRgba(baseColor, 0.6);
          }

          if (indexAxis === 'y') {
            const value = typeof parsed?.x === 'number' ? parsed.x : 0;
            let base = baseColor;
            if (!color && isDiverging) {
              base = value >= 0 ? POSITIVE_COLOR_HEX : NEGATIVE_COLOR_HEX;
            } else if (Array.isArray(color) && isDiverging) {
              const pos = color[0] || baseColor;
              const neg = color[1] || color[0] || baseColor;
              base = value >= 0 ? pos : neg;
            }

            // 当值为 0 时，直接返回纯色，避免渐变范围为 0 导致的显示问题
            if (value === 0) {
              return hexToRgba(base, 0.75);
            }

            // 安全获取像素值，添加有限性检查
            const x0 = xScale.getPixelForValue(0);
            const x1 = xScale.getPixelForValue(value);

            // 检查像素值是否为有限数
            if (!Number.isFinite(x0) || !Number.isFinite(x1)) {
              return hexToRgba(base, endAlpha);
            }

            // 从靠近坐标轴的零点开始，向数据端渐深
            const gradient = chart.ctx.createLinearGradient(x0, 0, x1, 0);
            gradient.addColorStop(0, hexToRgba(base, startAlpha));
            gradient.addColorStop(1, hexToRgba(base, endAlpha));
            return gradient;
          }

          const value = typeof parsed?.y === 'number' ? parsed.y : 0;
          let base = baseColor;
          if (!color && isDiverging) {
            base = value >= 0 ? POSITIVE_COLOR_HEX : NEGATIVE_COLOR_HEX;
          } else if (Array.isArray(color) && isDiverging) {
            const pos = color[0] || baseColor;
            const neg = color[1] || color[0] || baseColor;
            base = value >= 0 ? pos : neg;
          }

          // 当值为 0 时，直接返回纯色，避免渐变范围为 0 导致的显示问题
          if (value === 0) {
            return hexToRgba(base, 0.75);
          }

          // 安全获取像素值，添加有限性检查
          const y0 = yScale.getPixelForValue(0);
          const y1 = yScale.getPixelForValue(value);

          // 检查像素值是否为有限数
          if (!Number.isFinite(y0) || !Number.isFinite(y1)) {
            return hexToRgba(base, endAlpha);
          }

          const gradient = chart.ctx.createLinearGradient(0, y0, 0, y1);
          gradient.addColorStop(0, hexToRgba(base, startAlpha));
          gradient.addColorStop(1, hexToRgba(base, endAlpha));
          return gradient;
        },
        borderWidth: 0,
        // 当设置了 maxBarThickness 时，使用较大的百分比以允许 maxBarThickness 生效
        categoryPercentage: maxBarThickness ? 1.0 : 0.7,
        barPercentage: maxBarThickness ? 1.0 : 0.8,
        ...(maxBarThickness && { maxBarThickness }),
        stack: stacked ? 'stack' : undefined,
        borderRadius: (ctx: any) => {
          const rawValue = ctx?.raw;
          const value =
            typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
          const isHorizontal = indexAxis === 'y';
          const radius = 6;
          const chart = ctx?.chart as import('chart.js').Chart<'bar'>;

          // When stacked, only the outermost (top) segment of the same sign gets radius
          let isTopOfStack = true;
          if (stacked && chart) {
            const dsIndex = ctx?.datasetIndex as number;
            const dIndex = ctx?.dataIndex as number;
            const currentStack = chart.data.datasets?.[dsIndex]?.stack;
            const sameStackIndexes = chart.data.datasets
              .map((_, i) => i)
              .filter((i) => {
                const ds: any = chart.data.datasets?.[i];
                if (!chart.isDatasetVisible(i)) return false;
                if (currentStack) {
                  if (ds?.stack !== currentStack) return false;
                }
                const v = Number(ds?.data?.[dIndex] ?? 0);
                return (v >= 0 && value >= 0) || (v < 0 && value < 0);
              });
            // top means the last dataset in rendering order among same sign
            const topIndex = sameStackIndexes.length
              ? Math.max(...sameStackIndexes)
              : dsIndex;
            isTopOfStack = dsIndex === topIndex;
          }

          if (!isTopOfStack) return 0;

          if (isHorizontal) {
            if (value >= 0) {
              return {
                topRight: radius,
                bottomRight: radius,
                topLeft: 0,
                bottomLeft: 0,
              };
            } else {
              return {
                topLeft: radius,
                bottomLeft: radius,
                topRight: 0,
                bottomRight: 0,
              };
            }
          } else {
            if (value >= 0) {
              return {
                topLeft: radius,
                topRight: radius,
                bottomLeft: 0,
                bottomRight: 0,
              };
            } else {
              return {
                bottomLeft: radius,
                bottomRight: radius,
                topLeft: 0,
                topRight: 0,
              };
            }
          }
        },
        borderSkipped: false,
      };
    });

    return { labels, datasets };
  }, [filteredData, types, xValues, stacked, indexAxis, maxBarThickness]);

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

  // 标签宽度计算函数
  const calculateLabelWidth = (text: string, fontSize: number = 11): number => {
    // 创建临时canvas来测量文本宽度
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return text.length * fontSize * 0.6; // 备用估算

    context.font = `${fontSize}px Arial, sans-serif`;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  // 计算所需的最大标签宽度
  const calculateMaxLabelWidth = useMemo(() => {
    if (!showDataLabels || !filteredData.length) return 0;

    const fontSize = isMobile ? 10 : 11;
    let maxWidth = 0;

    // 遍历所有数据点，计算标签文本的最大宽度
    filteredData.forEach((item) => {
      const value = typeof item.y === 'number' ? item.y : Number(item.y);
      if (Number.isFinite(value)) {
        let labelText = '';

        if (dataLabelFormatter) {
          labelText = dataLabelFormatter({
            value,
            label: String(item.x),
            datasetLabel: String(item.type || '默认'),
            dataIndex: 0,
            datasetIndex: 0,
          });
        } else {
          // 使用默认格式化
          labelText = value.toLocaleString();
        }

        const width = calculateLabelWidth(labelText, fontSize);
        maxWidth = Math.max(maxWidth, width);
      }
    });

    return maxWidth;
  }, [filteredData, showDataLabels, dataLabelFormatter, isMobile]);

  // 计算动态padding
  const calculateDynamicPadding = useMemo(() => {
    if (!showDataLabels || calculateMaxLabelWidth === 0)
      return { top: 0, right: 0, bottom: 0, left: 0 };

    const basePadding = 8; // 基础padding
    const labelPadding = Math.ceil(calculateMaxLabelWidth) + 12; // 标签宽度 + 额外间距

    if (indexAxis === 'y') {
      // 水平柱状图：标签在右侧，需要增加右侧padding
      return {
        top: basePadding,
        right: Math.max(basePadding, labelPadding),
        bottom: basePadding,
        left: basePadding,
      };
    } else {
      // 垂直柱状图：标签在上方，需要增加上方padding
      return {
        top: Math.max(basePadding, labelPadding),
        right: basePadding,
        bottom: basePadding,
        left: basePadding,
      };
    }
  }, [showDataLabels, calculateMaxLabelWidth, indexAxis]);

  // 深度合并函数
  const deepMerge = (target: any, source: any): any => {
    if (!source || typeof source !== 'object') return source;
    if (!target || typeof target !== 'object') return source;

    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          // 特殊处理layout.padding，确保动态计算的padding不被覆盖
          if (
            key === 'layout' &&
            source[key].padding &&
            target.layout?.padding
          ) {
            result[key] = {
              ...target[key],
              ...source[key],
              padding: {
                ...target[key].padding,
                ...source[key].padding,
              },
            };
          } else {
            result[key] = deepMerge(target[key] || {}, source[key]);
          }
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  };

  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis,
    layout: {
      padding: calculateDynamicPadding,
    },
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
        backgroundColor: isLight
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(0,0,0,0.85)',
        titleColor: isLight ? '#333' : '#fff',
        bodyColor: isLight ? '#333' : '#fff',
        borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        cornerRadius: isMobile ? 6 : 8,
        displayColors: true,
      },

      ...(ChartDataLabels && {
        datalabels: {
          display: (context: Context) => {
            if (!showDataLabels) return false;

            // 堆叠图：只在可见数据集中最后一个显示标签（显示累计总和）
            if (stacked) {
              const chart = context.chart;
              const dsIndex = context.datasetIndex;
              const dIndex = context.dataIndex;
              const currentStack = chart.data.datasets?.[dsIndex]?.stack;

              // 获取当前数据点的值，用于判断正负
              const currentValue = Number(
                chart.data.datasets?.[dsIndex]?.data?.[dIndex] ?? 0,
              );

              // 找出所有可见的、同一堆叠、同一符号（正/负）的数据集索引
              const sameStackIndexes = chart.data.datasets
                .map((_: any, i: number) => i)
                .filter((i: number) => {
                  const ds: any = chart.data.datasets?.[i];
                  // 检查数据集是否可见
                  if (!chart.isDatasetVisible(i)) return false;
                  // 检查是否属于同一堆叠
                  if (currentStack && ds?.stack !== currentStack) return false;
                  // 检查该位置的值是否与当前值同号（正/负）
                  const v = Number(ds?.data?.[dIndex] ?? 0);
                  return (
                    (v >= 0 && currentValue >= 0) || (v < 0 && currentValue < 0)
                  );
                });

              // 只在可见数据集中的最后一个显示标签
              const topIndex = sameStackIndexes.length
                ? Math.max(...sameStackIndexes)
                : dsIndex;

              return dsIndex === topIndex;
            }

            // 非堆叠图：显示所有标签
            return true;
          },
          anchor: indexAxis === 'y' ? 'end' : 'end',
          align: indexAxis === 'y' ? 'end' : 'top',
          offset: 4,
          color: axisTextColor,
          font: {
            size: isMobile ? 10 : 11,
            weight: 'normal',
          },
          formatter: (value: number, context: Context) => {
            if (value === null || value === undefined) return '';

            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            const labelValue = context.chart.data.labels?.[dataIndex];
            const label =
              typeof labelValue === 'string' || typeof labelValue === 'number'
                ? labelValue
                : String(labelValue || '');
            const datasetLabel = String(context.dataset.label || '');

            // 堆叠图：计算并显示该位置的可见数据集累计总和
            if (stacked) {
              const chart = context.chart;
              const datasets = chart.data.datasets;
              const currentValue = Number(
                datasets?.[datasetIndex]?.data?.[dataIndex] ?? 0,
              );
              const currentStack = datasets?.[datasetIndex]?.stack;

              // 只累加可见的、同一堆叠、同一符号的数据集
              let total = 0;
              datasets.forEach((dataset: any, i: number) => {
                // 检查数据集是否可见
                if (!chart.isDatasetVisible(i)) return;
                // 检查是否属于同一堆叠
                if (currentStack && dataset?.stack !== currentStack) return;

                const val = dataset.data[dataIndex];
                if (val !== null && val !== undefined) {
                  const numVal = Number(val);
                  // 只累加与当前值同号的数据
                  if (
                    (numVal >= 0 && currentValue >= 0) ||
                    (numVal < 0 && currentValue < 0)
                  ) {
                    total += numVal;
                  }
                }
              });

              if (dataLabelFormatter) {
                return dataLabelFormatter({
                  value: total,
                  label,
                  datasetLabel,
                  dataIndex,
                  datasetIndex,
                });
              }
              return total.toLocaleString();
            }

            // 非堆叠图：显示原始值
            if (dataLabelFormatter) {
              return dataLabelFormatter({
                value,
                label,
                datasetLabel,
                dataIndex,
                datasetIndex,
              });
            }
            return value.toLocaleString();
          },
        },
      }),
    },
    scales: {
      x: {
        display: !hiddenX,
        stacked,
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
        stacked,
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
    animation: {
      duration: isMobile ? 200 : 400,
    },
  };

  // 合并外部传入的选项与默认选项
  const options: ChartOptions<'bar'> = chartOptions
    ? deepMerge(defaultOptions, chartOptions)
    : defaultOptions;

  const handleDownload = () => {
    downloadChart(chartRef.current, 'bar-chart');
  };

  const rootClassName = classNamesLib(classNames?.root, className);
  const rootStyle = {
    width: responsiveWidth,
    height: responsiveHeight,
    ...style,
    ...styles?.root,
  };

  const toolbarClassName = classNamesLib(classNames?.toolbar);
  const toolbarStyle = styles?.toolbar;

  const statisticContainerClassName = classNamesLib(
    classNames?.statisticContainer,
    `${baseClassName}-statistic-container`,
  );
  const statisticContainerStyle = styles?.statisticContainer;

  const filterClassName = classNamesLib(classNames?.filter);
  const filterStyle = styles?.filter;

  const wrapperClassName = classNamesLib(
    classNames?.wrapper,
    `${baseClassName}-wrapper`,
  );
  const wrapperStyle = {
    marginTop: '20px',
    height: responsiveHeight,
    ...styles?.wrapper,
  };

  return wrapSSR(
    <ChartContainer
      baseClassName={baseClassName}
      className={rootClassName}
      theme={theme}
      isMobile={isMobile}
      variant={variant}
      style={rootStyle}
    >
      <ChartToolBar
        title={title}
        theme={theme}
        onDownload={handleDownload}
        extra={toolbarExtra}
        dataTime={dataTime}
        loading={loading}
        className={toolbarClassName}
        style={toolbarStyle}
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
              className={filterClassName}
              style={filterStyle}
            />
          ) : undefined
        }
      />

      {statistics && (
        <div
          className={statisticContainerClassName}
          style={statisticContainerStyle}
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
          className={filterClassName}
          style={filterStyle}
        />
      )}

      <div className={wrapperClassName} style={wrapperStyle}>
        <Bar
          ref={chartRef}
          data={processedData}
          options={options}
          plugins={[ChartDataLabels]}
        />
      </div>
    </ChartContainer>,
  );
};

export default BarChart;
