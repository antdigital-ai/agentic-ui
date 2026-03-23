type AreaChartComponent = typeof import('./AreaChart').default;
type BarChartComponent = typeof import('./BarChart').default;
type BoxPlotChartComponent = typeof import('./BoxPlotChart').default;
type DonutChartComponent = typeof import('./DonutChart').default;
type FunnelChartComponent = typeof import('./FunnelChart').default;
type HistogramChartComponent = typeof import('./HistogramChart').default;
type LineChartComponent = typeof import('./LineChart').default;
type RadarChartComponent = typeof import('./RadarChart').default;
type ScatterChartComponent = typeof import('./ScatterChart').default;

export interface ChartRuntime {
  AreaChart: AreaChartComponent;
  BarChart: BarChartComponent;
  BoxPlotChart: BoxPlotChartComponent;
  DonutChart: DonutChartComponent;
  FunnelChart: FunnelChartComponent;
  HistogramChart: HistogramChartComponent;
  LineChart: LineChartComponent;
  RadarChart: RadarChartComponent;
  ScatterChart: ScatterChartComponent;
}

let runtimeLoader: Promise<ChartRuntime> | null = null;

export const loadChartRuntime = async (): Promise<ChartRuntime> => {
  if (typeof window === 'undefined') {
    throw new Error('图表运行时仅在浏览器环境中可用');
  }

  if (!runtimeLoader) {
    // 使用 webpack 魔法注释确保正确代码分割和解析
    runtimeLoader = Promise.all([
      import(/* webpackChunkName: "chart-area" */ './AreaChart'),
      import(/* webpackChunkName: "chart-bar" */ './BarChart'),
      import(/* webpackChunkName: "chart-boxplot" */ './BoxPlotChart'),
      import(/* webpackChunkName: "chart-donut" */ './DonutChart'),
      import(/* webpackChunkName: "chart-funnel" */ './FunnelChart'),
      import(/* webpackChunkName: "chart-histogram" */ './HistogramChart'),
      import(/* webpackChunkName: "chart-line" */ './LineChart'),
      import(/* webpackChunkName: "chart-radar" */ './RadarChart'),
      import(/* webpackChunkName: "chart-scatter" */ './ScatterChart'),
    ])
      .then(
        ([
          areaModule,
          barModule,
          boxplotModule,
          donutModule,
          funnelModule,
          histogramModule,
          lineModule,
          radarModule,
          scatterModule,
        ]) => ({
          AreaChart: areaModule.default,
          BarChart: barModule.default,
          BoxPlotChart: boxplotModule.default,
          DonutChart: donutModule.default,
          FunnelChart: funnelModule.default,
          HistogramChart: histogramModule.default,
          LineChart: lineModule.default,
          RadarChart: radarModule.default,
          ScatterChart: scatterModule.default,
        }),
      )
      .catch((error) => {
        runtimeLoader = null;
        throw error;
      });
  }

  return runtimeLoader;
};
