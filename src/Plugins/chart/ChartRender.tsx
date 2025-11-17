import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { ConfigProvider, Descriptions, Dropdown, Popover, Table } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import React, { useContext, useMemo, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { Loading } from '../../Components/Loading';
import { useIntersectionOnce } from '../../Hooks/useIntersectionOnce';
import { I18nContext } from '../../I18n';
import { loadChartRuntime, type ChartRuntime } from './loadChartRuntime';
import { isNotEmpty, toNumber } from './utils';

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
 * ChartRender 组件 - 图表渲染组件
 *
 * 该组件用于渲染各种类型的图表，支持饼图、柱状图、折线图、面积图、表格等。
 * 提供图表类型切换、全屏显示、下载、配置等功能。
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
  } = props;
  const i18n = useContext(I18nContext);
  const [config, setConfig] = useState(() => props.config);
  const [renderKey, setRenderKey] = useState(0);
  const [runtime, setRuntime] = useState<ChartRuntime | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isRuntimeLoading, setRuntimeLoading] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionOnce(containerRef);

  const renderDescriptionsFallback = React.useMemo(() => {
    const columnCount = config?.columns?.length || 0;
    return chartData.length < 2 && columnCount > 8;
  }, [chartData, config?.columns]);

  const shouldLoadRuntime =
    chartType !== 'table' &&
    chartType !== 'descriptions' &&
    !renderDescriptionsFallback;

  React.useEffect(() => {
    if (runtime) return;
    if (isRuntimeLoading) return;
    if (runtimeError) return;

    let cancelled = false;
    setRuntimeLoading(true);
    loadChartRuntime()
      .then((module) => {
        if (cancelled) return;
        setRuntime(module);
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setRuntimeError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setRuntimeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    shouldLoadRuntime,
    isIntersecting,
    runtime,
    isRuntimeLoading,
    runtimeError,
  ]);

  const handleRetryRuntime = React.useCallback(() => {
    setRuntime(null);
    setRuntimeError(null);
  }, []);

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

  const getFieldValue = (row: any, field?: string): string | undefined => {
    if (field && isNotEmpty(row[field])) {
      return String(row[field]);
    }
    return undefined;
  };

  const convertFlatData = useMemo(() => {
    const { xTitle, yTitle } = getAxisTitles();
    const xIndexer = buildXIndexer();

    return (chartData || []).map((row: any, i: number) => {
      const rawX = row?.[config?.x];
      const rawY = row?.[config?.y];
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
    JSON.stringify(chartData),
    JSON.stringify(config),
    title,
    groupBy,
    colorLegend,
    filterBy,
  ]);

  const convertDonutData = useMemo(() => {
    return (chartData || []).map((row: any) => {
      const category = getFieldValue(row, groupBy);
      const label = String(row?.[config?.x] ?? '');
      const value = toNumber(row?.[config?.y], 0);
      const filterLabel = getFieldValue(row, filterBy);

      return {
        label,
        value,
        ...(category ? { category } : {}),
        ...(filterLabel ? { filterLabel } : {}),
      };
    });
  }, [
    JSON.stringify(chartData),
    JSON.stringify(config),
    title,
    groupBy,
    filterBy,
  ]);

  React.useEffect(() => {
    setChartType(props.chartType);
  }, [props.chartType]);

  /**
   * 图表配置
   */
  const getChartPopover = () =>
    [
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
          key="dropdown"
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
        <ActionIconBox
          title={i18n?.locale?.configChart || '配置图表'}
          onClick={() => setRenderKey((k) => k + 1)}
        >
          <SettingOutlined style={{ color: 'rgba(0, 25, 61, 0.3255)' }} />
        </ActionIconBox>
      </Popover>,
    ].filter((item) => !!item) as JSX.Element[];

  const toolBar = getChartPopover();

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

    if (!runtime && shouldLoadRuntime) {
      const height = config?.height || 240;

      if (runtimeError) {
        return (
          <div
            style={{
              minHeight: height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: 8,
              color: 'rgba(239, 68, 68, 0.8)',
            }}
            role="alert"
          >
            <span>{runtimeError}</span>
            <button
              type="button"
              onClick={handleRetryRuntime}
              style={{
                padding: '4px 12px',
                borderRadius: '0.5em',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'transparent',
                color: 'rgba(239, 68, 68, 0.8)',
                cursor: 'pointer',
              }}
            >
              重试加载
            </button>
          </div>
        );
      }

      return (
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
          {isRuntimeLoading || !isIntersecting ? <Loading /> : null}
        </div>
      );
    }

    if (!runtime) {
      return null;
    }

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
          key={`${config?.index}-pie-${renderKey}`}
          data={convertDonutData}
          configs={[{ chartStyle: 'pie', showLegend: true }]}
          height={config?.height || 400}
          title={title}
          showToolbar={true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'donut') {
      return (
        <DonutChart
          key={`${config?.index}-donut-${renderKey}`}
          data={convertDonutData}
          configs={[{ chartStyle: 'donut', showLegend: true }]}
          height={config?.height || 400}
          title={title}
          showToolbar={true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart
          key={`${config?.index}-bar-${renderKey}`}
          data={convertFlatData}
          height={config?.height || 400}
          title={title || ''}
          indexAxis={'y'}
          stacked={config?.rest?.stacked}
          showLegend={config?.rest?.showLegend ?? true}
          showGrid={config?.rest?.showGrid ?? true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart
          key={`${config?.index}-line-${renderKey}`}
          data={convertFlatData}
          height={config?.height || 400}
          title={title || ''}
          showLegend={config?.rest?.showLegend ?? true}
          showGrid={config?.rest?.showGrid ?? true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'column') {
      return (
        <BarChart
          key={`${config?.index}-column-${renderKey}`}
          data={convertFlatData}
          height={config?.height || 400}
          title={title || ''}
          indexAxis={'x'}
          stacked={config?.rest?.stacked}
          showLegend={config?.rest?.showLegend ?? true}
          showGrid={config?.rest?.showGrid ?? true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart
          key={`${config?.index}-area-${renderKey}`}
          data={convertFlatData}
          height={config?.height || 400}
          title={title || ''}
          showLegend={config?.rest?.showLegend ?? true}
          showGrid={config?.rest?.showGrid ?? true}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'radar') {
      const radarData = (chartData || []).map((row: any, i: number) => {
        const filterLabel = getFieldValue(row, filterBy);
        const category = getFieldValue(row, groupBy);
        const type = getFieldValue(row, colorLegend);
        return {
          label: String(row?.[config?.x] ?? i + 1),
          score: row?.[config?.y],
          ...(category ? { category } : {}),
          ...(type ? { type } : {}),
          ...(filterLabel ? { filterLabel } : {}),
        };
      });

      return (
        <RadarChart
          key={`${config?.index}-radar-${renderKey}`}
          data={radarData}
          height={config?.height || 400}
          title={title || ''}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'scatter') {
      const scatterData = (chartData || []).map((row: any) => {
        const filterLabel = getFieldValue(row, filterBy);
        const category = getFieldValue(row, groupBy);
        const type = getFieldValue(row, colorLegend);
        return {
          x: row?.[config?.x],
          y: row?.[config?.y],
          ...(category ? { category } : {}),
          ...(type ? { type } : {}),
          ...(filterLabel ? { filterLabel } : {}),
        };
      });

      return (
        <ScatterChart
          key={`${config?.index}-scatter-${renderKey}`}
          data={scatterData}
          height={config?.height || 400}
          title={title || ''}
          dataTime={dataTime}
          toolbarExtra={toolBar}
        />
      );
    }

    if (chartType === 'funnel') {
      const funnelData = (chartData || []).map((row: any, i: number) => {
        const filterLabel = getFieldValue(row, filterBy);
        const category = getFieldValue(row, groupBy);
        const type = getFieldValue(row, colorLegend);
        return {
          x: String(row?.[config?.x] ?? i + 1),
          y: toNumber(row?.[config?.y], 0),
          ...(row?.ratio !== undefined ? { ratio: row.ratio } : {}),
          ...(category ? { category } : {}),
          ...(type ? { type } : {}),
          ...(filterLabel ? { filterLabel } : {}),
        };
      });

      return (
        <FunnelChart
          key={`${config?.index}-funnel-${renderKey}`}
          data={funnelData}
          height={config?.height || 400}
          title={title || ''}
          dataTime={dataTime}
          typeNames={{ rate: '转化率', name: colorLegend || '转化' }}
          toolbarExtra={toolBar}
        />
      );
    }

    return null;
  }, [
    chartType,
    JSON.stringify(chartData),
    JSON.stringify(config),
    renderKey,
    toolBar,
    convertDonutData,
    convertFlatData,
    title,
    dataTime,
    filterBy,
    groupBy,
    colorLegend,
    runtime,
    runtimeError,
    isRuntimeLoading,
    isIntersecting,
    shouldLoadRuntime,
    renderDescriptionsFallback,
    handleRetryRuntime,
  ]);

  return (
    <div ref={containerRef} style={{ width: '100%' }} contentEditable={false}>
      {chartDom}
    </div>
  );
};
