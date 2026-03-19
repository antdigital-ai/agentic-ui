import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loading } from '../../Components/Loading';
import { ChartRender } from '../../Plugins/chart/ChartRender';
import type { RendererBlockProps } from '../types';

const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextContent(children.props.children);
  }
  return '';
};

interface ChartData {
  config?: any;
  chartType?: string;
  x?: string;
  y?: string;
  dataSource?: Record<string, any>[];
  columns?: { title: string; dataIndex: string }[];
  [key: string]: any;
}

/**
 * 解析图表 JSON 配置。
 * 支持两种格式：
 * 1. 完整格式：{ config: [...], dataSource: [...], columns: [...] }
 * 2. 简单格式：{ chartType, x, y, data: [...] }
 */
const parseChartData = (code: string): ChartData | null => {
  try {
    const parsed = JSON.parse(code.trim());
    if (!parsed || typeof parsed !== 'object') return null;

    if (Array.isArray(parsed)) {
      return { config: parsed };
    }
    return parsed;
  } catch {
    return null;
  }
};

/** 图表渲染失败时用相同 props 重试一次（销毁再重建） */
const ChartWithRetry: React.FC<{
  index: number;
  columnLength: number;
  setColumnLength: (n: number) => void;
  chartType: string;
  chartDataItems: Record<string, any>[];
  rest: Record<string, any>;
  height: number;
  x?: string;
  y?: string;
  columns: { title: string; dataIndex: string }[];
}> = (props) => {
  const {
    index,
    columnLength,
    setColumnLength,
    chartType,
    chartDataItems,
    rest,
    height,
    x,
    y,
    columns,
  } = props;
  const [retryKey, setRetryKey] = useState(0);

  const handleChartError = React.useCallback(
    (error: Error, info: React.ErrorInfo) => {
      console.error('[MarkdownRenderer ChartBlockRenderer] 渲染失败:', {
        chartType,
        title: rest?.title,
        x,
        y,
        dataSourceLength: chartDataItems.length,
        columnsLength: columns.length,
        error: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
      });
      setRetryKey((k) => (k === 0 ? 1 : k));
    },
    [chartType, rest?.title, x, y, chartDataItems.length, columns.length],
  );

  const chartFallback = (
    <div style={{ padding: 12, color: '#999', fontSize: 12 }}>
      Chart: {rest?.title || chartType}
    </div>
  );

  return (
    <div
      style={{
        margin: 'auto',
        minWidth: 0,
        width:
          columnLength === 1 ? '100%' : `calc(${100 / columnLength}% - 8px)`,
        maxWidth: '100%',
        flex: 1,
        userSelect: 'none',
      }}
    >
      <ErrorBoundary
        key={retryKey}
        fallback={chartFallback}
        onError={handleChartError}
      >
        <ChartRender
          chartType={chartType as 'pie'}
          chartData={chartDataItems}
          columnLength={columnLength}
          onColumnLengthChange={setColumnLength}
          title={rest?.title}
          dataTime={rest?.dataTime}
          groupBy={rest?.groupBy}
          filterBy={rest?.filterBy}
          colorLegend={rest?.colorLegend}
          config={{
            height,
            x,
            y,
            columns,
            index,
            rest,
          }}
        />
      </ErrorBoundary>
    </div>
  );
};

/**
 * 图表渲染器——复用 MarkdownEditor 的 ChartRender 组件。
 *
 * 在 MarkdownEditor 中，图表由 HTML 注释（配置）+ 表格（数据）组合而成，
 * Slate 解析器将其合并为 chart 节点（otherProps.config / dataSource / columns）。
 *
 * 在 MarkdownRenderer 中，chart 代码块的内容是序列化后的 JSON，
 * 包含 config、dataSource、columns 等字段。
 */
export const ChartBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { children, className } = props;
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor');
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnLength, setColumnLength] = useState(2);
  const [mounted, setMounted] = useState(false);

  const code = extractTextContent(children);
  const chartData = useMemo(() => parseChartData(code), [code]);

  useEffect(() => {
    // 延迟一帧渲染图表，确保容器已挂载到 DOM 且有正确的宽度
    // 解决 recharts ResponsiveContainer 在零宽容器中崩溃的问题
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const updateWidth = () => {
      const width = containerRef.current?.clientWidth || 400;
      const configs = chartData?.config
        ? Array.isArray(chartData.config)
          ? chartData.config
          : [chartData.config]
        : [chartData];
      setColumnLength(
        Math.min(Math.floor(Math.max(width, 256) / 256), configs.length),
      );
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [chartData, mounted]);

  if (!chartData) {
    return (
      <div
        className={clsx(
          `${prefixCls}-chart-block`,
          `${prefixCls}-chart-block--error`,
          className,
        )}
      >
        <pre style={{ margin: 0, padding: 12, fontSize: 12 }}>{code}</pre>
      </div>
    );
  }

  const configs: any[] = Array.isArray(chartData.config)
    ? chartData.config
    : chartData.config
      ? [chartData.config]
      : [chartData];

  const dataSource = chartData.dataSource || chartData.data || [];
  const columns = chartData.columns || [];

  return (
    <div
      ref={containerRef}
      data-be="chart"
      className={clsx(className)}
      style={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        margin: '1em 0',
        overflow: 'hidden',
      }}
    >
      {!mounted ? (
        <div style={{ padding: 12 }}>
          <Loading />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            userSelect: 'none',
          }}
        >
          {configs.map((cfg, index) => {
            const { chartType, x, y, ...rest } = cfg;

            if (!chartType) {
              return (
                <div key={index} style={{ padding: 12, color: '#999' }}>
                  <Loading />
                </div>
              );
            }

            const chartDataItems = dataSource.map((item: any) => {
              const { chartType: _chartType, ...rowData } = item;
              const row: Record<string, any> = {
                ...rowData,
                column_list: Object.keys(rowData),
              };
              if (x && row[x] !== undefined) {
                const num = Number(row[x]);
                if (!isNaN(num)) row[x] = num;
              }
              if (y && row[y] !== undefined) {
                const num = Number(row[y]);
                if (!isNaN(num)) row[y] = num;
              }
              return row;
            });

            const height = Math.min(
              400,
              containerRef.current?.clientWidth || 400,
            );

            return (
              <ChartWithRetry
                key={index}
                index={index}
                columnLength={columnLength}
                setColumnLength={setColumnLength}
                chartType={chartType}
                chartDataItems={chartDataItems}
                rest={rest}
                height={height}
                x={x}
                y={y}
                columns={columns}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

ChartBlockRenderer.displayName = 'ChartBlockRenderer';
