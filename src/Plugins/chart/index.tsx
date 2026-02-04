import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import { RenderElementProps, useSlate } from 'slate-react';
import { ErrorBoundary } from '../../MarkdownEditor/editor/elements/ErrorBoundary';
import { TableNode } from '../../MarkdownEditor/editor/elements/Table';
import { useEditorStore } from '../../MarkdownEditor/editor/store';
import { DragHandle } from '../../MarkdownEditor/editor/tools/DragHandle';
import { useMEditor } from '../../MarkdownEditor/hooks/editor';
import { ChartRender } from './ChartRender';
import { getDataHash } from './utils';

/**
 * @fileoverview 图表插件主入口文件
 *
 * 该文件提供了完整的图表功能，包括：
 * - 多种图表类型的组件（饼图、柱状图、折线图、面积图等）
 * - 图表渲染和配置功能
 * - 数据处理和格式化工具
 * - 图表属性工具栏
 * - 图表标记和容器组件
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

// 图表属性工具栏
export { ChartAttrToolBar } from './ChartAttrToolBar';

// 图表标记组件
export * from './ChartMark';

// 图表渲染组件
export { ChartRender } from './ChartRender';

// 图表组件导出
export { default as AreaChart } from './AreaChart';
export { default as BarChart } from './BarChart';
export { default as ChartStatistic } from './ChartStatistic';
export { default as DonutChart } from './DonutChart';
export { default as FunnelChart } from './FunnelChart';
export { default as LineChart } from './LineChart';
export { default as RadarChart } from './RadarChart';
export { default as ScatterChart } from './ScatterChart';

// 图表类型导出
export type {
  AreaChartConfigItem,
  AreaChartDataItem,
  AreaChartProps,
} from './AreaChart';
export type {
  BarChartConfigItem,
  BarChartDataItem,
  BarChartProps,
} from './BarChart';
export type { ChartStatisticProps } from './ChartStatistic';
export type {
  DonutChartConfig,
  DonutChartData,
  DonutChartProps,
} from './DonutChart';
export type { FunnelChartDataItem, FunnelChartProps } from './FunnelChart';
export type {
  LineChartConfigItem,
  LineChartDataItem,
  LineChartProps,
} from './LineChart';
export type { RadarChartDataItem } from './RadarChart';
export type { ScatterChartDataItem, ScatterChartProps } from './ScatterChart';

// 工具与常量导出
export { defaultColorList } from './const';
export { debounce as chartDebounce, stringFormatNumber } from './utils';

// 类型导出
export type {
  ChartClassNames,
  ChartStyles,
  ClassNameType,
} from './types/classNames';

// 复用组件与类型导出
export { ChartFilter, ChartToolBar, downloadChart } from './components';
export type {
  ChartFilterProps,
  ChartToolBarProps,
  FilterOption,
  RegionOption,
} from './components';

/**
 * 转化数字，将字符串转化为数字，即使非标准数字也可以转化
 * @param {string} val - 要转换的字符串
 * @param {any} locale - 本地化配置
 * @returns {number|NaN} 转换后的数字或NaN
 */
function reverseFormatNumber(val: string, locale: any) {
  let group = new Intl.NumberFormat(locale).format(1111).replace(/1/g, '');
  let decimal = new Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');
  let reversedVal = val.replace(new RegExp('\\' + group, 'g'), '');
  reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
  return Number.isNaN(reversedVal) ? NaN : Number(reversedVal);
}

/**
 * 验证并格式化日期字符串
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function isValidDate(dateString: string) {
  const defaultDateFormats = [
    'YYYY-MM-DD',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY/MM/DD',
    'YYYY/MM/DD HH:mm:ss',
    'DD/MM/YYYY',
    'DD/MM/YYYY HH:mm:ss',
    'MMMM D, YYYY',
    'MMMM D, YYYY h:mm A',
    'MMM D, YYYY',
    'MMM D, YYYY h:mm A',
    'ddd, MMM D, YYYY h:mm A',
  ];
  for (let i = 0; i < defaultDateFormats.length; i++) {
    if (dayjs(dateString, defaultDateFormats[i]).isValid()) {
      return dayjs(dateString).format(defaultDateFormats[i]);
    }
  }
  if (dayjs(dateString).isValid()) {
    return dayjs(dateString).format('YYYY-MM-DD');
  }
  return dateString;
}

/**
 * 转化数字，转化不成功继续用string
 * @param {string} value - 要转换的值
 * @returns {number|string} 转换后的数字或原字符串
 */
const numberString = (value: string) => {
  if (!value) return value;
  try {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const formattedValue = reverseFormatNumber(value, 'en-US');
      if (!isNaN(formattedValue)) return formattedValue;
      return isValidDate(value);
    }
    return value;
  } catch (error) {
    return value;
  }
};

/**
 * 按类别分组数据
 * @param {any[]} data - 数据数组
 * @param {any} key - 分组键
 * @returns {Object} 分组后的数据对象
 */
const groupByCategory = (data: any[], key: any) => {
  return data.reduce((group, product) => {
    const category = product[key];
    group[category] = group[category] ?? [];
    group[category].push(product);
    return group;
  }, {});
};

/**
 * ChartElement 组件 - 图表元素组件
 *
 * 该组件用于在Markdown编辑器中渲染图表，支持多种图表类型和数据处理。
 * 提供图表配置、数据转换、错误处理等功能。
 *
 * @component
 * @description 图表元素组件，在编辑器中渲染各种类型的图表
 * @param {RenderElementProps} props - 组件属性
 * @param {Object} props.element - 图表元素数据
 * @param {Object} props.attributes - 元素属性
 * @param {React.ReactNode} props.children - 子元素
 *
 * @example
 * ```tsx
 * <ChartElement
 *   element={chartElement}
 *   attributes={attributes}
 *   children={children}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的图表元素组件
 *
 * @remarks
 * - 支持多种图表类型（饼图、柱状图、折线图、面积图等）
 * - 提供数据格式转换功能
 * - 支持日期和数字格式化
 * - 使用ErrorBoundary处理渲染错误
 * - 提供拖拽手柄功能
 * - 支持图表配置和自定义
 * - 集成编辑器状态管理
 * - 提供响应式布局
 */
export const ChartElement = (props: RenderElementProps) => {
  const { store, readonly, markdownContainerRef, rootContainer } =
    useEditorStore();
  const editor = useSlate();
  const { element: node, attributes, children } = props;

  // 使用更高效的依赖项比较，避免 JSON.stringify 的性能开销
  const dataSourceHash = useMemo(
    () => getDataHash(node.otherProps?.dataSource || []),
    [node.otherProps?.dataSource],
  );

  let chartData = useMemo(() => {
    const dataSource = node.otherProps?.dataSource || [];
    if (dataSource.length === 0) {
      return [];
    }

    // 获取第一行的 keys 作为参考
    const firstRowKeys = Object.keys(dataSource[0]).sort();

    // 处理数据并过滤掉最后一行（如果它的 keys 和第一行不同）
    const processed = dataSource.map((item: any) => {
      return {
        ...item,
        column_list: Object.keys(item),
      };
    });

    // 检查最后一行是否完整
    if (processed.length > 1) {
      const lastRow = processed[processed.length - 1];
      const lastRowKeys = Object.keys(lastRow)
        .filter((key) => key !== 'column_list')
        .sort();

      // 如果最后一行的 keys 和第一行不同，丢弃最后一行
      if (
        lastRowKeys.length !== firstRowKeys.length ||
        !lastRowKeys.every((key, index) => key === firstRowKeys[index])
      ) {
        return processed.slice(0, -1);
      }
    }

    return processed;
  }, [dataSourceHash, node.otherProps?.dataSource]);

  const columns = (node as TableNode).otherProps?.columns || [];

  // 检查图表是否未闭合
  const isUnclosed = node?.otherProps?.finished === false;

  // 获取编辑器更新函数
  const [, update] = useMEditor(node);

  // 判断是否是最后一个节点
  const isLastNode = useMemo(() => {
    try {
      return store.isLatestNode(node);
    } catch {
      return false;
    }
  }, [store, node]);

  // 如果不是最后一个节点，且未闭合，立即设置为完成
  useEffect(() => {
    if (isUnclosed && !readonly && !isLastNode) {
      // 检查 finished 是否仍然是 false（可能已经被其他逻辑更新）
      if (node?.otherProps?.finished === false) {
        update(
          {
            otherProps: {
              ...node?.otherProps,
              finished: true,
            },
          },
          node,
        );
      }
    }
  }, [isUnclosed, readonly, isLastNode, node, update]);

  // 5 秒超时机制：如果是最后一个节点且未闭合，5 秒后自动设置为完成
  useEffect(() => {
    if (isUnclosed && !readonly && isLastNode) {
      const timer = setTimeout(() => {
        // 检查 finished 是否仍然是 false（可能已经被其他逻辑更新）
        if (node?.otherProps?.finished === false) {
          update(
            {
              otherProps: {
                ...node?.otherProps,
                finished: true,
              },
            },
            node,
          );
        }
      }, 5000); // 5 秒超时

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isUnclosed, readonly, isLastNode, node, update]);

  const [columnLength, setColumnLength] = React.useState(2);
  const config = [node.otherProps?.config || node.otherProps].flat(1);
  const htmlRef = React.useRef<HTMLDivElement>(null);
  const [minWidth, setMinWidth] = React.useState(256);

  useEffect(() => {
    const updateWidth = () => {
      const width = Math.max(
        rootContainer?.current?.clientWidth ||
          htmlRef.current?.parentElement?.clientWidth ||
          256,
        256,
      );
      setMinWidth(width || 256);
      setColumnLength(Math.min(Math.floor(width / 256), config.length));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [config.length]);

  return useMemo(
    () => (
      <div
        data-drag-el
        {...attributes}
        data-be={'chart'}
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          margin: '1em 0',
          overflow: 'hidden',
        }}
        ref={htmlRef}
        onDragStart={(e) => store.dragStart(e, markdownContainerRef.current!)}
      >
        <DragHandle />
        <div
          data-chart-box
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '0.5em',
          }}
        >
          <ErrorBoundary
            fallback={
              <table>
                <tbody>{children}</tbody>
              </table>
            }
          >
            <div
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  width: '100%',
                  opacity: 0,
                  height: '100%',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                {children}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: minWidth < 400 ? 'column' : 'row',
                  gap: 8,
                  userSelect: 'none',
                }}
                contentEditable={false}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              >
                {config
                  .map(({ chartType, x, y, ...rest }, index) => {
                    const height = Math.min(
                      400,
                      htmlRef.current?.clientWidth || 400,
                    );
                    if (
                      typeof window === 'undefined' ||
                      typeof document === 'undefined'
                    ) {
                      return (
                        <div
                          key={index}
                          style={{
                            margin: 'auto',
                            position: 'relative',
                            zIndex: 9,
                          }}
                        ></div>
                      );
                    }

                    chartData = chartData
                      .map((item: any) => {
                        return {
                          ...item,
                          [x]: numberString(item[x]),
                          [y]: numberString(item[y]),
                        };
                      })
                      .sort((a: any, b: any) => {
                        if (dayjs(a[x]).isValid() && dayjs(b[x]).isValid()) {
                          return dayjs(a[x]).valueOf() - dayjs(b[x]).valueOf();
                        }
                        return 0;
                      });

                    const subgraphBy = rest?.subgraphBy;

                    if (subgraphBy) {
                      const groupData = groupByCategory(chartData, subgraphBy);
                      return Object.keys(groupData).map((key, subIndex) => {
                        const group = groupData[key];
                        if (!Array.isArray(group) || group.length < 1) {
                          return null;
                        }
                        const dom = (
                          <ChartRender
                            chartType={chartType}
                            chartData={group}
                            columnLength={columnLength}
                            onColumnLengthChange={setColumnLength}
                            isChartList
                            config={{
                              height,
                              x,
                              y,
                              columns,
                              index: index * 10 + subIndex,
                              rest,
                            }}
                            title={key}
                            dataTime={rest?.dataTime}
                            groupBy={rest?.groupBy}
                            filterBy={rest?.filterBy}
                            colorLegend={rest?.colorLegend}
                            loading={isUnclosed}
                          />
                        );
                        return dom;
                      });
                    }

                    return (
                      <ChartRender
                        key={index}
                        columnLength={columnLength}
                        onColumnLengthChange={setColumnLength}
                        chartType={chartType}
                        chartData={chartData}
                        title={rest?.title}
                        dataTime={rest?.dataTime}
                        groupBy={rest?.groupBy}
                        loading={isUnclosed}
                        filterBy={rest?.filterBy}
                        colorLegend={rest?.colorLegend}
                        config={{
                          height,
                          x,
                          y,
                          columns,
                          index: index,
                          rest,
                        }}
                      />
                    );
                  })
                  .map((itemList, index) => {
                    if (Array.isArray(itemList)) {
                      return itemList?.map((item, subIndex) => {
                        if (!item) return null;
                        return (
                          <div
                            key={index + subIndex}
                            style={{
                              margin: 'auto',
                              minWidth: 0,
                              width:
                                columnLength === 1
                                  ? '100%'
                                  : `calc(${100 / columnLength}% - 8px)`,
                              maxWidth: '100%',
                              flex: 1,
                              userSelect: 'none',
                            }}
                            contentEditable={false}
                          >
                            {item}
                          </div>
                        );
                      });
                    }
                    return (
                      <div
                        key={index}
                        contentEditable={false}
                        style={{
                          userSelect: 'none',
                          margin: 'auto',
                          minWidth: 0,
                          width:
                            columnLength === 1
                              ? '100%'
                              : `calc(${100 / columnLength}% - 8px)`,
                          maxWidth: '100%',
                          flex: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {itemList}
                      </div>
                    );
                  })}
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    ),
    [
      attributes,
      // 使用更高效的依赖项比较
      dataSourceHash,
      (node as TableNode).otherProps?.config,
      (node as TableNode).otherProps?.columns?.length,
      editor,
      columnLength,
      readonly,
      minWidth,
    ],
  );
};
