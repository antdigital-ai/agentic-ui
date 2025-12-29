import { ChartStatisticProps } from '../ChartStatistic';

export type ChartStatisticConfig = Omit<ChartStatisticProps, 'theme'>;
export type StatisticConfigType = ChartStatisticConfig | ChartStatisticConfig[];
