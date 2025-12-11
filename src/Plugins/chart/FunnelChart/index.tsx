import { ConfigProvider } from 'antd';
import type { LegendItem, PointStyle } from 'chart.js';
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
import classNames from 'classnames';
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
import { findDataPointByXValue, isXValueEqual, toNumber } from '../utils';
import { useStyle } from './style';

let funnelChartComponentsRegistered = false;

export interface FunnelChartDataItem {
  /** 数据类别 */
  category?: string;
  /** 数据类型 */
  type?: string;
  /** X轴值 */
  x: number | string;
  /** Y轴值 */
  y: number | string;
  /** 筛选标签 */
  filterLabel?: string;
  /** 当前层与下一层的比率（百分比，0-100，最后一层可为0）*/
  ratio?: number | string;
}

export interface FunnelChartProps extends ChartContainerProps {
  /** 扁平化数据数组（x 为阶段名，y 为数值） */
  data: FunnelChartDataItem[];
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
  /** 自定义主色 */
  color?: string;
  /** 是否显示图例，默认true */
  showLegend?: boolean;
  /** 图例位置 */
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  /** 图例水平对齐方式 */
  legendAlign?: 'start' | 'center' | 'end';
  /** 是否显示百分比（相对第一层） */
  showPercent?: boolean;
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** 是否将过滤器渲染到工具栏 */
  renderFilterInToolbar?: boolean;
  /** 最底层的最小宽度占比（0-1），相对于最顶层的宽度，0-不限制 */
  bottomLayerMinWidth?: number;
  /** ChartStatistic组件配置：object表示单个配置，array表示多个配置 */
  statistic?: StatisticConfigType;

  typeNames?: {
    rate?: string;
    /** 类型名称，用于图例和数据集标签 */
    name: string;
  };
  /** 是否显示加载状态（当图表未闭合时显示） */
  loading?: boolean;
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  title,
  data,
  color,
  width = 600,
  height = 400,
  className,
  dataTime,
  theme = 'light',
  showLegend = true,
  legendPosition = 'bottom',
  legendAlign = 'start',
  showPercent = true,
  toolbarExtra,
  renderFilterInToolbar = false,
  bottomLayerMinWidth = 0,
  typeNames,
  statistic: statisticConfig,
  loading = false,
  ...props
}) => {
  useMemo(() => {
    if (funnelChartComponentsRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
    funnelChartComponentsRegistered = true;
    return undefined;
  }, []);

  const safeData = Array.isArray(data) ? data : [];

  // 处理 ChartStatistic 组件配置
  const statistics = useMemo(() => {
    if (!statisticConfig) return null;
    return Array.isArray(statisticConfig) ? statisticConfig : [statisticConfig];
  }, [statisticConfig]);

  // 响应式尺寸
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768,
  );
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // 样式注册
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls('funnel-chart-container');
  const { hashId, wrapSSR } = useStyle(baseClassName);

  const chartRef = useRef<ChartJS<'bar'>>(null);
  const [showTrapezoid, setShowTrapezoid] = useState(true);
  const [pluginToggleKey, setPluginToggleKey] = useState(0);

  // 类别筛选（外层）
  const categories = useMemo(() => {
    return [...new Set(safeData.map((d) => d.category))];
  }, [safeData]);

  // 状态
  const [selectedFilter, setSelectedFilter] = useState<string>(
    categories.find(Boolean) || '',
  );
  const [selectedFilterLabel, setSelectedFilterLabel] = useState<
    string | undefined
  >(undefined);

  // 二级筛选（可选）- 仅基于当前选中 category 的可用标签
  const filterLabels = useMemo(() => {
    const labels = safeData
      .filter((d) => !selectedFilter || d.category === selectedFilter)
      .map((d) => d.filterLabel)
      .filter((v): v is string => v !== undefined);
    return labels.length > 0 ? [...new Set(labels)] : undefined;
  }, [safeData, selectedFilter]);

  // 当切换 category 时，如当前二级筛选不在可选列表中，则重置为该类目第一项或清空
  useEffect(() => {
    const first =
      filterLabels && filterLabels.length > 0 ? filterLabels[0] : undefined;
    if (!filterLabels || filterLabels.length === 0) {
      if (selectedFilterLabel !== undefined) setSelectedFilterLabel(undefined);
      return;
    }
    if (!selectedFilterLabel || !filterLabels.includes(selectedFilterLabel)) {
      setSelectedFilterLabel(first);
    }
  }, [filterLabels]);

  // 数据筛选
  const filteredData = useMemo(() => {
    const base = selectedFilter
      ? safeData.filter((d) => d.category === selectedFilter)
      : safeData;
    const withFilterLabel =
      !filterLabels || !selectedFilterLabel
        ? base
        : base.filter((d) => d.filterLabel === selectedFilterLabel);
    // 统一过滤掉 x 为空（null/undefined）的数据，避免后续 toString 报错
    return withFilterLabel.filter((d) => d.x !== null && d.x !== undefined);
  }, [safeData, selectedFilter, filterLabels, selectedFilterLabel]);

  // 阶段（使用 x 值作为阶段名称），按 y 从大到小排序以符合漏斗习惯
  const stages = useMemo(() => {
    const unique = [
      ...new Set(
        filteredData
          .map((d) => d.x)
          .filter((x) => x !== null && x !== undefined),
      ),
    ];
    // 映射阶段 -> 数值
    const values = unique.map((x) => {
      const dp = findDataPointByXValue(filteredData, x);
      const n = toNumber(dp?.y, 0);
      return { x, n };
    });
    // 降序
    values.sort((a, b) => b.n - a.n);
    return values.map((v) => v.x);
  }, [filteredData]);

  const BAR_THICKNESS = 30;
  const ROW_GAP = 24;
  const PADDING_Y = isMobile ? 48 : 64;

  // 计算图表高度
  const chartHeight = useMemo(() => {
    const rows = Math.max(1, stages.length);
    return rows * (BAR_THICKNESS + ROW_GAP) + PADDING_Y;
  }, [stages.length, PADDING_Y]);

  // 最终高度计算逻辑
  const finalHeight = useMemo(() => {
    if (typeof height === 'number') {
      return height;
    } else if (typeof height === 'string' && height.includes('px')) {
      return parseInt(height, 10) || chartHeight;
    }
    return chartHeight;
  }, [height, chartHeight]);

  // 原始值
  const originalValues = useMemo(() => {
    return stages.map((x) => {
      const dp = findDataPointByXValue(filteredData, x);
      return toNumber(dp?.y, 0);
    });
  }, [filteredData, stages]);

  // 计算数据：使用浮动条 [-w/2, w/2] 居中呈现，形成对称“漏斗条”
  const processedData: ChartData<
    'bar',
    (number | [number, number] | null)[],
    string
  > = useMemo(() => {
    const baseColor = color || defaultColorList[0];
    const labels = stages.map((x) => x.toString());

    const values = stages.map((x) => {
      const dp = findDataPointByXValue(filteredData, x);
      const n = toNumber(dp?.y, 0);
      return n;
    });

    // 取当前数据的类型名作为数据集 label
    const typeName = typeNames?.name || '转化';

    // 应用最小宽度约束
    const adjustedValues = (() => {
      // 非法值（≤0 或 >1）都视为不限制
      if (
        bottomLayerMinWidth <= 0 ||
        bottomLayerMinWidth > 1 ||
        values.length === 0
      ) {
        return values;
      }

      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      // 如果最小值已经满足最小宽度要求，无需调整
      if (minValue >= maxValue * bottomLayerMinWidth) {
        return values;
      }

      // 线性映射到 [minWidth, maxValue] 区间
      const minWidth = bottomLayerMinWidth * maxValue;
      const range = maxValue - minValue;

      return values.map((v) => {
        if (range === 0) return maxValue;
        const normalized = (v - minValue) / range;
        return minWidth + normalized * (maxValue - minWidth);
      });
    })();

    // 中心对称的浮动条：[-v/2, v/2]
    const datasetData: [number, number][] = adjustedValues.map(
      (v) => [-v / 2, v / 2] as [number, number],
    );

    // 生成从上到下由深到浅的颜色
    const hexToRgb = (hex: string) => {
      const s = hex.replace('#', '');
      const bigint = parseInt(s, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };
    const rgbToHex = (r: number, g: number, b: number) =>
      `#${[r, g, b]
        .map((v) =>
          Math.max(0, Math.min(255, Math.round(v)))
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')}`;
    const lighten = (hex: string, t: number) => {
      const { r, g, b } = hexToRgb(hex);
      const lr = r + (255 - r) * t;
      const lg = g + (255 - g) * t;
      const lb = b + (255 - b) * t;
      return rgbToHex(lr, lg, lb);
    };
    const count = Math.max(1, stages.length - 1);
    const colorList = stages.map((_, i) => {
      const t = (i / count) * 0.6; // 限制变浅上限，避免变白
      return lighten(baseColor, t);
    });

    return {
      labels,
      datasets: [
        {
          label: typeName,
          data: datasetData,
          backgroundColor: colorList,
          borderColor: colorList,
          borderWidth: 0,
          borderRadius: 0,
          borderSkipped: false,
          barThickness: BAR_THICKNESS,
          categoryPercentage: 1,
          barPercentage: 1,
        },
      ],
    };
  }, [filteredData, stages, bottomLayerMinWidth, color, typeNames]);

  const ratioDisplay = useMemo(() => {
    const formatRaw = (v: any): string | undefined => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) return undefined;
        return s.endsWith('%') ? s : `${s}%`;
      }
      if (typeof v === 'number' && Number.isFinite(v)) {
        return `${String(v)}%`;
      }
      return undefined;
    };
    // 检查除顶层外，是否至少有一层提供了 ratio
    const anyNonTopProvided = stages.some((_, i) => {
      if (i === 0) return false;
      const prevStage = stages[i - 1];
      const dp = (filteredData || []).find((d) =>
        isXValueEqual(d.x, prevStage),
      );
      const v = dp?.ratio;
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      return true;
    });
    return stages.map((_, i) => {
      if (i === 0) return anyNonTopProvided ? '100%' : undefined;
      const prevStage = stages[i - 1];
      const dp = (filteredData || []).find((d) =>
        isXValueEqual(d.x, prevStage),
      );
      return formatRaw(dp?.ratio);
    });
  }, [filteredData, stages]);

  const ratioProvided = useMemo(() => {
    return stages.map((_, i) => {
      if (i === 0) return false;
      const prevStage = stages[i - 1];
      const dp = (filteredData || []).find((d) =>
        isXValueEqual(d.x, prevStage),
      );
      const v = dp?.ratio;
      if (v === null || v === undefined) return false;
      if (typeof v === 'string') return v.trim() !== '';
      return true;
    });
  }, [filteredData, stages]);

  // 过滤器选项
  const filterOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: c || '默认',
        value: c || '默认',
      })),
    [categories],
  );

  const customOptions = useMemo(() => {
    return filterLabels?.map((l) => ({ key: l, label: l }));
  }, [filterLabels]);

  const isLight = theme === 'light';
  const axisTextColor = isLight
    ? 'rgba(0, 25, 61, 0.3255)'
    : 'rgba(255, 255, 255, 0.8)';

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: {
        left: 8,
        right: isMobile ? 72 : 96,
        top: 8,
        bottom: 8,
      },
    },
    parsing: {
      // 允许使用 [start, end] 浮动条
      xAxisKey: undefined,
      yAxisKey: undefined,
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
          generateLabels: (chart): LegendItem[] => {
            // @ts-ignore
            const base: LegendItem[] = (
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart) || []
            ).map((it) => ({
              ...it,
              pointStyle: 'rectRounded' as PointStyle,
            }));
            // 若除顶层外没有任何 ratio，则移除“转化率”图例
            const anyNonTopProvided = stages.some((_, i) => {
              if (i === 0) return false;
              const prevStage = stages[i - 1];
              const dp = (filteredData || []).find((d) =>
                isXValueEqual(d.x, prevStage),
              );
              const v = dp?.ratio;
              if (v === null || v === undefined) return false;
              if (typeof v === 'string') return v.trim() !== '';
              return true;
            });
            if (!anyNonTopProvided) return base;
            return [
              ...base,
              {
                text: typeNames?.rate || '转化率',
                fillStyle: '#F1F2F4',
                strokeStyle: '#F1F2F4',
                lineWidth: 0,
                hidden: !showTrapezoid,
                datasetIndex: chart.data.datasets.length,
                pointStyle: 'rectRounded' as PointStyle,
              },
            ];
          },
        },
        onClick: (e, legendItem, legend) => {
          if (legendItem.text === (typeNames?.rate || '转化率')) {
            setShowTrapezoid((v) => !v);
            setPluginToggleKey((k) => k + 1);
            return;
          }
          // 其它保持默认行为
          // @ts-ignore
          const defaultClick = ChartJS.defaults.plugins.legend.onClick;
          if (typeof defaultClick === 'function')
            defaultClick.call(legend, e, legendItem, legend);
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
        padding: 8,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const it = items?.[0];
            return it?.label ? String(it.label) : '';
          },
          label: (ctx) => {
            // 使用原始值而非调整后的视觉宽度
            const idx = ctx.dataIndex ?? 0;
            const originalValue = originalValues?.[idx] ?? 0;
            const percentStr: string | undefined = ratioDisplay?.[idx];
            // 仅当传入了 ratio 时展示百分比，否则只展示数值
            if (showPercent === false || !percentStr) {
              return `${originalValue}`;
            }
            return `${originalValue}（${percentStr}）`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: { display: false },
        ticks: { display: false },
        title: { display: false },
        border: { display: false },
        afterFit: (scale) => {
          const rows = Math.max(1, stages.length);
          const per = BAR_THICKNESS + ROW_GAP;
          const total = rows * per;
          scale.height = total;
        },
      },
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        title: {
          display: false,
        },
        border: { display: false },
      },
    },
    animation: {
      duration: isMobile ? 200 : 400,
    },
  };

  const handleDownload = () => downloadChart(chartRef.current, 'funnel-chart');

  // 中间梯形 + 比率文本（梯形 #F1F2F4，文本 #626F86）
  const trapezoidPlugin = useMemo(() => {
    return {
      id: 'funnelTrapezoidLabels',
      afterDatasetsDraw: (chart: any) => {
        if (!showTrapezoid) return;
        const { ctx, data: cdata, scales } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta) return;
        const xScale = scales?.x;
        const ds = cdata?.datasets?.[0]?.data || [];

        const providedRatioText: (string | undefined)[] = ratioDisplay;
        const providedFlags: boolean[] = ratioProvided;

        const centerX = xScale?.getPixelForValue
          ? xScale.getPixelForValue(0)
          : undefined;

        // 逐对绘制 i 与 i+1 之间的梯形
        for (let i = 0; i < meta.data.length - 1; i++) {
          const elTop = meta.data[i];
          const elBot = meta.data[i + 1];
          const rawTop = ds?.[i];
          const rawBot = ds?.[i + 1];
          if (!Array.isArray(rawTop) || !Array.isArray(rawBot)) continue;

          // 顶部、底部条的像素左右与宽度
          const [sTop, eTop] = [Number(rawTop[0] ?? 0), Number(rawTop[1] ?? 0)];
          const [sBot, eBot] = [Number(rawBot[0] ?? 0), Number(rawBot[1] ?? 0)];
          const topLx = xScale?.getPixelForValue
            ? xScale.getPixelForValue(Math.min(sTop, eTop))
            : elTop.x - Math.abs(eTop - sTop) / 2;
          const topRx = xScale?.getPixelForValue
            ? xScale.getPixelForValue(Math.max(sTop, eTop))
            : elTop.x + Math.abs(eTop - sTop) / 2;
          const botLx = xScale?.getPixelForValue
            ? xScale.getPixelForValue(Math.min(sBot, eBot))
            : elBot.x - Math.abs(eBot - sBot) / 2;
          const botRx = xScale?.getPixelForValue
            ? xScale.getPixelForValue(Math.max(sBot, eBot))
            : elBot.x + Math.abs(eBot - sBot) / 2;

          const dpr =
            (typeof window !== 'undefined' && (window.devicePixelRatio || 1)) ||
            1;
          const seam = (isMobile ? 0.25 : 0.35) / dpr;
          const joinTop = elTop.y + elTop.height / 2;
          const joinBot = elBot.y - elBot.height / 2;
          const topY = joinTop + seam;
          const botY = joinBot - seam;

          // 如果该层未显式提供 ratio，则不绘制梯形
          if (!providedFlags?.[i + 1]) {
            continue;
          }
          const ratioText = providedRatioText?.[i + 1] ?? '0%';

          // 梯形边与上下柱完全对齐
          const topL = Math.min(topLx, topRx);
          const topR = Math.max(topLx, topRx);
          const botL = Math.min(botLx, botRx);
          const botR = Math.max(botLx, botRx);

          // 绘制梯形
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(topL, topY);
          ctx.lineTo(topR, topY);
          ctx.lineTo(botR, botY);
          ctx.lineTo(botL, botY);
          ctx.closePath();
          ctx.fillStyle = '#F1F2F4';
          ctx.fill();

          // 文本（展示该比率）
          const midY = (topY + botY) / 2;
          const cx =
            centerX ?? (Math.min(topL, botL) + Math.max(topR, botR)) / 2;
          ctx.fillStyle = '#626F86';
          ctx.font = `${isMobile ? 10 : 12}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(ratioText), cx, midY);
          ctx.restore();
        }
      },
    };
  }, [
    isMobile,
    showTrapezoid,
    JSON.stringify(filteredData.map((d) => d?.ratio)),
  ]);

  // 右侧阶段文本标签（跟随每个柱，显示 stage 名称）
  const rightLabelPlugin = useMemo(() => {
    return {
      id: 'funnelRightLabels',
      afterDatasetsDraw: (chart: any) => {
        const { ctx, data, scales } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta) return;
        const xScale = scales?.x;
        const labels = data?.labels || [];
        ctx.save();
        ctx.fillStyle = axisTextColor;
        ctx.font = `${isMobile ? 10 : 12}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const ds = data?.datasets?.[0]?.data || [];

        // 计算所有条末端的像素坐标，找最大值作为对齐基准
        const ends: number[] = meta.data.map((el: any, i: number) => {
          const raw = ds?.[i];
          if (!raw || !Array.isArray(raw)) return el.x;
          const end = Number(raw[1] ?? 0);
          return xScale?.getPixelForValue
            ? xScale.getPixelForValue(end)
            : el.x + Math.max(0, el.width / 2);
        });
        const maxEnd = Math.max(...ends);
        const padding = 12;

        meta.data.forEach((el: any, i: number) => {
          const raw = ds?.[i];
          if (!raw || !Array.isArray(raw)) return;
          const y = el.y;
          const label = labels?.[i] ?? '';
          ctx.fillText(label, maxEnd + padding, y);

          // 在柱体中心绘制数值文本（白色）- 使用原始值
          const start = Number(raw[0] ?? 0);
          const end = Number(raw[1] ?? 0);
          const mid = (start + end) / 2;
          const originalValue = originalValues?.[i] ?? 0;
          const cx = xScale?.getPixelForValue
            ? xScale.getPixelForValue(mid)
            : el.x;
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(String(Math.round(originalValue)), cx, y);
          ctx.restore();
        });
        ctx.restore();
      },
    };
  }, [isMobile, axisTextColor, originalValues]);

  const containerClassName = useMemo(() => {
    if (isMobile) return 'w-full';
    if (typeof width === 'number') return '';
    if (typeof width === 'string' && width === '100%') return 'w-full';
    return '';
  }, [isMobile, width]);

  const containerStyle = useMemo(() => {
    if (isMobile) return undefined;
    if (typeof width === 'number') return { width };
    if (typeof width === 'string' && width !== '100%') return { width };
    return undefined;
  }, [isMobile, width]);

  return wrapSSR(
    <ChartContainer
      baseClassName={baseClassName}
      className={`${className || ''} ${containerClassName}`.trim()}
      theme={theme}
      isMobile={isMobile}
      variant={props.variant}
      style={containerStyle}
    >
      <ChartToolBar
        title={title}
        theme={theme}
        onDownload={handleDownload}
        dataTime={dataTime}
        extra={toolbarExtra}
        loading={loading}
        filter={
          renderFilterInToolbar && filterOptions && filterOptions.length > 1 ? (
            <ChartFilter
              filterOptions={filterOptions}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              {...(customOptions && {
                customOptions,
                selectedCustomSelection: selectedFilterLabel,
                onSelectionChange: setSelectedFilterLabel,
              })}
              theme={theme}
              variant="compact"
            />
          ) : undefined
        }
      />

      {!renderFilterInToolbar && filterOptions && filterOptions.length > 1 && (
        <ChartFilter
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          {...(customOptions && {
            customOptions,
            selectedCustomSelection: selectedFilterLabel,
            onSelectionChange: setSelectedFilterLabel,
          })}
          theme={theme}
        />
      )}

      {/* 统计数据组件 */}
      {statistics && (
        <div
          className={classNames(`${baseClassName}-statistic-container`, hashId)}
        >
          {statistics.map((config, index) => (
            <ChartStatistic key={index} {...config} theme={theme} />
          ))}
        </div>
      )}

      <div
        className={classNames(`${baseClassName}-wrapper`, hashId)}
        style={{ height: finalHeight }}
      >
        <Bar
          key={`funnel-${pluginToggleKey}`}
          ref={chartRef}
          data={processedData}
          options={options}
          plugins={[trapezoidPlugin, rightLabelPlugin]}
        />
      </div>
    </ChartContainer>,
  );
};

export default FunnelChart;
