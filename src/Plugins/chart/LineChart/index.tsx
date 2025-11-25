import { ConfigProvider } from 'antd';
import { ChartData, Chart as ChartJS, ChartOptions } from 'chart.js';
import classNames from 'classnames';
import React, { useContext, useMemo, useRef } from 'react';
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
import {
  useChartDataFilter,
  useChartStatistics,
  useChartTheme,
  useResponsiveSize,
} from '../hooks';
import { StatisticConfigType } from '../hooks/useChartStatistic';
import {
  ChartDataItem,
  extractAndSortXValues,
  findDataPointByXValue,
  registerLineChartComponents,
} from '../utils';
import { useStyle } from './style';

export type LineChartDataItem = ChartDataItem;

export interface LineChartConfigItem {
  datasets: Array<(string | { x: number; y: number })[]>;
  theme?: 'light' | 'dark';
  showLegend?: boolean;
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  legendAlign?: 'start' | 'center' | 'end';
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisMin?: number;
  xAxisMax?: number;
  yAxisMin?: number;
  yAxisMax?: number;
  xAxisStep?: number;
  yAxisStep?: number;
}

export interface LineChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: LineChartDataItem[];
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
  /** 是否显示加载状态（当图表未闭合时显示） */
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
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
  loading = false,
  ...props
}) => {
  // 注册 Chart.js 组件
  registerLineChartComponents();

  // 响应式尺寸
  const { responsiveWidth, responsiveHeight, isMobile } = useResponsiveSize(
    width,
    height,
  );

  // 样式注册
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('line-chart-container');
  const { wrapSSR, hashId } = useStyle(baseClassName);

  const chartRef = useRef<ChartJS<'line'>>(null);

  // 处理 ChartStatistic 组件配置
  const statistics = useChartStatistics(statisticConfig);

  // 数据筛选
  const {
    filteredData,
    filterOptions,
    filterLabels,
    selectedFilter,
    setSelectedFilter,
    selectedFilterLabel,
    setSelectedFilterLabel,
    filteredDataByFilterLabel,
  } = useChartDataFilter(data);

  // 主题颜色
  const { axisTextColor, gridColor, isLight } = useChartTheme(theme);

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
        backgroundColor: `${baseColor}33`,
        pointBackgroundColor: baseColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        borderWidth: 3,
        tension: 0,
        fill: false,
      };
    });

    return { labels, datasets };
  }, [filteredData, types, xValues]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    // 允许在任意垂直方向的区域悬停时触发同一 x 索引的数据提示
    interaction: {
      mode: 'index',
      intersect: false,
      axis: 'x',
    },
    plugins: {
      legend: {
        display: showLegend && types.length > 0,
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
    downloadChart(chartRef.current, 'line-chart');
  };

  return wrapSSR(
    <ChartContainer
      baseClassName={baseClassName}
      className={className}
      theme={theme}
      isMobile={isMobile}
      variant={props.variant}
      style={{
        width: responsiveWidth,
      }}
    >
      <ChartToolBar
        title={title}
        theme={theme}
        onDownload={handleDownload}
        extra={toolbarExtra}
        dataTime={dataTime}
        loading={loading}
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

      <div
        className={`${baseClassName}-wrapper`}
        style={{ height: responsiveHeight }}
      >
        <Line ref={chartRef} data={processedData} options={options} />
      </div>
    </ChartContainer>,
  );
};

export default LineChart;
