import React, { useEffect, useMemo, useState } from 'react';
import type { ColWidthValue } from './getTableColWidths';
import { getReadonlyTableColWidths } from './getTableColWidths';

/**
 * 只读表格列宽：仅在宽度不足时计算
 *
 * ## 场景与行为
 *
 * | 场景                         | 行为                                   |
 * | ---------------------------- | -------------------------------------- |
 * | 显式传入 otherProps.colWidths | 始终使用，不参与自动计算               |
 * | 容器宽度充足 (scrollWidth ≤ clientWidth) | 不设置 colgroup，交给浏览器自然分布 |
 * | 表格溢出 (scrollWidth > clientWidth)    | 根据列数计算列宽并设置 colgroup      |
 * | 未测量 (clientWidth === 0，如 SSR/测试) | 保守地按需计算，显示 colgroup       |
 *
 * ## 实现方式
 *
 * - ResizeObserver 监听容器尺寸变化
 * - checkOverflow 比较 table.scrollWidth 与 container.clientWidth
 * - needsColWidths 为 true 时才调用 getReadonlyTableColWidths 并渲染 colgroup
 * - 宽容器下多数表格不再计算列宽，布局由浏览器处理
 *
 * @see ./README.md
 */
export interface UseReadonlyTableColWidthsParams {
  columnCount: number;
  otherProps?: { colWidths?: ColWidthValue[] } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
}

export function useReadonlyTableColWidths({
  columnCount,
  otherProps,
  containerRef,
  tableRef,
}: UseReadonlyTableColWidthsParams): ColWidthValue[] {
  const [needsColWidths, setNeedsColWidths] = useState(false);

  const computedColWidths = useMemo(
    () =>
      getReadonlyTableColWidths({
        columnCount,
        otherProps: otherProps as { colWidths?: number[] } | null | undefined,
      }),
    [columnCount, otherProps],
  );

  useEffect(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table || columnCount === 0) return;

    const checkOverflow = () => {
      const cw = container.clientWidth;
      const sw = table.scrollWidth;
      const unmeasured = cw === 0;
      const overflow = sw > cw;
      setNeedsColWidths(unmeasured || overflow);
    };

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(container);
    checkOverflow();
    return () => ro.disconnect();
  }, [columnCount]);

  return useMemo(() => {
    if (otherProps?.colWidths?.length) return otherProps.colWidths;
    return needsColWidths ? computedColWidths : [];
  }, [otherProps?.colWidths, needsColWidths, computedColWidths]);
}
