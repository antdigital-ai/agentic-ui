import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOBILE_MAX_CHART_SIZE } from '../../../../src/Plugins/chart/DonutChart/constants';
import {
  useAutoCategory,
  useFilterLabels,
  useMobile,
  useResponsiveDimensions,
} from '../../../../src/Plugins/chart/DonutChart/hooks';
import type { DonutChartData } from '../../../../src/Plugins/chart/DonutChart/types';

describe('DonutChart hooks', () => {
  const originalInnerWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1024;

  beforeEach(() => {
    // 重置 window.innerWidth
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    }
    vi.clearAllMocks();
  });

  describe('useMobile', () => {
    it('应该初始化正确的移动设备状态', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.windowWidth).toBe(1024);
    });

    it('在移动端应该返回正确的状态', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.windowWidth).toBe(600);
    });

    it('应该监听窗口大小变化', () => {
      const { result } = renderHook(() => useMobile());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.windowWidth).toBe(1024);

      // 模拟窗口大小变化到移动端
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 600,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.windowWidth).toBe(600);

      // 模拟窗口大小变化回桌面端
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.windowWidth).toBe(1024);
    });

    it('应该清理事件监听器', () => {
      if (typeof window === 'undefined') {
        return;
      }

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useMobile());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });
  });

  describe('useResponsiveDimensions', () => {
    it('在桌面端应该返回原始尺寸', () => {
      const isMobile = false;
      const windowWidth = 1024;
      const width = 400;
      const height = 300;

      const result = useResponsiveDimensions(
        isMobile,
        windowWidth,
        width,
        height,
      );

      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
      expect(result.chartWidth).toBe(width);
      expect(result.chartHeight).toBe(height);
    });

    it('在移动端应该返回响应式尺寸', () => {
      const isMobile = true;
      const windowWidth = 360;
      const width = 400;
      const height = 300;

      const result = useResponsiveDimensions(
        isMobile,
        windowWidth,
        width,
        height,
      );

      const expectedSize = Math.min(
        windowWidth - 40,
        Number(width),
        MOBILE_MAX_CHART_SIZE,
      );

      expect(result.width).toBe(expectedSize);
      expect(result.height).toBe(expectedSize);
      expect(result.chartWidth).toBe(expectedSize);
      expect(result.chartHeight).toBe(expectedSize);
    });

    it('在移动端应该处理较大的MOBILE_MAX_CHART_SIZE', () => {
      const isMobile = true;
      const windowWidth = 1000;
      const width = 800;
      const height = 600;

      const result = useResponsiveDimensions(
        isMobile,
        windowWidth,
        width,
        height,
      );

      const expectedSize = Math.min(
        windowWidth - 40,
        Number(width),
        MOBILE_MAX_CHART_SIZE,
      );

      expect(result.width).toBe(expectedSize);
      expect(result.height).toBe(expectedSize);
    });

    it('应该处理字符串类型的宽度和高度', () => {
      const isMobile = false;
      const windowWidth = 1024;
      const width = '100%';
      const height = '500px';

      const result = useResponsiveDimensions(
        isMobile,
        windowWidth,
        width,
        height,
      );

      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
      expect(result.chartWidth).toBe(width);
      expect(result.chartHeight).toBe(height);
    });

    it('在移动端应该正确处理字符串类型的宽度和高度', () => {
      const isMobile = true;
      const windowWidth = 360;
      const width = '100%';
      const height = '500px';

      const result = useResponsiveDimensions(
        isMobile,
        windowWidth,
        width,
        height,
      );

      const expectedSize = Math.min(
        windowWidth - 40,
        Number(width),
        MOBILE_MAX_CHART_SIZE,
      );

      expect(result.width).toBe(expectedSize);
      expect(result.height).toBe(expectedSize);
    });
  });

  describe('useFilterLabels', () => {
    it('应该从数据中提取有效的筛选标签', () => {
      const data = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
        { label: 'B', value: 20, filterLabel: 'Category 1' },
        { label: 'C', value: 30, filterLabel: 'Category 2' },
        { label: 'D', value: 40 }, // 没有filterLabel
        { label: 'E', value: 50, filterLabel: 'Category 3' },
      ];

      const { result } = renderHook(() => useFilterLabels(data));

      expect(result.current.filterLabels).toEqual([
        'Category 1',
        'Category 2',
        'Category 3',
      ]);
      expect(result.current.selectedFilterLabel).toBe('Category 1');
    });

    it('当没有筛选标签时应该返回undefined', () => {
      const data = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
        { label: 'C', value: 30 },
      ];

      const { result } = renderHook(() => useFilterLabels(data));

      expect(result.current.filterLabels).toBeUndefined();
      expect(result.current.selectedFilterLabel).toBeUndefined();
    });

    it('应该去重筛选标签', () => {
      const data = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
        { label: 'B', value: 20, filterLabel: 'Category 1' },
        { label: 'C', value: 30, filterLabel: 'Category 2' },
        { label: 'D', value: 40, filterLabel: 'Category 1' },
        { label: 'E', value: 50, filterLabel: 'Category 2' },
      ];

      const { result } = renderHook(() => useFilterLabels(data));

      expect(result.current.filterLabels).toEqual(['Category 1', 'Category 2']);
      expect(result.current.selectedFilterLabel).toBe('Category 1');
    });

    it('应该正确生成筛选数据', () => {
      const data = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
        { label: 'B', value: 20, filterLabel: 'Category 2' },
        { label: 'C', value: 30, filterLabel: 'Category 1' },
      ];

      const { result } = renderHook(() => useFilterLabels(data));

      expect(result.current.filteredDataByFilterLabel).toEqual([
        { key: 'Category 1', label: 'Category 1' },
        { key: 'Category 2', label: 'Category 2' },
      ]);
    });

    it('应该能够更新选中的筛选标签', () => {
      const data = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
        { label: 'B', value: 20, filterLabel: 'Category 2' },
      ];

      const { result } = renderHook(() => useFilterLabels(data));

      expect(result.current.selectedFilterLabel).toBe('Category 1');

      act(() => {
        result.current.setSelectedFilterLabel('Category 2');
      });

      expect(result.current.selectedFilterLabel).toBe('Category 2');
    });

    it('当筛选标签变化时应该自动纠正选中项', () => {
      const initialData = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
        { label: 'B', value: 20, filterLabel: 'Category 2' },
      ];

      const { result, rerender } = renderHook(
        ({ data }) => useFilterLabels(data),
        {
          initialProps: { data: initialData },
        },
      );

      expect(result.current.selectedFilterLabel).toBe('Category 1');

      // 更新数据，移除Category 1
      const newData = [
        { label: 'B', value: 20, filterLabel: 'Category 2' },
        { label: 'C', value: 30, filterLabel: 'Category 3' },
      ];

      rerender({ data: newData });

      // 应该自动选择新的第一个标签
      expect(result.current.selectedFilterLabel).toBe('Category 2');
    });

    it('当筛选标签为空时应该清除选中项', () => {
      const initialData = [
        { label: 'A', value: 10, filterLabel: 'Category 1' },
      ];

      const { result, rerender } = renderHook(
        ({ data }: { data: DonutChartData[] }) => useFilterLabels(data),
        {
          initialProps: { data: initialData },
        },
      );

      expect(result.current.selectedFilterLabel).toBe('Category 1');

      // 更新数据，移除所有filterLabel
      const newData: DonutChartData[] = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
      ];

      rerender({ data: newData } as any);

      // 应该清除选中项
      expect(result.current.selectedFilterLabel).toBeUndefined();
    });
  });

  describe('useAutoCategory', () => {
    it('当禁用自动分类时应该返回null', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
      ];
      const enableAutoCategory = false;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.autoCategoryData).toBeNull();
    });

    it('当数据为空时应该返回null', () => {
      const data: any[] = [];
      const enableAutoCategory = true;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.autoCategoryData).toBeNull();
    });

    it('当类别数小于等于1时应该返回null', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat1' },
        { label: 'C', value: 30 }, // 没有category
      ];
      const enableAutoCategory = true;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.autoCategoryData).toBeNull();
    });

    it('应该正确提取多个类别', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
        { label: 'C', value: 30, category: 'Cat3' },
        { label: 'D', value: 40, category: 'Cat1' },
        { label: 'E', value: 50 }, // 没有category
      ];
      const enableAutoCategory = true;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.autoCategoryData).not.toBeNull();
      expect(result.current.autoCategoryData?.categories).toEqual([
        'Cat1',
        'Cat2',
        'Cat3',
      ]);
      expect(result.current.autoCategoryData?.allData).toBe(data);
    });

    it('应该初始化内部选中的类别', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
      ];
      const enableAutoCategory = true;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.internalSelectedCategory).toBe('Cat1');
      expect(result.current.selectedCategory).toBe('Cat1');
    });

    it('应该能够更新内部选中的类别', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
      ];
      const enableAutoCategory = true;

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory),
      );

      expect(result.current.internalSelectedCategory).toBe('Cat1');

      act(() => {
        result.current.setInternalSelectedCategory('Cat2');
      });

      expect(result.current.internalSelectedCategory).toBe('Cat2');
      expect(result.current.selectedCategory).toBe('Cat2');
    });

    it('应该优先使用外部选中的类别', () => {
      const data = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
      ];
      const enableAutoCategory = true;
      const externalSelectedFilter = 'ExternalCategory';

      const { result } = renderHook(() =>
        useAutoCategory(data, enableAutoCategory, externalSelectedFilter),
      );

      expect(result.current.selectedCategory).toBe('ExternalCategory');
    });

    it('当自动分类关闭时应该清理内部选中项', () => {
      const initialData = [
        { label: 'A', value: 10, category: 'Cat1' },
        { label: 'B', value: 20, category: 'Cat2' },
      ];

      const { result, rerender } = renderHook(
        ({ enableAutoCategory }) =>
          useAutoCategory(initialData, enableAutoCategory),
        {
          initialProps: { enableAutoCategory: true },
        },
      );

      // 设置一个内部选中项
      act(() => {
        result.current.setInternalSelectedCategory('Cat2');
      });

      expect(result.current.internalSelectedCategory).toBe('Cat2');

      // 关闭自动分类
      rerender({ enableAutoCategory: false });

      // 应该清理内部选中项
      expect(result.current.internalSelectedCategory).toBe('');
    });
  });
});
