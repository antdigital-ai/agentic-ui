import { describe, expect, it } from 'vitest';
import { DEFAULT_CHART_DATASET_TYPE, normalizeRadarChartData } from '../utils';

describe('normalizeRadarChartData', () => {
  it('应将 x/y/category 归一化为 ChartDataItem', () => {
    const result = normalizeRadarChartData([
      { category: '团队A', x: '产品', y: 85 },
      { category: '团队A', x: '技术', y: 90 },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category: '团队A',
      type: DEFAULT_CHART_DATASET_TYPE,
      x: '产品',
      y: 85,
      xtitle: undefined,
      ytitle: undefined,
      filterLabel: undefined,
    });
  });

  it('应兼容 label/score 历史字段', () => {
    const result = normalizeRadarChartData([
      { category: 'A组', label: '技术', type: '团队A', score: 80 },
    ]);

    expect(result[0]?.x).toBe('技术');
    expect(result[0]?.y).toBe(80);
    expect(result[0]?.type).toBe('团队A');
  });
});
