import React from 'react';
import {
  TABLE_DEFAULT_COL_WIDTH,
  TABLE_LAST_COL_MIN_WIDTH,
} from '../../../../Constants/mobile';
import type { ColWidthValue } from './utils/getTableColWidths';

const ROW_INDEX_COL_WIDTH = 12;

export interface TableColgroupProps {
  colWidths: ColWidthValue[];
  prefixColWidth?: number;
}

const isPercent = (v: ColWidthValue): v is string =>
  typeof v === 'string' && v.endsWith('%');

export const TableColgroup: React.FC<TableColgroupProps> = ({
  colWidths,
  prefixColWidth,
}) => {
  const showPrefix = (prefixColWidth ?? 0) > 0;
  if (!showPrefix && !colWidths.length) return null;

  return (
    <colgroup>
      {showPrefix && (
        <col
          style={{
            width: prefixColWidth,
            minWidth: prefixColWidth,
            maxWidth: prefixColWidth,
          }}
        />
      )}
      {colWidths.map((w, i) => {
        const last = i === colWidths.length - 1;
        const style = isPercent(w)
          ? { width: w, minWidth: TABLE_DEFAULT_COL_WIDTH, maxWidth: w }
          : last
            ? { minWidth: TABLE_LAST_COL_MIN_WIDTH }
            : { width: w, minWidth: w, maxWidth: w };
        return <col key={i} style={style} />;
      })}
    </colgroup>
  );
};

TableColgroup.displayName = 'TableColgroup';
export const TABLE_ROW_INDEX_COL_WIDTH = ROW_INDEX_COL_WIDTH;
