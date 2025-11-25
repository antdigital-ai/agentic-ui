import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

/**
 * Chart.js 组件注册状态映射
 * 用于跟踪哪些 Chart.js 组件已经被注册，避免重复注册
 */
const registeredComponents = new Set<string>();

/**
 * 注册 Chart.js 基础组件
 *
 * 用于注册图表所需的基础 Chart.js 组件，包括坐标轴、图例、工具提示等。
 * 使用单例模式确保只注册一次。
 *
 * @param {string[]} components - 要注册的组件名称数组
 * @param {Function} registerFn - 注册函数，接收 ChartJS 作为参数
 *
 * @example
 * ```typescript
 * registerChartComponents('line-chart', () => {
 *   ChartJS.register(
 *     CategoryScale,
 *     LinearScale,
 *     PointElement,
 *     LineElement,
 *     Filler,
 *     Tooltip,
 *     Legend,
 *   );
 * });
 * ```
 *
 * @since 1.0.0
 */
export const registerChartComponents = (
  componentName: string,
  registerFn: () => void,
) => {
  if (registeredComponents.has(componentName)) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  registerFn();
  registeredComponents.add(componentName);
};

/**
 * 注册折线图/面积图所需的组件
 */
export const registerLineChartComponents = () => {
  registerChartComponents('line-chart', () => {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend,
    );
  });
};

/**
 * 注册柱状图所需的组件
 */
export const registerBarChartComponents = () => {
  registerChartComponents('bar-chart', () => {
    ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
  });
};

