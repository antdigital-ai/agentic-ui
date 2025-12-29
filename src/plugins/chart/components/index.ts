export { default as ChartStatistic } from '../ChartStatistic';
export type { ChartStatisticProps } from '../ChartStatistic';
export { default as ChartContainer } from './ChartContainer/ChartContainer';
export type { ChartContainerProps } from './ChartContainer/ChartContainer';
export { default as ChartFilter } from './ChartFilter/ChartFilter';
export type {
  ChartFilterProps,
  FilterOption,
  RegionOption,
} from './ChartFilter/ChartFilter';
export { default as ChartToolBar } from './ChartToolBar/ChartToolBar';
export type { ChartToolBarProps } from './ChartToolBar/ChartToolBar';

// 通用图表下载工具函数
export const downloadChart = (
  chartInstance: any,
  filename: string = 'chart',
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1,
): boolean => {
  if (!chartInstance) {
    console.error('Chart instance is not available');
    return false;
  }

  try {
    // 使用 Chart.js 原生的 toBase64Image 方法
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const base64Image = chartInstance.toBase64Image(mimeType, quality);

    // 验证 base64 数据是否有效
    if (!base64Image || base64Image.trim() === '') {
      throw new Error('Invalid base64 image data');
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${filename}-${new Date().getTime()}.${format}`;
    link.href = base64Image;

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Chart downloaded successfully as ${format.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error('Error downloading chart:', error);
    return false;
  }
};
