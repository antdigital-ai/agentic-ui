import { ConfigProvider } from 'antd';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import classNames from 'classnames';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  ChartContainer,
  ChartFilter,
  ChartStatistic,
  ChartToolBar,
  downloadChart,
} from '../components';
import { defaultColorList } from '../const';
import {
  SINGLE_MODE_DESKTOP_CUTOUT,
  SINGLE_MODE_MOBILE_CUTOUT,
} from './constants';
import {
  useAutoCategory,
  useFilterLabels,
  useMobile,
  useResponsiveDimensions,
} from './hooks';
import LegendView from './Legend';
import { createBackgroundArcPlugin, createCenterTextPlugin } from './plugins';
import { useStyle } from './style';
import type { DonutChartConfig, DonutChartProps } from './types';

/**
 * @fileoverview 环形图组件文件
 *
 * 该文件提供了环形图（甜甜圈图）组件的实现，基于 Chart.js 和 react-chartjs-2。
 * 支持饼图和环形图两种样式，提供数据可视化、交互、配置、统计等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

let donutChartComponentsRegistered = false;

export type {
  DonutChartConfig,
  DonutChartData,
  DonutChartProps,
} from './types';

/**
 * 环形图组件
 *
 * 基于 Chart.js 和 react-chartjs-2 实现的环形图（甜甜圈图）组件。
 * 支持饼图和环形图两种样式，提供数据可视化、交互、配置、统计等功能。
 *
 * @component
 * @param {DonutChartProps} props - 组件属性
 * @returns {React.ReactElement} 环形图组件
 *
 * @example
 * ```tsx
 * <DonutChart
 *   title="销售占比"
 *   data={[
 *     { label: '产品A', value: 30 },
 *     { label: '产品B', value: 50 },
 *     { label: '产品C', value: 20 }
 *   ]}
 *   configs={[{ chartStyle: 'donut', showLegend: true }]}
 *   width={400}
 *   height={400}
 *   showToolbar={true}
 * />
 * ```
 *
 * @since 1.0.0
 */
const DonutChart: React.FC<DonutChartProps> = ({
  data,
  configs,
  width = 200,
  height = 200,
  className,
  classNames: classNamesProp,
  title,
  showToolbar = true,
  onDownload,
  dataTime,
  filterList,
  selectedFilter,
  onFilterChange,
  enableAutoCategory = true,
  singleMode = false,
  toolbarExtra,
  renderFilterInToolbar = false,
  statistic: statisticConfig,
  loading = false,
  ...props
}) => {
  useMemo(() => {
    if (donutChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(ArcElement, Tooltip, Legend);
    donutChartComponentsRegistered = true;
    return undefined;
  }, []);

  const { isMobile, windowWidth } = useMobile();

  // 默认配置：当 configs 不传时，使用默认配置，showLegend 默认为 true
  const defaultConfigs: DonutChartConfig[] = [{ showLegend: true }];
  const finalConfigs = configs || defaultConfigs;
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('donut-chart');
  const { hashId } = useStyle(baseClassName);
  // 多图场景下独立管理每个图表实例，避免引用被覆盖
  const chartRefs = useRef<Array<ChartJS<'doughnut'> | null>>([]);

  // 多图场景下按图索引隔离 Legend 隐藏状态
  const [hiddenDataIndicesByChart, setHiddenDataIndicesByChart] = useState<
    Record<number, Set<number>>
  >({});

  const {
    filterLabels,
    filteredDataByFilterLabel,
    selectedFilterLabel,
    setSelectedFilterLabel,
  } = useFilterLabels(data);

  const {
    autoCategoryData,
    internalSelectedCategory,
    setInternalSelectedCategory,
    selectedCategory,
  } = useAutoCategory(data, enableAutoCategory, selectedFilter);

  const filteredData = useMemo(() => {
    const byCategory = selectedCategory
      ? data.filter((item) => item.category === selectedCategory)
      : data;

    if (!filterLabels || !selectedFilterLabel) {
      return byCategory;
    }

    return byCategory.filter(
      (item) => item.filterLabel === selectedFilterLabel,
    );
  }, [data, selectedCategory, filterLabels, selectedFilterLabel]);

  const handleInternalCategoryChange = (category: string) => {
    setInternalSelectedCategory(category);
  };

  const handleLegendItemClick = (chartIndex: number, dataIndex: number) => {
    setHiddenDataIndicesByChart((prev) => {
      const next: Record<number, Set<number>> = { ...prev };
      const currentSet = new Set(next[chartIndex] ?? new Set<number>());
      if (currentSet.has(dataIndex)) {
        currentSet.delete(dataIndex);
      } else {
        currentSet.add(dataIndex);
      }
      next[chartIndex] = currentSet;
      return next;
    });
  };

  if (filterList && filterList.length > 0) {
    const uniqueItems = new Set(filterList);
    if (uniqueItems.size !== filterList.length) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();

      filterList.forEach((item) => {
        if (seen.has(item)) {
          duplicates.add(item);
        } else {
          seen.add(item);
        }
      });

      throw new Error(
        `DonutChart filterList 包含重复项: [${Array.from(duplicates).join(', ')}]. 每个筛选项必须唯一。`,
      );
    }
  }

  // 处理 ChartStatistic 组件配置
  const statistics = useMemo(() => {
    if (!statisticConfig) return null;
    return Array.isArray(statisticConfig) ? statisticConfig : [statisticConfig];
  }, [statisticConfig]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const instances = (chartRefs.current || []).filter(
      (c): c is ChartJS<'doughnut'> => !!c,
    );

    if (instances.length <= 1) {
      const target = instances[0] ?? null;
      downloadChart(target as any, 'donut-chart');
      return;
    }

    try {
      // 将多个 canvas 竖直拼接为一张图片
      const canvases = instances
        .map((inst) => (inst as any)?.canvas as HTMLCanvasElement)
        .filter(Boolean);

      if (canvases.length === 0) {
        return;
      }

      const GAP = 16; // 竖向间距
      const widths = canvases.map((c) => c.width);
      const heights = canvases.map((c) => c.height);
      const maxWidth = Math.max(...widths);
      const totalHeight =
        heights.reduce((sum, h) => sum + h, 0) + GAP * (canvases.length - 1);

      const composite = document.createElement('canvas');
      composite.width = maxWidth;
      composite.height = totalHeight;
      const ctx = composite.getContext('2d');
      if (!ctx) return;

      // 背景填充为白色，避免透明背景在 jpeg 下变黑
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, composite.width, composite.height);

      let offsetY = 0;
      canvases.forEach((c, i) => {
        const x = Math.floor((maxWidth - c.width) / 2);
        ctx.drawImage(c, x, offsetY);
        offsetY += c.height + (i < canvases.length - 1 ? GAP : 0);
      });

      const link = document.createElement('a');
      link.download = `donut-charts-${Date.now()}.png`;
      link.href = composite.toDataURL('image/png', 1);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // 兜底：任意异常回退为下载第一张
      const target = instances[0] ?? null;
      downloadChart(target as any, 'donut-chart');
    }
  };

  const shouldShowFilter =
    (filterList && filterList.length > 0) || autoCategoryData;
  const finalFilterList =
    filterList || (autoCategoryData ? autoCategoryData.categories : []);
  const finalSelectedFilter = selectedFilter || internalSelectedCategory;
  const finalOnFilterChange = onFilterChange || handleInternalCategoryChange;

  const chartFilterTheme: 'light' | 'dark' =
    (finalConfigs[0]?.theme as 'light' | 'dark') || 'light';

  const dimensions = useResponsiveDimensions(
    isMobile,
    windowWidth,
    width,
    height,
  );

  const renderConfigs: DonutChartConfig[] =
    singleMode && !configs
      ? Array.from({ length: filteredData.length }, (_, i) => ({
          showLegend: false,
          showTooltip: false,
          backgroundColor: [
            defaultColorList[i % defaultColorList.length],
            '#F7F8F9',
          ],
        }))
      : finalConfigs;

  return (
    <ChartContainer
      baseClassName={baseClassName}
      className={classNames(classNamesProp?.root, className)}
      variant={props.variant}
      style={{
        ['--donut-item-min-width' as any]: `${dimensions.width}px`,
        ...props.style,
        ...props.styles?.root,
      }}
    >
      {showToolbar && (
        <ChartContainer
          baseClassName={`${baseClassName}-toolbar-wrapper`}
          variant="borderless"
        >
          {title && (
            <ChartToolBar
              title={title}
              onDownload={handleDownload}
              extra={toolbarExtra}
              dataTime={dataTime}
              loading={loading}
              filter={
                renderFilterInToolbar && shouldShowFilter ? (
                  <ChartFilter
                    filterOptions={finalFilterList.map((item) => {
                      return {
                        label: item || '',
                        value: item || '',
                      };
                    })}
                    selectedFilter={finalSelectedFilter || ''}
                    onFilterChange={finalOnFilterChange}
                    {...(filterLabels && {
                      customOptions: filteredDataByFilterLabel,
                      selectedCustomSelection: selectedFilterLabel,
                      onSelectionChange: setSelectedFilterLabel,
                    })}
                    theme={chartFilterTheme}
                    variant="compact"
                  />
                ) : undefined
              }
            />
          )}
          {statistics && (
            <div
              className={[`${baseClassName}-statistic-container`, hashId]
                .filter(Boolean)
                .join(' ')}
            >
              {statistics.map((config, index) => (
                <ChartStatistic
                  key={index}
                  {...config}
                  theme={chartFilterTheme}
                />
              ))}
            </div>
          )}
          {!renderFilterInToolbar && shouldShowFilter && (
            <ChartFilter
              filterOptions={finalFilterList.map((item) => {
                return {
                  label: item || '',
                  value: item || '',
                };
              })}
              selectedFilter={finalSelectedFilter || ''}
              onFilterChange={finalOnFilterChange}
              {...(filterLabels && {
                customOptions: filteredDataByFilterLabel,
                selectedCustomSelection: selectedFilterLabel,
                onSelectionChange: setSelectedFilterLabel,
              })}
              theme={chartFilterTheme}
            />
          )}
        </ChartContainer>
      )}
      <ChartContainer
        baseClassName={`${baseClassName}-content`}
        variant="borderless"
      >
        {renderConfigs.map((cfg, idx) => {
          const currentDataItem = filteredData[idx];
          const isSingleValueMode = Boolean(singleMode && currentDataItem);

          let chartData = filteredData;
          if (isSingleValueMode && currentDataItem) {
            const mainValue =
              typeof currentDataItem.value === 'number'
                ? currentDataItem.value
                : Number(currentDataItem.value);
            const remainingValue = Math.max(
              0,
              100 - (Number.isFinite(mainValue) ? mainValue : 0),
            );
            chartData = [
              currentDataItem,
              {
                label: '剩余',
                value: remainingValue,
                category: currentDataItem.category,
              },
            ];
          }

          const hiddenSetForChart =
            hiddenDataIndicesByChart[idx] || new Set<number>();
          const visibleData = chartData.filter(
            (_, index) => !hiddenSetForChart.has(index),
          );
          const toNum = (v: any) => (typeof v === 'number' ? v : Number(v));
          const rawLabels = visibleData.map((d) => d.label);
          const labels = isSingleValueMode
            ? rawLabels.map((labelText, i) => (i === 1 ? '' : labelText))
            : rawLabels;
          const values = visibleData.map((d) => toNum(d.value));
          const safeValues = values.map((v) => (Number.isFinite(v) ? v : 0));
          const total = values.reduce(
            (sum, v) => sum + (Number.isFinite(v) ? v : 0),
            0,
          );
          const backgroundColors = cfg.backgroundColor || defaultColorList;

          const mainColor =
            cfg.backgroundColor?.[0] ??
            defaultColorList[idx % defaultColorList.length];

          const chartJsData = {
            labels,
            datasets: [
              {
                data: safeValues,
                backgroundColor: isSingleValueMode
                  ? [mainColor, 'transparent']
                  : backgroundColors.slice(0, values.length),
                borderColor: isSingleValueMode
                  ? [cfg.borderColor || '#fff', 'transparent']
                  : cfg.borderColor || '#fff',
                hoverBackgroundColor: isSingleValueMode
                  ? [mainColor, 'transparent']
                  : backgroundColors.slice(0, values.length),
                hoverBorderColor: isSingleValueMode
                  ? [cfg.borderColor || '#fff', 'transparent']
                  : cfg.borderColor || '#fff',
                borderWidth: cfg.chartStyle === 'pie' ? 0 : isMobile ? 1 : 1,
                spacing: isSingleValueMode
                  ? 0
                  : cfg.chartStyle === 'pie'
                    ? 0
                    : isMobile
                      ? 3
                      : 6,
                borderRadius: cfg.chartStyle === 'pie' ? 0 : 4,
                hoverOffset: (ctx: any) =>
                  isSingleValueMode && ctx?.dataIndex === 1
                    ? 0
                    : isMobile
                      ? 4
                      : 6,
              },
            ],
          };

          const cutout = (() => {
            // 如果明确指定为饼图，cutout 为 0（实心）
            if (cfg.chartStyle === 'pie') {
              return 0;
            }

            // 环形图的逻辑
            if (isMobile) {
              if (typeof cfg.cutout === 'number') return cfg.cutout * 0.9;
              return (
                (cfg.cutout as any) ??
                (isSingleValueMode ? SINGLE_MODE_MOBILE_CUTOUT : '70%')
              );
            }
            return (
              (cfg.cutout as any) ??
              (isSingleValueMode ? SINGLE_MODE_DESKTOP_CUTOUT : '75%')
            );
          })();

          const isDarkTheme = cfg.theme === 'dark';
          const tooltipBackgroundColor = isDarkTheme ? '#1F2937' : '#FFFFFF';
          const tooltipBorderColor = isDarkTheme ? '#374151' : '#E5E7EB';
          const tooltipTitleColor = isDarkTheme ? '#F9FAFB' : '#111827';
          const tooltipBodyColor = isDarkTheme ? '#D1D5DB' : '#374151';

          const options: ChartOptions<'doughnut'> = {
            responsive: true,
            maintainAspectRatio: false,
            cutout,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: cfg.showTooltip !== false,
                filter: (tooltipItem) =>
                  !(isSingleValueMode && tooltipItem.dataIndex === 1),
                backgroundColor: tooltipBackgroundColor,
                borderColor: tooltipBorderColor,
                borderWidth: 1,
                titleColor: tooltipTitleColor,
                bodyColor: tooltipBodyColor,
                padding: isMobile ? 8 : 12,
                titleFont: {
                  size: isMobile ? 12 : 14,
                },
                bodyFont: {
                  size: isMobile ? 11 : 13,
                },
                callbacks: {
                  label: ({ label, raw }) => {
                    const val = typeof raw === 'number' ? raw : Number(raw);
                    const pct =
                      total > 0 && Number.isFinite(val)
                        ? ((val / total) * 100).toFixed(0)
                        : '0';
                    return `${label}: ${Number.isFinite(val) ? val : raw} (${pct}%)`;
                  },
                },
              },
            },
            animation: {
              duration: isMobile ? 200 : 400,
            },
            interaction: {
              mode: 'point',
              intersect: false,
            },
            layout: {
              padding: isMobile ? 4 : 6,
            },
          };

          return (
            <ChartContainer
              key={idx}
              baseClassName={`${baseClassName}-chart-wrapper`}
              variant="borderless"
            >
              {isSingleValueMode ? (
                <ChartContainer
                  baseClassName={`${baseClassName}-single`}
                  variant="borderless"
                  style={{
                    ['--donut-chart-height' as any]: `${dimensions.height}px`,
                    ['--donut-chart-width' as any]: `${dimensions.width}px`,
                    width: dimensions.width,
                    height: dimensions.height,
                    marginTop: '20px',
                    ...(isMobile ? { margin: '0 auto' } : {}),
                  }}
                >
                  <Doughnut
                    ref={(instance) => {
                      chartRefs.current[idx] = instance as any;
                    }}
                    data={chartJsData}
                    options={options}
                    plugins={[
                      // 只有环形图才显示中心文本和背景
                      ...(cfg.chartStyle !== 'pie'
                        ? [
                            createCenterTextPlugin(
                              ((typeof (currentDataItem as any).value ===
                              'number'
                                ? (currentDataItem as any).value
                                : Number((currentDataItem as any).value)) /
                                (total || 1)) *
                                100,
                              (currentDataItem as any).label,
                              isMobile,
                            ),
                            createBackgroundArcPlugin(), // 背景色
                          ]
                        : []),
                    ]}
                  />
                </ChartContainer>
              ) : (
                <ChartContainer
                  baseClassName={`${baseClassName}-row`}
                  variant="borderless"
                  style={{
                    ...(isMobile
                      ? { flexDirection: 'column', alignItems: 'stretch' }
                      : {}),
                  }}
                >
                  <ChartContainer
                    baseClassName={`${baseClassName}-chart`}
                    variant="borderless"
                    style={{
                      ['--donut-chart-width' as any]: `${dimensions.chartWidth}px`,
                      ['--donut-chart-height' as any]: `${dimensions.chartHeight}px`,
                      width: dimensions.chartWidth,
                      height: dimensions.chartHeight,
                      marginTop: '20px',
                    }}
                  >
                    <Doughnut
                      ref={(instance) => {
                        chartRefs.current[idx] = instance as any;
                      }}
                      data={chartJsData}
                      options={options}
                    />
                  </ChartContainer>
                  {cfg.showLegend && (
                    <LegendView
                      chartData={chartData}
                      backgroundColors={backgroundColors}
                      hiddenDataIndicesByChart={hiddenDataIndicesByChart}
                      chartIndex={idx}
                      onLegendItemClick={(dataIndex) =>
                        handleLegendItemClick(idx, dataIndex)
                      }
                      total={total}
                      baseClassName={baseClassName}
                      hashId={hashId}
                      isMobile={isMobile}
                    />
                  )}
                </ChartContainer>
              )}
            </ChartContainer>
          );
        })}
      </ChartContainer>
    </ChartContainer>
  );
};

export default DonutChart;
