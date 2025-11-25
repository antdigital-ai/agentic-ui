import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { ConfigProvider, Descriptions, Dropdown, Popover, Table } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import React, { lazy, Suspense, useContext, useMemo, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { Loading } from '../../Components/Loading';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { I18nContext } from '../../I18n';
import { loadChartRuntime, type ChartRuntime } from './loadChartRuntime';
import {
  debounce,
  getDataHash,
  isConfigEqual,
  isNotEmpty,
  toNumber,
} from './utils';

/**
 * @fileoverview 图表渲染组件文件
 *
 * 该文件提供了统一的图表渲染组件，支持多种图表类型的渲染和配置。
 * 包括图表类型切换、配置管理、数据处理等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

/**
 * 获取图表类型映射配置
 *
 * 根据国际化上下文返回图表类型的配置映射，包括图表标题和可切换的图表类型。
 * 支持多种图表类型：饼图、环形图、条形图、折线图、柱状图、面积图、雷达图、散点图、漏斗图、表格、定义列表。
 *
 * @param {object} i18n - 国际化上下文对象
 * @returns {Object} 图表类型映射对象，包含每种图表类型的配置信息
 *
 * @example
 * ```typescript
 * const chartMap = getChartMap(i18n);
 * console.log(chartMap.pie.title); // '饼图'
 * console.log(chartMap.pie.changeData); // ['donut']
 * ```
 *
 * @since 1.0.0
 */
const getChartMap = (i18n: any) => ({
  pie: {
    title: i18n?.locale?.pieChart || '饼图',
    changeData: ['donut'],
  },
  donut: {
    title: i18n?.locale?.donutChart || '环形图',
    changeData: ['pie'],
  },
  bar: {
    title: i18n?.locale?.barChart || '条形图',
    changeData: ['column', 'line', 'area'],
  },
  line: {
    title: i18n?.locale?.lineChart || '折线图',
    changeData: ['column', 'bar', 'area'],
  },
  column: {
    title: i18n?.locale?.columnChart || '柱状图',
    changeData: ['bar', 'line', 'area'],
  },
  area: {
    title: i18n?.locale?.areaChart || '面积图',
    changeData: ['column', 'bar', 'line'],
  },
  radar: {
    title: i18n?.locale?.radarChart || '雷达图',
    changeData: [],
  },
  scatter: {
    title: i18n?.locale?.scatterChart || '散点图',
    changeData: [],
  },
  funnel: {
    title: i18n?.locale?.funnelChart || '漏斗图',
    changeData: [],
  },
  table: {
    title: i18n?.locale?.table || '表格',
    changeData: ['column', 'line', 'area', 'pie', 'donut'],
  },
  descriptions: {
    title: i18n?.locale?.descriptions || '定义列表',
    changeData: ['column', 'line', 'area', 'pie', 'donut'],
  },
});

/**
 * 图表运行时渲染器组件实现
 * 负责使用已加载的 runtime 渲染图表
 */
const ChartRuntimeRendererImpl: React.FC<{
  chartType:
    | 'pie'
    | 'donut'
    | 'bar'
    | 'line'
    | 'column'
    | 'area'
    | 'radar'
    | 'scatter'
    | 'funnel';
  runtime: ChartRuntime;
  convertDonutData: any[];
  convertFlatData: any[];
  config: any;
  renderKey: number;
  title?: any;
  dataTime?: string;
  toolBar: JSX.Element[];
  filterBy?: string;
  groupBy?: string;
  colorLegend?: string;
  chartData: Record<string, any>[];
  getFieldValue: (row: any, field?: string) => string | undefined;
  loading?: boolean;
}> = ({
  chartType,
  runtime,
  convertDonutData,
  convertFlatData,
  config,
  title,
  dataTime,
  toolBar,
  filterBy,
  groupBy,
  colorLegend,
  chartData,
  getFieldValue,
  loading = false,
}) => {
  const {
    DonutChart,
    FunnelChart,
    AreaChart,
    BarChart,
    LineChart,
    RadarChart,
    ScatterChart,
  } = runtime;

  if (chartType === 'pie') {
    return (
      <DonutChart
        key={`${config?.index}-pie`}
        data={convertDonutData}
        configs={[{ chartStyle: 'pie', showLegend: true }]}
        height={config?.height || 400}
        title={title}
        showToolbar={true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'donut') {
    return (
      <DonutChart
        key={`${config?.index}-donut`}
        data={convertDonutData}
        configs={[{ chartStyle: 'donut', showLegend: true }]}
        height={config?.height || 400}
        title={title}
        showToolbar={true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'bar') {
    return (
      <BarChart
        key={`${config?.index}-bar`}
        data={convertFlatData}
        height={config?.height || 400}
        title={title || ''}
        indexAxis={'y'}
        stacked={config?.rest?.stacked}
        showLegend={config?.rest?.showLegend ?? true}
        showGrid={config?.rest?.showGrid ?? true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'line') {
    return (
      <LineChart
        key={`${config?.index}-line`}
        data={convertFlatData}
        height={config?.height || 400}
        title={title || ''}
        showLegend={config?.rest?.showLegend ?? true}
        showGrid={config?.rest?.showGrid ?? true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'column') {
    return (
      <BarChart
        key={`${config?.index}-column`}
        data={convertFlatData}
        height={config?.height || 400}
        title={title || ''}
        indexAxis={'x'}
        stacked={config?.rest?.stacked}
        showLegend={config?.rest?.showLegend ?? true}
        showGrid={config?.rest?.showGrid ?? true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'area') {
    return (
      <AreaChart
        key={`${config?.index}-area`}
        data={convertFlatData}
        height={config?.height || 400}
        title={title || ''}
        showLegend={config?.rest?.showLegend ?? true}
        showGrid={config?.rest?.showGrid ?? true}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'radar') {
    const radarData = (chartData || []).map((row: any, i: number) => {
      const filterLabel = getFieldValue(row, filterBy);
      const category = getFieldValue(row, groupBy);
      const type = getFieldValue(row, colorLegend);
      // 使用 getFieldValue 获取 x 和 y 值，支持字段名规范化
      const xValue = getFieldValue(row, config?.x);
      const yValue = getFieldValue(row, config?.y);
      return {
        label: xValue ? String(xValue) : String(i + 1),
        score: yValue ? Number(yValue) : undefined,
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });

    return (
      <RadarChart
        key={`${config?.index}-radar`}
        data={radarData}
        height={config?.height || 400}
        title={title || ''}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'scatter') {
    const scatterData = (chartData || []).map((row: any) => {
      const filterLabel = getFieldValue(row, filterBy);
      const category = getFieldValue(row, groupBy);
      const type = getFieldValue(row, colorLegend);
      // 使用 getFieldValue 获取 x 和 y 值，支持字段名规范化
      const xValue = getFieldValue(row, config?.x);
      const yValue = getFieldValue(row, config?.y);
      return {
        x: xValue ? Number(xValue) : 0,
        y: yValue ? Number(yValue) : 0,
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });

    return (
      <ScatterChart
        key={`${config?.index}-scatter`}
        data={scatterData}
        height={config?.height || 400}
        title={title || ''}
        dataTime={dataTime}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  if (chartType === 'funnel') {
    const funnelData = (chartData || []).map((row: any, i: number) => {
      const filterLabel = getFieldValue(row, filterBy);
      const category = getFieldValue(row, groupBy);
      const type = getFieldValue(row, colorLegend);
      // 使用 getFieldValue 获取 x 和 y 值，支持字段名规范化
      const xValue = getFieldValue(row, config?.x);
      const yValue = getFieldValue(row, config?.y);
      return {
        x: xValue ? String(xValue) : String(i + 1),
        y: yValue ? toNumber(yValue, 0) : 0,
        ...(row?.ratio !== undefined ? { ratio: row.ratio } : {}),
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });

    return (
      <FunnelChart
        key={`${config?.index}-funnel`}
        data={funnelData}
        height={config?.height || 400}
        title={title || ''}
        dataTime={dataTime}
        typeNames={{ rate: '转化率', name: colorLegend || '转化' }}
        toolbarExtra={toolBar}
        loading={loading}
      />
    );
  }

  return null;
};

/**
 * 图表运行时渲染器组件
 * 使用 React.lazy 延迟加载，仅在需要时加载图表运行时
 */
const ChartRuntimeRenderer = lazy(async () => {
  const runtime = await loadChartRuntime();

  return {
    default: (props: {
      chartType:
        | 'pie'
        | 'donut'
        | 'bar'
        | 'line'
        | 'column'
        | 'area'
        | 'radar'
        | 'scatter'
        | 'funnel';
      convertDonutData: any[];
      convertFlatData: any[];
      config: any;
      renderKey: number;
      title?: any;
      dataTime?: string;
      toolBar: JSX.Element[];
      filterBy?: string;
      groupBy?: string;
      colorLegend?: string;
      chartData: Record<string, any>[];
      getFieldValue: (row: any, field?: string) => string | undefined;
      loading?: boolean;
    }) => <ChartRuntimeRendererImpl {...props} runtime={runtime} />,
  };
});

/**
 * 加载中的占位组件
 */
const ChartRuntimeFallback = ({ height = 240 }: { height?: number }) => (
  <div
    style={{
      minHeight: height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      color: '#6B7280',
    }}
    role="status"
    aria-live="polite"
  >
    <Loading />
  </div>
);

/**
 * ChartRender 组件 - 图表渲染组件
 *
 * 该组件用于渲染各种类型的图表，支持饼图、柱状图、折线图、面积图、表格等。
 * 提供图表类型切换、全屏显示、下载、配置等功能。
 * 使用 React.lazy 和 Suspense 实现代码分割和延迟加载，优化性能。
 *
 * @component
 * @description 图表渲染组件，支持多种图表类型的渲染和交互
 * @param {Object} props - 组件属性
 * @param {'pie'|'bar'|'line'|'column'|'area'|'descriptions'|'table'} props.chartType - 图表类型
 * @param {Record<string, any>[]} props.chartData - 图表数据
 * @param {Object} props.config - 图表配置
 * @param {any} props.config.height - 图表高度
 * @param {any} props.config.x - X轴字段
 * @param {any} props.config.y - Y轴字段
 * @param {any} props.config.rest - 其他配置
 * @param {any} [props.config.index] - 图表索引
 * @param {any} [props.config.chartData] - 图表数据
 * @param {any} [props.config.columns] - 列配置
 * @param {any} [props.node] - 节点数据
 * @param {any} [props.title] - 图表标题
 * @param {boolean} [props.isChartList] - 是否为图表列表
 * @param {number} [props.columnLength] - 列长度
 * @param {(value: number) => void} [props.onColumnLengthChange] - 列长度变化回调
 * @param {string} [props.dataTime] - 数据时间
 * @param {string} [props.groupBy] - 业务分组维度
 * @param {string} [props.filterBy] - 主筛选维度
 * @param {string} [props.colorLegend] - 数据系列维度
 *
 * @example
 * ```tsx
 * <ChartRender
 *   chartType="pie"
 *   chartData={[{ name: "A", value: 10 }, { name: "B", value: 20 }]}
 *   config={{
 *     height: 300,
 *     x: "name",
 *     y: "value"
 *   }}
 *   title="销售数据"
 *   dataTime="2025-06-30 00:00:00"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的图表组件
 *
 * @remarks
 * - 支持多种图表类型（饼图、柱状图、折线图、面积图、表格等）
 * - 提供图表类型切换功能
 * - 支持全屏显示
 * - 提供图表下载功能
 * - 支持图表配置和自定义
 * - 提供响应式布局
 * - 集成国际化支持
 * - 提供图表属性工具栏
 * - 使用 React.lazy 和 Suspense 实现代码分割
 */
export const ChartRender: React.FC<{
  chartType:
    | 'pie'
    | 'donut'
    | 'bar'
    | 'line'
    | 'column'
    | 'area'
    | 'radar'
    | 'scatter'
    | 'funnel'
    | 'descriptions'
    | 'table';
  chartData: Record<string, any>[];
  config: {
    height: any;
    x: any;
    y: any;
    rest: any;
    index?: any;
    chartData?: any;
    columns?: any;
  };
  node?: any;
  title?: any;
  isChartList?: boolean;
  columnLength?: number;
  onColumnLengthChange?: (value: number) => void;
  dataTime?: string;
  groupBy?: string;
  filterBy?: string;
  colorLegend?: string;
  loading?: boolean;
}> = (props) => {
  const [chartType, setChartType] = useState<
    | 'pie'
    | 'donut'
    | 'bar'
    | 'line'
    | 'column'
    | 'area'
    | 'radar'
    | 'scatter'
    | 'descriptions'
    | 'table'
    | 'funnel'
  >(() => props.chartType);
  const {
    chartData,
    isChartList,
    onColumnLengthChange,
    columnLength,
    title,
    dataTime,
    groupBy,
    filterBy,
    colorLegend,
    loading = false,
  } = props;
  const i18n = useContext(I18nContext);
  const [config, setConfig] = useState(() => props.config);
  const [renderKey, setRenderKey] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionOnce(containerRef);

  // 用于缓存上一次的数据和配置，避免不必要的重新计算
  const prevDataRef = React.useRef<{
    dataHash: string;
    config: any;
    groupBy?: string;
    colorLegend?: string;
    filterBy?: string;
  }>({
    dataHash: '',
    config: null,
  });

  // 计算数据哈希值，用于依赖项比较
  const dataHash = React.useMemo(
    () => getDataHash(chartData || []),
    [chartData],
  );

  // 防抖更新 renderKey，避免流式数据频繁更新导致的性能问题
  // 增加延迟时间以减少抖动
  const debouncedUpdateRenderKeyRef = React.useRef(
    debounce(() => {
      setRenderKey((k) => k + 1);
    }, 800), // 从 300ms 增加到 800ms
  );

  const renderDescriptionsFallback = React.useMemo(() => {
    const columnCount = config?.columns?.length || 0;
    return chartData.length < 2 && columnCount > 8;
  }, [chartData, config?.columns]);

  const shouldLoadRuntime =
    chartType !== 'table' &&
    chartType !== 'descriptions' &&
    !renderDescriptionsFallback;

  // 获取国际化的图表类型映射
  const ChartMap = useMemo(() => getChartMap(i18n), [i18n]);

  const getAxisTitles = () => {
    const xCol = config?.columns?.find?.(
      (c: any) => c?.dataIndex === config?.x,
    );
    const yCol = config?.columns?.find?.(
      (c: any) => c?.dataIndex === config?.y,
    );
    return {
      xTitle: xCol?.title || String(config?.x || ''),
      yTitle: yCol?.title || String(config?.y || ''),
    };
  };

  const buildXIndexer = () => {
    const map = new Map<any, number>();
    let idx = 1;
    (chartData || []).forEach((row: any) => {
      const key = row?.[config?.x];
      if (isNotEmpty(key) && !map.has(key)) {
        map.set(key, idx++);
      }
    });
    return map;
  };

  /**
   * 规范化字段名，统一处理转义字符
   * 将 `index\_value` 转换为 `index_value`，确保字段名一致
   */
  const normalizeFieldName = (fieldName: string): string => {
    if (!fieldName) return fieldName;
    // 移除转义字符：将 `\_` 转换为 `_`，`\\` 转换为 `\`
    return fieldName
      .replace(/\\_/g, '_')
      .replace(/\\\\/g, '\\')
      .replace(/\\(?=")/g, '') // 移除转义的双引号
      .trim();
  };

  /**
   * 安全地获取字段值，如果字段名不匹配，也尝试规范化后的字段名
   */
  const getFieldValueSafely = (row: any, field?: string): any => {
    if (!field) return undefined;

    // 先尝试直接访问
    if (row[field] !== undefined) {
      return row[field];
    }

    // 如果直接访问失败，尝试规范化后的字段名
    const normalizedField = normalizeFieldName(field);
    if (normalizedField !== field && row[normalizedField] !== undefined) {
      return row[normalizedField];
    }

    // 也尝试反向：如果字段名已经是规范化的，尝试带转义字符的版本
    const escapedField = field.replace(/_/g, '\\_');
    if (escapedField !== field && row[escapedField] !== undefined) {
      return row[escapedField];
    }

    return undefined;
  };

  const getFieldValue = (row: any, field?: string): string | undefined => {
    const value = getFieldValueSafely(row, field);
    if (field && isNotEmpty(value)) {
      return String(value);
    }
    return undefined;
  };

  const convertFlatData = useMemo(() => {
    const { xTitle, yTitle } = getAxisTitles();
    const xIndexer = buildXIndexer();

    return (chartData || []).map((row: any, i: number) => {
      const rawX = getFieldValueSafely(row, config?.x);
      const rawY = getFieldValueSafely(row, config?.y);
      const category = getFieldValue(row, groupBy);
      const type = getFieldValue(row, colorLegend);
      const filterLabel = getFieldValue(row, filterBy);
      const x =
        typeof rawX === 'number'
          ? rawX
          : isNotEmpty(rawX)
            ? String(rawX)
            : String(xIndexer.get(rawX) ?? i + 1);

      const y =
        typeof rawY === 'number' ? rawY : isNotEmpty(rawY) ? String(rawY) : '';

      return {
        x,
        y,
        xtitle: xTitle,
        ytitle: yTitle,
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });
  }, [
    // 使用更高效的依赖项比较
    dataHash,
    config?.x,
    config?.y,
    config?.height,
    config?.index,
    // 对于 rest 对象，使用浅比较
    config?.rest?.stacked,
    config?.rest?.showLegend,
    config?.rest?.showGrid,
    title,
    groupBy,
    colorLegend,
    filterBy,
  ]);

  const convertDonutData = useMemo(() => {
    return (chartData || []).map((row: any) => {
      const category = getFieldValue(row, groupBy);
      const label = String(getFieldValueSafely(row, config?.x) ?? '');
      const value = toNumber(getFieldValueSafely(row, config?.y), 0);
      const filterLabel = getFieldValue(row, filterBy);

      return {
        label,
        value,
        ...(category ? { category } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });
  }, [
    // 使用更高效的依赖项比较
    dataHash,
    config?.x,
    config?.y,
    config?.height,
    config?.index,
    title,
    groupBy,
    filterBy,
  ]);

  React.useEffect(() => {
    setChartType(props.chartType);
  }, [props.chartType]);

  // 监听数据变化，使用防抖更新渲染键
  React.useEffect(() => {
    const configChanged = !isConfigEqual(prevDataRef.current.config, config);
    const groupByChanged = prevDataRef.current.groupBy !== groupBy;
    const colorLegendChanged = prevDataRef.current.colorLegend !== colorLegend;
    const filterByChanged = prevDataRef.current.filterBy !== filterBy;

    const hasChanged =
      prevDataRef.current.dataHash !== dataHash ||
      configChanged ||
      groupByChanged ||
      colorLegendChanged ||
      filterByChanged;

    if (hasChanged) {
      // 更新缓存
      prevDataRef.current = {
        dataHash,
        config,
        groupBy,
        colorLegend,
        filterBy,
      };

      // 对于流式数据，使用防抖更新，避免频繁渲染
      if (prevDataRef.current.dataHash !== dataHash) {
        debouncedUpdateRenderKeyRef.current();
      } else {
        // 配置变化时立即更新
        setRenderKey((k) => k + 1);
      }
    }
  }, [dataHash, config, groupBy, colorLegend, filterBy]);

  /**
   * 图表配置
   */
  const toolBar = useMemo(() => {
    return [
      <Dropdown
        key="dropdown"
        menu={{
          items:
            ChartMap[chartType as 'pie']?.changeData?.map((key: string) => {
              return {
                key,
                label:
                  i18n?.locale?.[(key + 'eChart') as 'pieChart'] ||
                  ChartMap[key as 'pie']?.title,
                onClick: () => {
                  setChartType(key as 'pie');
                },
              };
            }) || [],
        }}
        getPopupContainer={() => document.body}
      >
        <span
          style={{
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid #f0f0f0',
            padding: '4px 12px',
            borderRadius: '1em',
          }}
        >
          {ChartMap[chartType]?.title}
          <DownOutlined
            style={{
              fontSize: 8,
            }}
          />
        </span>
      </Dropdown>,
      isChartList ? (
        <Dropdown
          key="dropdown-column"
          menu={{
            items: new Array(4).fill(0).map((_, i) => {
              return {
                key: i + 1,
                label: i + 1,
                onClick: () => {
                  onColumnLengthChange?.(i + 1);
                },
              };
            }),
          }}
          getPopupContainer={() => document.body}
        >
          <span
            style={{
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: '1px solid #f0f0f0',
              padding: '4px 12px',
              borderRadius: '1em',
            }}
          >
            {columnLength} {i18n?.locale?.columns || '列'}
            <DownOutlined
              style={{
                fontSize: 8,
              }}
            />
          </span>
        </Dropdown>
      ) : null,
      <Popover
        arrow={false}
        styles={{
          body: {
            padding: 8,
          },
        }}
        key="config"
        title={i18n?.locale?.configChart || '配置图表'}
        trigger={'click'}
        getPopupContainer={() => document.body}
        content={
          <ConfigProvider componentSize="small">
            <ProForm
              submitter={{
                searchConfig: {
                  submitText: i18n?.locale?.updateChart || '更新',
                },
              }}
              style={{
                width: 300,
              }}
              initialValues={config}
              onFinish={(values) => {
                setConfig({
                  ...props.config,
                  ...values,
                });
                setRenderKey((k) => k + 1);
              }}
            >
              <div
                style={{
                  maxHeight: '70vh',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <ProFormSelect
                    label="X"
                    name="x"
                    fieldProps={{
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                    }}
                    options={config.columns
                      ?.filter((item: any) => item.title)
                      ?.map((item: any) => {
                        return {
                          label: item.title,
                          value: item.dataIndex,
                        };
                      })}
                  />
                  <ProFormSelect
                    name="y"
                    label="Y"
                    fieldProps={{
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                    }}
                    options={config.columns
                      ?.filter((item: any) => item.title)
                      ?.map((item: any) => {
                        return {
                          label: item.title,
                          value: item.dataIndex,
                        };
                      })}
                  />
                </div>
              </div>
            </ProForm>
          </ConfigProvider>
        }
      >
        <ActionIconBox title={i18n?.locale?.configChart || '配置图表'}>
          <SettingOutlined style={{ color: 'rgba(0, 25, 61, 0.3255)' }} />
        </ActionIconBox>
      </Popover>,
    ].filter((item) => !!item) as JSX.Element[];
  }, [
    chartType,
    ChartMap,
    i18n?.locale,
    isChartList,
    columnLength,
    onColumnLengthChange,
    config,
    props.config,
  ]);

  const chartDom = useMemo(() => {
    if (typeof window === 'undefined') return null;
    if (process.env.NODE_ENV === 'test') return null;
    //@ts-ignore
    if (window?.notRenderChart) return null;

    if (chartType === 'table') {
      return (
        <div
          key={config?.index}
          contentEditable={false}
          style={{
            margin: 12,
            overflow: 'auto',
            border: '1px solid #eee',
            borderRadius: '0.5em',
            flex: 1,
            maxWidth: 'calc(100% - 32px)',
            maxHeight: 400,
            userSelect: 'none',
          }}
        >
          <Table
            size="small"
            dataSource={chartData}
            columns={config?.columns}
            pagination={false}
            rowKey={(record) => record.key}
          />
        </div>
      );
    }

    if (chartType === 'descriptions' || renderDescriptionsFallback) {
      return (
        <div
          key={config?.index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {chartData.map((row: Record<string, any>, rowIndex: number) => (
            <Descriptions
              bordered
              key={`${config?.index}-${rowIndex}`}
              column={{
                xxl: 2,
                xl: 2,
                lg: 2,
                md: 2,
                sm: 1,
                xs: 1,
              }}
              items={
                config?.columns
                  ?.map((column: { title?: string; dataIndex: string }) => {
                    if (!column.title || !column.dataIndex) return null;
                    return {
                      label: column.title || '',
                      children: row[column.dataIndex],
                    };
                  })
                  .filter((item: any) => !!item) as DescriptionsItemType[]
              }
            />
          ))}
        </div>
      );
    }

    if (shouldLoadRuntime && isIntersecting) {
      return (
        <Suspense
          fallback={<ChartRuntimeFallback height={config?.height || 240} />}
        >
          <ChartRuntimeRenderer
            loading={loading}
            chartType={chartType}
            convertDonutData={convertDonutData}
            convertFlatData={convertFlatData}
            config={config}
            renderKey={renderKey}
            title={title}
            dataTime={dataTime}
            toolBar={toolBar}
            filterBy={filterBy}
            groupBy={groupBy}
            colorLegend={colorLegend}
            chartData={chartData}
            getFieldValue={getFieldValue}
          />
        </Suspense>
      );
    }

    if (shouldLoadRuntime && !isIntersecting) {
      return <ChartRuntimeFallback height={config?.height || 240} />;
    }

    return null;
  }, [
    chartType,
    // 使用更高效的依赖项
    dataHash,
    config?.x,
    config?.y,
    config?.height,
    config?.index,
    toolBar,
    convertDonutData,
    convertFlatData,
    title,
    dataTime,
    filterBy,
    groupBy,
    colorLegend,
    isIntersecting,
    shouldLoadRuntime,
    renderDescriptionsFallback,
    chartData,
    config?.columns,
    config?.rest?.stacked,
    config?.rest?.showLegend,
    config?.rest?.showGrid,
    loading,
  ]);

  return (
    <div ref={containerRef} style={{ width: '100%' }} contentEditable={false}>
      {chartDom}
    </div>
  );
};
