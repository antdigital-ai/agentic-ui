import classNames from 'clsx';
import React, { useEffect, useMemo } from 'react';
import { MOBILE_BREAKPOINT } from '../../../../Constants/mobile';
import { TableNode } from '../../types/Table';
import { TABLE_ROW_INDEX_COL_WIDTH, TableColgroup } from './TableColgroup';
import { TableRowIndex } from './TableRowIndex';
import {
  getEditableTableMinWidth,
} from './utils/editableTableWidth';
import { useEditableTableColWidths } from './utils/useEditableTableColWidths';
import { useEditableTableContentWidth } from './utils/useEditableTableContentWidth';
import useScrollShadow from './useScrollShadow';

const TABLE_MIN_CONTAINER_WIDTH = 200;

export interface EditableTableProps {
  baseCls: string;
  children: React.ReactNode;
  tablePath?: number[];
  tableNode?: TableNode;
  markdownContainerRef?: React.RefObject<HTMLElement | null>;
  tableCssVariables?: React.CSSProperties;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  baseCls,
  children,
  tablePath,
  tableNode,
  markdownContainerRef,
  tableCssVariables,
}) => {
  const columnCount = tableNode?.children?.[0]?.children?.length || 0;
  const mobileBreakpointValue = parseInt(MOBILE_BREAKPOINT, 10) || 768;
  const [tableRef, scrollState] = useScrollShadow();
  const { resolvedContentWidth, availableTableWidth } =
    useEditableTableContentWidth({
      readonly: false,
      markdownContainerRef,
      minContainerWidth: TABLE_MIN_CONTAINER_WIDTH,
    });

  const colWidths = useEditableTableColWidths({
    readonly: false,
    columnCount,
    availableTableWidth,
    mobileBreakpointValue,
    element: tableNode,
  });

  useEffect(() => {
    const resize = () => {
      if (process.env.NODE_ENV === 'test') return;

      const dom = tableRef.current as HTMLDivElement | null;
      if (!dom) return;

      const requiredMinWidth = getEditableTableMinWidth({
        columnCount,
        colWidths,
        availableTableWidth,
        mobileBreakpointValue,
        resolvedContentWidth,
        minContainerWidth: TABLE_MIN_CONTAINER_WIDTH,
        rowIndexColWidth: TABLE_ROW_INDEX_COL_WIDTH,
      });
      dom.style.minWidth = `${requiredMinWidth}px`;
    };

    document.addEventListener('md-resize', resize);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      document.removeEventListener('md-resize', resize);
      window.removeEventListener('resize', resize);
    };
  }, [
    tableRef,
    columnCount,
    colWidths,
    availableTableWidth,
    mobileBreakpointValue,
    resolvedContentWidth,
  ]);

  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent('md-resize', {
        detail: {},
      }),
    );
  }, []);

  const tableDom = useMemo(
    () => (
      <table
        className={classNames(`${baseCls}-editor-table`)}
        onDragStart={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        <TableColgroup
          colWidths={colWidths}
          prefixColWidth={TABLE_ROW_INDEX_COL_WIDTH}
        />
        <tbody>
          <TableRowIndex
            colWidths={colWidths}
            columnCount={columnCount}
            tablePath={tablePath}
          />
          {children}
        </tbody>
      </table>
    ),
    [baseCls, colWidths, columnCount, tablePath, children],
  );

  const boxShadowStyle = useMemo(
    () => ({
      flex: 1,
      minWidth: 0,
      boxShadow: `
      ${scrollState.vertical.hasScroll && !scrollState.vertical.isAtStart ? 'inset 0 8px 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.vertical.hasScroll && !scrollState.vertical.isAtEnd ? 'inset 0 -8px 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.horizontal.hasScroll && !scrollState.horizontal.isAtStart ? 'inset 8px 0 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.horizontal.hasScroll && !scrollState.horizontal.isAtEnd ? 'inset -8px 0 8px -8px rgba(0,0,0,0.1)' : ''}
    `,
    }),
    [scrollState],
  );

  return (
    <div
      className={classNames(baseCls)}
      ref={tableRef}
      style={{
        ...boxShadowStyle,
        position: 'relative',
        ...(tableCssVariables as React.CSSProperties),
      }}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
      }}
    >
      {tableDom}
    </div>
  );
};
