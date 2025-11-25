import { BaseElement, Text } from 'slate';

export type TableCustomElement =
  | TableNode
  | TableHeadNode
  | TableFooterNode
  | TrNode
  | ThNode
  | TdNode;

export interface TableNode {
  type: 'table';
  children: Array<TableHeadNode | TrNode | TableFooterNode>;
  otherProps?: {
    mergeCells?: Array<{
      row: number;
      col: number;
      rowSpan: number;
      colSpan: number;
    }>;
    finish?: boolean; // 标记表格是否已闭合
    config?: any;
    columns?: Array<any>; // 用于定义列属性，如宽度、对齐方式等
  };
}

export interface TableHeadNode {
  type: 'table-head';
  children: TrNode[];
}

export interface TableFooterNode {
  type: 'table-footer';
  children: TrNode[];
}

export interface TrNode {
  type: 'table-row';
  children: Array<TdNode | ThNode>;
}

export interface ThNode {
  type: 'header-cell';
  rowSpan?: number;
  colSpan?: number;
  children: Array<TableCustomElement | Text>;
}

export interface TdNode {
  type: 'table-cell';
  rowSpan?: number;
  colSpan?: number;
  select?: boolean; // 标记单元格是否被选中
  children: Array<TableCustomElement | BaseElement['children'] | Text>;
}
