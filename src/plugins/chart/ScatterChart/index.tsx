import { ConfigProvider } from 'antd';
import {
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
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
import { useStyle } from './style';

let scatterChartComponentsRegistered = false;

// 散点图数据项接口 - 扁平化数据格式
export interface ScatterChartDataItem {
  category?: string;
  type?: string;
  x: number | string;
  y: number | string;
  filterLabel?: string;
}

export interface ScatterChartProps extends ChartContainerProps {
  /** 扁平化数据数组 */
  data: ScatterChartDataItem[];
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
  /** 自定义主色（可选），支持 string 或 string[]；数组按序对应各数据序列 */
  color?: string | string[];
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** 是否将过滤器渲染到工具栏 */
  renderFilterInToolbar?: boolean;
  /** X轴单位 */
  xUnit?: string;
  /** Y轴单位 */
  yUnit?: string;
  /** X轴标签 */
  xAxisLabel?: string;
  /** Y轴标签 */
  yAxisLabel?: string;
  /** X轴位置 */
  xPosition?: 'top' | 'bottom';
  /** Y轴位置 */
  yPosition?: 'left' | 'right';
  /** 是否隐藏X轴，默认false */
  hiddenX?: boolean;
  /** 是否隐藏Y轴，默认false */
  hiddenY?: boolean;
  /** 是否显示网格线，默认true */
  showGrid?: boolean;
  /** ChartStatistic组件配置：object表示单个配置，array表示多个配置 */
  statistic?: StatisticConfigType;
  /** 图例文字最大宽度（像素），超出则显示省略号，默认80px */
  textMaxWidth?: number;
  /** 是否显示加载状态（当图表未闭合时显示） */
  loading?: boolean;
  /** 自定义样式对象（支持对象格式，为每层DOM设置样式） */
  styles?: ChartStyles;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  width = 600,
  height = 400,
  className,
  classNames: classNamesProp,
  title,
  toolbarExtra,
  renderFilterInToolbar = false,
  dataTime,
  xUnit = '月',
  yUnit,
  xAxisLabel,
  yAxisLabel,
  xPosition = 'bottom',
  yPosition = 'left',
  hiddenX = false,
  hiddenY = false,
  showGrid = true,
  color,
  statistic: statisticConfig,
  textMaxWidth = 80,
  loading = false,
  ...props
}) => {
  useMemo(() => {
    if (scatterChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);
    scatterChartComponentsRegistered = true;
    return undefined;
  }, []);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('scatter-chart');
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

  // 清理自定义tooltip
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      if (tooltipEl) {
        document.body.removeChild(tooltipEl);
      }
    };
  }, []);
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  // 数据安全检查和处理 - 直接处理，不用 useMemo
  const safeData =
    !data || !Array.isArray(data)
      ? []
      : data.filter(
          (item): item is ScatterChartDataItem =>
            item !== null &&
            item !== undefined &&
            typeof item === 'object' &&
            'x' in item &&
            'y' in item,
        );

  // 从扁平化数据中提取分类，添加安全检查
  const categories = Array.from(
    new Set(
      safeData
        .map((item) => item?.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );

  // 从数据中提取 filterLabel，过滤掉 undefined 值，添加安全检查
  const validFilterLabels = safeData
    .map((item) => item?.filterLabel)
    .filter(
      (category): category is string =>
        category !== undefined && category !== null && Boolean(category),
    );

  const filterLabels: string[] | undefined =
    validFilterLabels.length > 0
      ? Array.from(new Set(validFilterLabels))
      : undefined;

  // 状态管理，添加安全检查
  const [selectedFilter, setSelectedFilter] = useState(
    () => categories.find((cat): cat is string => Boolean(cat)) || '',
  );
  const [selectedFilterLabel, setSelectedFilterLabel] = useState(() =>
    filterLabels && filterLabels.length > 0 ? filterLabels[0] : undefined,
  );

  // 根据选定的分类筛选数据，添加安全检查
  const filteredData = safeData.filter((item) => {
    if (!item) return false; // 额外的安全检查
    if (!selectedFilter) return true;
    const categoryMatch = item?.category === selectedFilter;
    // 如果没有 filterLabels 或 selectedFilterLabel，只按 category 筛选
    if (!filterLabels || !selectedFilterLabel) {
      return categoryMatch;
    }
    // 如果有 filterLabel 筛选，需要同时匹配 category 和 filterLabel
    return categoryMatch && item?.filterLabel === selectedFilterLabel;
  });

  // 提取数据集类型，添加安全检查
  const datasetTypes = Array.from(
    new Set(
      filteredData
        .map((item) => item?.type)
        .filter((type): type is string => Boolean(type)),
    ),
  );

  const classNamesObj = classNamesProp;

  // 如果没有有效数据，返回空状态
  if (safeData.length === 0 || datasetTypes.length === 0) {
    return wrapSSR(
      <ChartContainer
        baseClassName={classNames(`${prefixCls}-container`)}
        theme={'light'}
        className={classNames(classNamesObj?.root, hashId, className)}
        isMobile={isMobile}
        variant={props.variant}
        style={{
          width: responsiveWidth,
          height: responsiveHeight,
          ...props.style,
          ...props.styles?.root,
        }}
      >
        <ChartToolBar
          title={title || '散点图'}
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

  // 构建数据集，添加更强的安全检查
  const datasets = datasetTypes.map((type, index) => {
    const typeData = filteredData.filter((item) => item?.type === type);
    const coordinates = typeData.map((item) => {
      if (!item) return { x: 0, y: 0 };

      // 增强的 x, y 坐标处理
      let x = 0,
        y = 0;

      // 处理 x 坐标
      if (item.x !== null && item.x !== undefined) {
        if (typeof item.x === 'number') {
          x = Number.isFinite(item.x) ? item.x : 0;
        } else if (typeof item.x === 'string') {
          const trimmed = item.x.trim();
          if (trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined') {
            const parsed = Number(trimmed);
            x = Number.isFinite(parsed) ? parsed : 0;
          }
        }
      }

      // 处理 y 坐标
      if (item.y !== null && item.y !== undefined) {
        if (typeof item.y === 'number') {
          y = Number.isFinite(item.y) ? item.y : 0;
        } else if (typeof item.y === 'string') {
          const trimmed = item.y.trim();
          if (trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined') {
            const parsed = Number(trimmed);
            y = Number.isFinite(parsed) ? parsed : 0;
          }
        }
      }

      return { x, y };
    });

    // 根据 color prop 选择颜色
    const providedColor = color;
    const baseColor = Array.isArray(providedColor)
      ? providedColor[index % providedColor.length]
      : providedColor;

    // 确保颜色数组安全访问
    const safeIndex = Math.max(0, index % defaultColorList.length);
    const safeDefaultColor = defaultColorList[safeIndex] || '#1677ff';

    const finalColor = baseColor || safeDefaultColor;

    return {
      label: type || '默认',
      data: coordinates,
      backgroundColor: `${finalColor}99`,
      borderColor: finalColor,
      pointRadius: isMobile ? 4 : 6,
      pointHoverRadius: isMobile ? 6 : 8,
    };
  });

  // 构建当前配置（应用默认值）
  const currentConfig = {
    theme: 'light' as const,
    showLegend: true,
    legendPosition: 'bottom' as const,
  };

  // 筛选器的枚举，添加安全检查
  const filterEnum =
    categories.length > 0
      ? categories
          .filter((category): category is string => Boolean(category))
          .map((category) => ({
            label: category,
            value: category,
          }))
      : [];

  // 根据 filterLabel 筛选数据 - 只有当 filterLabels 存在时才生成
  const filteredDataByFilterLabel = filterLabels?.map((item) => ({
    key: item,
    label: item,
  }));

  // 处理数据，应用默认颜色，添加最终安全检查
  const processedData: ChartData<'scatter'> = {
    datasets:
      datasets.length > 0
        ? datasets
        : [
            {
              label: '默认',
              data: [{ x: 0, y: 0 }],
              backgroundColor: `${defaultColorList[0] || '#1677ff'}99`,
              borderColor: defaultColorList[0] || '#1677ff',
              pointRadius: isMobile ? 4 : 6,
              pointHoverRadius: isMobile ? 6 : 8,
            },
          ],
  };

  // 图表配置选项
  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: currentConfig.showLegend !== false,
        position: isMobile
          ? 'bottom'
          : ((currentConfig.legendPosition || 'bottom') as
              | 'top'
              | 'left'
              | 'bottom'
              | 'right'),
        align: 'start',
        labels: {
          color: currentConfig.theme === 'light' ? '#767E8B' : '#fff',
          font: {
            size: isMobile ? 10 : 12,
            weight: 'normal',
          },
          padding: isMobile ? 10 : 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          generateLabels: (chart) => {
            const original =
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

            // 创建一个临时 canvas 来测量文字宽度
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return original;

            // 设置字体样式与图例相同
            const fontSize = isMobile ? 10 : 12;
            ctx.font = `${fontSize}px 'PingFang SC', sans-serif`;

            return original.map((label) => {
              const originalText = label.text;
              const textWidth = ctx.measureText(originalText).width;

              if (textWidth <= textMaxWidth) {
                return label;
              }

              // 文字超过最大宽度，需要截断
              const ellipsis = '...';
              const ellipsisWidth = ctx.measureText(ellipsis).width;
              const maxTextWidth = textMaxWidth - ellipsisWidth;

              let truncatedText = originalText;
              let truncatedWidth = textWidth;

              // 逐个字符减少直到宽度符合要求
              while (
                truncatedWidth > maxTextWidth &&
                truncatedText.length > 0
              ) {
                truncatedText = truncatedText.slice(0, -1);
                truncatedWidth = ctx.measureText(truncatedText).width;
              }

              return {
                ...label,
                text: truncatedText + ellipsis,
              };
            });
          },
        },
      },
      tooltip: {
        enabled: false, // 禁用默认 tooltip
        external: (context) => {
          const { chart, tooltip } = context;

          // 如果没有 tooltip 数据，隐藏
          if (tooltip.opacity === 0) {
            const tooltipEl = document.getElementById('custom-scatter-tooltip');
            if (tooltipEl) {
              tooltipEl.style.opacity = '0';
            }
            return;
          }

          // 获取或创建自定义 tooltip 元素
          let tooltipEl = document.getElementById('custom-scatter-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'custom-scatter-tooltip';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.transition = 'all 0.1s ease';
            document.body.appendChild(tooltipEl);
          }

          // 获取数据，添加安全检查
          if (!tooltip.dataPoints || tooltip.dataPoints.length === 0) {
            return;
          }

          const dataPoint = tooltip.dataPoints[0];
          if (!dataPoint) {
            return;
          }

          // 安全获取坐标数据
          let xValue = '',
            yValue = '';
          try {
            const rawX = dataPoint?.parsed?.x;
            const rawY = dataPoint?.parsed?.y;

            if (typeof rawX === 'number' && Number.isFinite(rawX)) {
              xValue = String(rawX);
            } else {
              xValue = String(rawX || 0);
            }

            if (typeof rawY === 'number' && Number.isFinite(rawY)) {
              yValue = String(rawY);
            } else {
              yValue = String(rawY || 0);
            }
          } catch (error) {
            xValue = '0';
            yValue = '0';
          }

          const dimensionTitle = xUnit ? `${xValue}${xUnit}` : xValue;
          const label = dataPoint?.dataset?.label?.toString() || '数据指标';
          const coordinates = yUnit ? `${yValue}${yUnit}` : yValue;

          // 获取数据集颜色作为图标颜色
          const iconColor =
            dataPoint?.dataset?.borderColor?.toString() || '#917EF7';

          // 创建 HTML 内容
          const isDark = currentConfig.theme !== 'light';
          const bgColor = isDark
            ? 'rgba(0, 0, 0, 0.8)'
            : 'rgba(255, 255, 255, 0.95)';
          const labelColor = isDark ? '#fff' : '#767E8B'; // 左边图标信息颜色

          tooltipEl.innerHTML = `
            <div style="
              background-color: ${bgColor};
              border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 16, 32, 0.0627)'};
              border-radius: ${isMobile ? '6px' : '8px'};
              padding: ${isMobile ? '8px 12px' : '12px 16px'};
              font-family: 'PingFang SC', sans-serif;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              backdrop-filter: blur(10px);
              display: flex;
              flex-direction: column;
              gap: 8px;
              min-width: 120px;
            ">
              <div style="
                font-family: 'PingFang SC', sans-serif;
                font-size: 12px;
                font-weight: normal;
                line-height: 20px;
                text-align: center;
                letter-spacing: 0em;
                font-variation-settings: 'opsz' auto;
                color: #767E8B;
                display: flex;
                align-items: center;
                justify-content: space-between;
              ">${dimensionTitle}</div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                ">
                  <div style="
                    width: 12px;
                    height: 12px;
                    background-color: ${iconColor};
                    border-radius: 2px;
                    flex-shrink: 0;
                  "></div>
                  <span style="
                    color: ${labelColor};
                    font-size: ${isMobile ? '11px' : '12px'};
                    font-weight: 500;
                    font-family: 'PingFang SC', sans-serif;
                    white-space: nowrap;
                  ">${label}</span>
                </div>
                <span style="
                  font-family: Rubik, sans-serif;
                  font-size: 13px;
                  font-weight: 500;
                  line-height: 13px;
                  text-align: center;
                  letter-spacing: 0.04em;
                  font-variation-settings: 'opsz' auto;
                  font-feature-settings: 'kern' on;
                  color: #343A45;
                  white-space: nowrap;
                ">${coordinates}</span>
              </div>
            </div>
          `;

          // 定位 tooltip
          const position = chart.canvas.getBoundingClientRect();

          tooltipEl.style.opacity = '1';
          tooltipEl.style.left =
            position.left + window.pageXOffset + tooltip.caretX + 'px';
          tooltipEl.style.top =
            position.top + window.pageYOffset + tooltip.caretY + 'px';
          tooltipEl.style.zIndex = '1000';
        },
      },
    },
    scales: {
      x: {
        display: !hiddenX,
        type: 'linear',
        position: xPosition,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel || '',
          color:
            currentConfig.theme === 'light'
              ? 'rgba(0, 25, 61, 0.3255)'
              : '#fff',
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
        },
        min: 1, // 使用默认值
        max: 12, // 使用默认值
        ticks: {
          stepSize: 1, // 使用默认值
          color:
            currentConfig.theme === 'light'
              ? 'rgba(0, 25, 61, 0.3255)'
              : '#fff',
          font: {
            size: isMobile ? 8 : 10,
          },
          callback: function (value: any) {
            return xUnit ? `${value}${xUnit}` : `${value}`;
          },
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 16, 32, 0.0627)',
          lineWidth: 1,
        },
      },
      y: {
        display: !hiddenY,
        type: 'linear',
        position: yPosition,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel || '',
          color:
            currentConfig.theme === 'light'
              ? 'rgba(0, 25, 61, 0.3255)'
              : '#fff',
          font: {
            family: 'PingFang SC',
            size: isMobile ? 10 : 12,
            weight: 'normal',
          },
          align: 'center',
        },
        min: 0, // 使用默认值
        max: 100, // 使用默认值
        ticks: {
          stepSize: 10, // 使用默认值
          color:
            currentConfig.theme === 'light'
              ? 'rgba(0, 25, 61, 0.3255)'
              : '#fff',
          font: {
            family: 'PingFang SC',
            size: isMobile ? 8 : 12,
            weight: 'normal',
          },
          callback: function (value: any) {
            return yUnit ? `${value}${yUnit}` : `${value}`;
          },
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 16, 32, 0.0627)',
          lineWidth: 1,
        },
      },
    },
    elements: {
      point: {
        hoverRadius: isMobile ? 6 : 8,
      },
    },
    animation: {
      duration: isMobile ? 200 : 400,
    },
  };

  const handleDownload = () => {
    try {
      if (chartRef.current) {
        downloadChart(chartRef.current, 'scatter-chart');
      }
    } catch (error) {
      console.warn('图表下载失败:', error);
    }
  };

  // 最终渲染，包含错误边界
  try {
    return wrapSSR(
      <ChartContainer
        baseClassName={classNames(`${prefixCls}-container`)}
        theme={currentConfig.theme}
        className={classNames(classNamesObj?.root, hashId, className)}
        isMobile={isMobile}
        variant={props.variant}
        style={{
          width: responsiveWidth,
          height: responsiveHeight,
          ...props.style,
          ...props.styles?.root,
        }}
      >
        <ChartToolBar
          title={title || '散点图'}
          onDownload={handleDownload}
          extra={toolbarExtra}
          dataTime={dataTime}
          loading={loading}
          filter={
            renderFilterInToolbar && filterEnum.length > 0 ? (
              <ChartFilter
                filterOptions={filterEnum}
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                {...(filterLabels && {
                  customOptions: filteredDataByFilterLabel,
                  selectedCustomSelection: selectedFilterLabel,
                  onSelectionChange: setSelectedFilterLabel,
                })}
                theme={currentConfig.theme}
                variant="compact"
              />
            ) : undefined
          }
        />

        {!renderFilterInToolbar && filterEnum.length > 0 && (
          <ChartFilter
            filterOptions={filterEnum}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            {...(filterLabels && {
              customOptions: filteredDataByFilterLabel,
              selectedCustomSelection: selectedFilterLabel,
              onSelectionChange: setSelectedFilterLabel,
            })}
            theme={currentConfig.theme}
          />
        )}

        {/* 统计数据组件 */}
        {statistics && (
          <div
            className={classNames(
              classNamesObj?.statisticContainer,
              `${prefixCls}-statistic-container`,
            )}
            style={props.styles?.statisticContainer}
          >
            {statistics.map((config, index) => (
              <ChartStatistic
                key={index}
                {...config}
                theme={currentConfig.theme}
              />
            ))}
          </div>
        )}

        <div
          className={classNames(
            classNamesObj?.wrapper,
            `${prefixCls}-chart-wrapper`,
          )}
          style={{
            height: responsiveHeight,
            ...props.styles?.wrapper,
          }}
        >
          <Scatter ref={chartRef} data={processedData} options={options} />
        </div>
      </ChartContainer>,
    );
  } catch (error) {
    console.error('ScatterChart 渲染错误:', error);
    return wrapSSR(
      <ChartContainer
        baseClassName={classNames(`${prefixCls}-container`)}
        theme={'light'}
        isMobile={isMobile}
        className={classNames(hashId, className)}
        variant={props.variant}
        style={{
          width: responsiveWidth,
          height: responsiveHeight,
          ...props.style,
          ...props.styles?.root,
        }}
      >
        <ChartToolBar
          title={title || '散点图'}
          onDownload={() => {}}
          extra={toolbarExtra}
          dataTime={dataTime}
          loading={loading}
        />
        <div
          className={classNames(`${prefixCls}-error-wrapper`, hashId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: responsiveHeight,
            color: '#ff4d4f',
            fontSize: '14px',
          }}
        >
          图表渲染失败，请检查数据格式
        </div>
      </ChartContainer>,
    );
  }
};

export default ScatterChart;
