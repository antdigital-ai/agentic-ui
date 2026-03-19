import { useMemo } from 'react';
import type { TableNode } from '../../../types/Table';
import {
  getEditableTableColWidths,
  type GetEditableTableColWidthsParams,
} from './editableTableWidth';

export interface UseEditableTableColWidthsParams
  extends Omit<GetEditableTableColWidthsParams, 'element'> {
  element?: TableNode;
}

export function useEditableTableColWidths({
  readonly,
  columnCount,
  availableTableWidth,
  mobileBreakpointValue,
  element,
}: UseEditableTableColWidthsParams): number[] {
  return useMemo(
    () =>
      getEditableTableColWidths({
        readonly,
        columnCount,
        availableTableWidth,
        mobileBreakpointValue,
        element,
      }),
    [
      readonly,
      columnCount,
      availableTableWidth,
      mobileBreakpointValue,
      element,
    ],
  );
}
