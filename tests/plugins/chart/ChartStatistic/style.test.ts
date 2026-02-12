import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../../../src/Plugins/chart/ChartStatistic/style';

describe('ChartStatistic style', () => {
  describe('useStyle hook', () => {
    it('应返回 wrapSSR 与 hashId', () => {
      const { result } = renderHook(() => useStyle('chart-statistic'));

      expect(result.current).toBeDefined();
      expect(result.current.wrapSSR).toBeDefined();
      expect(result.current.hashId).toBeDefined();
      expect(typeof result.current.wrapSSR).toBe('function');
    });

    it('应支持自定义 prefixCls', () => {
      const { result } = renderHook(() => useStyle('custom-statistic'));

      expect(result.current.hashId).toBeDefined();
    });

    it('应支持无参数调用', () => {
      const { result } = renderHook(() => useStyle());

      expect(result.current).toBeDefined();
    });

    it('wrapSSR 应能包装节点', () => {
      const { result } = renderHook(() => useStyle('chart-statistic'));
      const node = React.createElement('div', null, 'test');

      expect(result.current.wrapSSR(node)).toBeDefined();
    });
  });
});
