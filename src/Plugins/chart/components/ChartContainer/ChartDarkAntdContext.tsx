import { createContext, useContext } from 'react';

/**
 * 标记当前已在某层 ChartContainer 内为暗色图表挂载过 Ant Design 暗色 ConfigProvider，
 * 嵌套 ChartContainer 不再重复包裹，避免多层 Provider。
 */
export const ChartDarkAntdProvidedContext = createContext(false);

export const useChartDarkAntdProvided = () =>
  useContext(ChartDarkAntdProvidedContext);
