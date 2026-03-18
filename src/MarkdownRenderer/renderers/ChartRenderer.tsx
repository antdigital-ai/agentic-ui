import React, { useMemo } from 'react';
import { ConfigProvider } from 'antd';
import clsx from 'clsx';
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

/**
 * Chart.js 图表渲染器，按需加载 chart.js 和 react-chartjs-2。
 */
export const ChartBlockRenderer: React.FC<RendererBlockProps> = (props) => {
  const { children, className } = props;
  const { getPrefixCls } = React.useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-renderer');

  const code = extractTextContent(children);

  const chartConfig = useMemo(() => {
    try {
      return JSON.parse(code);
    } catch {
      return null;
    }
  }, [code]);

  if (!chartConfig) {
    return (
      <div className={clsx(`${prefixCls}-chart-block`, `${prefixCls}-chart-block--error`, className)}>
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div className={clsx(`${prefixCls}-chart-block`, className)}>
      <ChartCanvas config={chartConfig} prefixCls={prefixCls} />
    </div>
  );
};

ChartBlockRenderer.displayName = 'ChartBlockRenderer';

/**
 * 独立的 Chart Canvas，按需动态加载 chart.js
 */
const ChartCanvas: React.FC<{
  config: any;
  prefixCls: string;
}> = ({ config, prefixCls }) => {
  const [ChartComponent, setChartComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    const loadChart = async () => {
      try {
        const [chartModule, reactChartModule] = await Promise.all([
          import('chart.js'),
          import('react-chartjs-2'),
        ]);

        chartModule.Chart.register(
          ...chartModule.registerables || [],
        );

        if (!cancelled) {
          const chartType = config?.type || 'bar';
          const typeMap: Record<string, React.ComponentType<any>> = {
            bar: reactChartModule.Bar,
            line: reactChartModule.Line,
            pie: reactChartModule.Pie,
            doughnut: reactChartModule.Doughnut,
            radar: reactChartModule.Radar,
            polarArea: reactChartModule.PolarArea,
            scatter: reactChartModule.Scatter,
            bubble: reactChartModule.Bubble,
          };
          setChartComponent(() => typeMap[chartType] || reactChartModule.Bar);
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
        }
      }
    };

    loadChart();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <div className={`${prefixCls}-chart-block-error`}>{error}</div>;
  }

  if (!ChartComponent) {
    return <div className={`${prefixCls}-chart-block-loading`}>Loading chart...</div>;
  }

  return (
    <ChartComponent
      data={config.data}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        ...config.options,
      }}
    />
  );
};
