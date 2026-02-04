/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-use-before-define */
'use client';

import React from 'react';
import { RenderElementProps, useSlateSelection } from 'slate-react';
import { useSelStatus } from '../../../hooks/editor';
// 原生表格编辑器已集成
import { SimpleTable } from './SimpleTable';
import { TableCellIndex } from './TableCellIndex';
import { Td } from './Td';

export type {
  TableCustomElement,
  TableFooterNode,
  TableHeadNode,
  TableNode,
  TdNode,
  ThNode,
  TrNode,
} from '../../types/Table';

/**
 * Th 组件 - 表格头部单元格组件
 *
 * 该组件用于渲染表格的头部单元格，支持选择状态显示和样式自定义。
 * 集成到 Slate 编辑器中，提供表格编辑功能。
 *
 * @component
 * @description 表格头部单元格组件，渲染表格头部
 * @param {RenderElementProps & {style?: React.CSSProperties}} props - 组件属性
 * @param {Object} props.attributes - 元素属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {Element} props.element - 表格头部元素
 *
 * @example
 * ```tsx
 * <Th
 *   attributes={attributes}
 *   element={headerElement}
 *   style={{ fontWeight: 'bold' }}
 * >
 *   表头内容
 * </Th>
 * ```
 *
 * @returns {React.ReactElement} 渲染的表格头部单元格组件
 *
 * @remarks
 * - 集成 Slate 编辑器
 * - 支持选择状态高亮
 * - 提供自定义样式支持
 * - 类型安全检查
 * - 响应式布局
 */
export const Th: React.FC<
  RenderElementProps & {
    style?: React.CSSProperties;
  }
> = ({ attributes, children, style, element }) => {
  if (element.type !== 'header-cell') {
    throw new Error('Element "Th" must be of type "header-cell"');
  }

  useSlateSelection();
  // 简化的选中状态检查 - 暂时返回 false，后续可以完善
  const selected = false;

  return (
    <th
      style={{
        backgroundColor: selected ? '#bae6fd' : undefined,

        ...style,
      }}
      {...attributes}
    >
      {children}
    </th>
  );
};

// 包装组件，用于在组件内部调用 hooks
const ThWrapper: React.FC<
  RenderElementProps & { style?: React.CSSProperties }
> = (props) => {
  return <Th {...props} />;
};

const TdWrapper: React.FC<
  RenderElementProps & { style?: React.CSSProperties }
> = (props) => {
  const [, path] = useSelStatus(props.element);
  return <Td {...props} cellPath={path} />;
};

const TableCellIndexWrapper: React.FC<{
  targetRow: any;
}> = ({ targetRow }) => {
  const [, path] = useSelStatus(targetRow);
  // 从路径中提取行索引和表格路径
  const rowIndex = path ? path[path.length - 1] : undefined;
  const tablePath = path ? path.slice(0, -1) : undefined;

  return (
    <TableCellIndex
      targetRow={targetRow}
      rowIndex={rowIndex}
      tablePath={tablePath}
    />
  );
};

// 导出组件供测试使用
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
      return (
        <tr {...props.attributes}>
          {config?.readonly ? null : (
            <TableCellIndexWrapper targetRow={props.element} />
          )}
          {props.children}
        </tr>
      );
    case 'header-cell':
      return (
        <ThWrapper
          style={{
            verticalAlign: 'middle',
          }}
          {...props}
        />
      );
    case 'table-cell':
      return (
        <TdWrapper
          style={{
            verticalAlign: 'middle',
          }}
          {...props}
        />
      );
    default:
      return null;
  }
};
