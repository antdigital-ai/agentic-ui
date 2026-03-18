import React, { useEffect, useMemo, useState } from 'react';
import { TABLE_COL_WIDTH_MIN_COLUMNS } from '../../../../../Constants/mobile';
import type { TableNode } from '../../../types/Table';
import type { ColWidthValue } from './getTableColWidths';
import { getReadonlyTableColWidths } from './getTableColWidths';

export interface UseReadonlyTableColWidthsParams {
  columnCount: number;
  otherProps?: { colWidths?: ColWidthValue[] } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tableRef: React.RefObject<HTMLTableElement | null>;
  element?: TableNode | null;
}

export function useReadonlyTableColWidths({
  columnCount,
  otherProps,
  containerRef,
  tableRef,
  element,
}: UseReadonlyTableColWidthsParams): ColWidthValue[] {
  const [needsColWidths, setNeedsColWidths] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const computed = useMemo(
    () =>
      getReadonlyTableColWidths({
        columnCount,
        otherProps,
        element,
        containerWidth: containerWidth || undefined,
      }),
    [columnCount, otherProps, element, containerWidth],
  );

  useEffect(() => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !table || columnCount === 0) return;
    const check = () => {
      const cw = container.clientWidth;
      setContainerWidth(cw);
      setNeedsColWidths(cw === 0 || table.scrollWidth > cw);
    };
    const ro = new ResizeObserver(check);
    ro.observe(container);
    check();
    return () => ro.disconnect();
  }, [columnCount]);

  return useMemo(() => {
    if (otherProps?.colWidths?.length) return otherProps.colWidths;
    if (columnCount >= TABLE_COL_WIDTH_MIN_COLUMNS) return computed;
    return needsColWidths ? computed : [];
  }, [otherProps?.colWidths, needsColWidths, computed, columnCount]);
}
