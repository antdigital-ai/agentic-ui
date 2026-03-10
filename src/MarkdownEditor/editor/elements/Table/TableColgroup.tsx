import React from 'react';
import { TABLE_LAST_COL_MIN_WIDTH } from '../../../../Constants/mobile';
import type { ColWidthValue } from './utils/getTableColWidths';

const ROW_INDEX_COL_WIDTH = 12;

export interface TableColgroupProps {
  /** 列宽数组，支持 number (px) 或 string (如 '25%')，空数组时不渲染数据列 */
  colWidths: ColWidthValue[];
  /** 第一列宽度（如行号列），传 0 或不传则不渲染 */
  prefixColWidth?: number;
}

function isPercentWidth(value: ColWidthValue): value is string {
  return typeof value === 'string' && value.endsWith('%');
}

/**
 * 表格 colgroup 渲染
 *
 * - 百分比列宽：各列固定 width/minWidth/maxWidth，实现平分
 * - px 列宽：最后一列使用 minWidth 实现弹性伸缩，其余列固定
 */
export const TableColgroup: React.FC<TableColgroupProps> = ({
  colWidths,
  prefixColWidth,
}) => {
  const showPrefixCol =
    prefixColWidth !== undefined && prefixColWidth > 0;

  if (!showPrefixCol && colWidths.length === 0) {
    return null;
  }

  return (
    <colgroup>
      {showPrefixCol && (
        <col
          style={{
            width: prefixColWidth,
            minWidth: prefixColWidth,
            maxWidth: prefixColWidth,
          }}
        />
      )}
      {colWidths.map((colWidth, index) => {
        const isPercent = isPercentWidth(colWidth);
        const isLastCol = index === colWidths.length - 1;

        if (isPercent) {
          return (
            <col
              key={index}
              style={{
                width: colWidth,
                minWidth: colWidth,
                maxWidth: colWidth,
              }}
            />
          );
        }

        return (
          <col
            key={index}
            style={
              isLastCol
                ? { minWidth: TABLE_LAST_COL_MIN_WIDTH }
                : {
                    width: colWidth,
                    minWidth: colWidth,
                    maxWidth: colWidth,
                  }
            }
          />
        );
      })}
    </colgroup>
  );
};

TableColgroup.displayName = 'TableColgroup';

/** 编辑模式行号列宽度 */
export const TABLE_ROW_INDEX_COL_WIDTH = ROW_INDEX_COL_WIDTH;
