type AreaChartComponent = typeof import('./AreaChart').default;
type BarChartComponent = typeof import('./BarChart').default;
type DonutChartComponent = typeof import('./DonutChart').default;
type FunnelChartComponent = typeof import('./FunnelChart').default;
type LineChartComponent = typeof import('./LineChart').default;
type RadarChartComponent = typeof import('./RadarChart').default;
type ScatterChartComponent = typeof import('./ScatterChart').default;

export interface ChartRuntime {
  AreaChart: AreaChartComponent;
  BarChart: BarChartComponent;
  DonutChart: DonutChartComponent;
  FunnelChart: FunnelChartComponent;
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
      import(/* webpackChunkName: "chart-donut" */ './DonutChart'),
      import(/* webpackChunkName: "chart-funnel" */ './FunnelChart'),
      import(/* webpackChunkName: "chart-line" */ './LineChart'),
      import(/* webpackChunkName: "chart-radar" */ './RadarChart'),
      import(/* webpackChunkName: "chart-scatter" */ './ScatterChart'),
    ])
      .then(
        ([
          areaModule,
          barModule,
          donutModule,
          funnelModule,
          lineModule,
          radarModule,
          scatterModule,
        ]) => ({
          AreaChart: areaModule.default,
          BarChart: barModule.default,
          DonutChart: donutModule.default,
          FunnelChart: funnelModule.default,
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
