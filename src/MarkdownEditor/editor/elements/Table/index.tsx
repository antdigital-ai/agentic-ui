/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-use-before-define */
'use client';

import React, { memo } from 'react';
import { RenderElementProps } from 'slate-react';
import { SimpleTable } from './SimpleTable';
import { TableCellIndex } from './TableCellIndex';
import { Td } from './Td';
import { isSameTableCellRenderProps } from './utils/tableCellMemo';
import { useSlateElementPath } from './utils/useSlateElementPath';

export type {
  TableCustomElement,
  TableFooterNode,
  TableHeadNode,
  TableNode,
  TdNode,
  ThNode,
  TrNode,
} from '../../types/Table';

const ThComponent: React.FC<
  RenderElementProps & {
    style?: React.CSSProperties;
  }
> = ({ attributes, children, style, element }) => {
  if (element.type !== 'header-cell') {
    throw new Error('Element "Th" must be of type "header-cell"');
  }

  return (
    <th
      style={{
        verticalAlign: 'middle',
        ...style,
      }}
      {...attributes}
    >
      {children}
    </th>
  );
};

export const Th = memo(ThComponent, isSameTableCellRenderProps);
Th.displayName = 'Th';

const TableCellIndexWrapper: React.FC<{
  targetRow: unknown;
}> = ({ targetRow }) => {
  const rowPath = useSlateElementPath(targetRow);
  const rowIndex = rowPath ? rowPath[rowPath.length - 1] : undefined;
  const tablePath = rowPath ? rowPath.slice(0, -1) : undefined;

  return (
    <TableCellIndex
      targetRow={targetRow}
      rowIndex={rowIndex}
      tablePath={tablePath}
    />
  );
};

type TableRowProps = {
  rowProps: RenderElementProps;
  readonly?: boolean;
};

const TableRowComponent: React.FC<TableRowProps> = ({ rowProps, readonly }) => (
  <tr {...rowProps.attributes}>
    {readonly ? null : <TableCellIndexWrapper targetRow={rowProps.element} />}
    {rowProps.children}
  </tr>
);

const TableRow = memo(
  TableRowComponent,
  (prev, next) =>
    prev.readonly === next.readonly &&
    prev.rowProps.element === next.rowProps.element &&
    prev.rowProps.children === next.rowProps.children,
);

TableRow.displayName = 'TableRow';

export { Td } from './Td';

export const tableRenderElement = (
  props: RenderElementProps,
  config?: { readonly?: boolean },
) => {
  switch (props.element.type) {
    case 'table':
      return <SimpleTable {...props} />;
    case 'table-head':
      return (
        <thead
          style={{
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: '#e5e7eb',
            fontSize: '13px',
            textTransform: 'uppercase',
            backgroundColor: '#f1f5f9',
          }}
          {...props.attributes}
        >
          {props.children}
        </thead>
      );
    case 'table-footer':
      return <tfoot {...props.attributes}>{props.children}</tfoot>;
    case 'table-row':
      return <TableRow rowProps={props} readonly={config?.readonly} />;
    case 'header-cell':
      return <Th {...props} />;
    case 'table-cell':
      return <Td {...props} style={{ verticalAlign: 'middle' }} />;
    default:
      return null;
  }
};
