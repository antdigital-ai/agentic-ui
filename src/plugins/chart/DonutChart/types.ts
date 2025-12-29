import React from 'react';
import { ChartContainerProps } from '../components';
import { StatisticConfigType } from '../hooks/useChartStatistic';
import type { ChartClassNames, ChartStyles } from '../types/classNames';

export interface DonutChartData {
  category?: string; // 分类
  label: string;
  value: number | string;
  filterLabel?: string;
}

export interface DonutChartConfig {
  lastModified?: string;
  theme?: 'light' | 'dark';
  cutout?: string | number;
  showLegend?: boolean;
  showTooltip?: boolean;
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  backgroundColor?: string[];
  borderColor?: string;
  /** 图表样式：'donut' 为环形图（默认），'pie' 为饼图 */
  chartStyle?: 'donut' | 'pie';
}

export interface DonutChartProps extends ChartContainerProps {
  data: DonutChartData[];
  configs?: DonutChartConfig[];
  width?: number | string;
  height?: number | string;
  className?: string;
  /** 自定义CSS类名（支持对象格式，为每层DOM设置类名） */
  classNames?: ChartClassNames;
  title?: string;
  showToolbar?: boolean;
  onDownload?: () => void;
  /** 数据时间 */
  dataTime?: string;
  /** 筛选项列表，不传时不显示筛选器 */
  filterList?: string[];
  /** 当前选中的筛选值 */
  selectedFilter?: string;
  /** 筛选变化回调函数 */
  onFilterChange?: (value: string) => void;
  /** 是否启用自动分类功能 */
  enableAutoCategory?: boolean;
  /** 是否启用单值模式：每条数据渲染一个独立环形图并自动着色 */
  singleMode?: boolean;
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
