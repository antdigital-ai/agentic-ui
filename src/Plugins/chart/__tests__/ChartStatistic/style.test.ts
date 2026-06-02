import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../ChartStatistic/style';

describe('ChartStatistic style', () => {
  describe('useStyle hook', () => {
    it('应返回 hashId', () => {
      const { result } = renderHook(() => useStyle('chart-statistic'));

      expect(result.current).toBeDefined();
      expect(result.current.hashId).toBeDefined();
    });

    it('应支持自定义 prefixCls', () => {
      const { result } = renderHook(() => useStyle('custom-statistic'));

      expect(result.current.hashId).toBeDefined();
    });

    it('应支持无参数调用', () => {
      const { result } = renderHook(() => useStyle());

      expect(result.current).toBeDefined();
    });
  });
});
