import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { TableCellIndexSpacer } from '../TableCellIndexSpacer';

/**
 * TableRowIndex 组件的属性接口
 */
export interface TableRowIndexProps {
  /** 列宽度数组 */
  colWidths?: number[];
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 表格路径，用于定位表格元素 */
  tablePath?: number[];
}

/**
 * TableRowIndex 组件 - 表格行索引组件
 *
 * 该组件用于渲染表格的行索引行，包含索引单元格和列间隔单元格。
 * 使用 context 来生成 className，支持样式自定义。
 *
 * @component
 * @description 表格行索引组件，用于显示行索引和列间隔
 * @param {TableRowIndexProps} props - 组件属性
 * @param {number[]} [props.colWidths] - 列宽度数组
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义类名
 * @param {number[]} [props.tablePath] - 表格路径，用于定位表格元素
 *
 * @example
 * ```tsx
 * <TableRowIndex
 *   colWidths={[100, 150, 200]}
 *   style={{ backgroundColor: '#f5f5f5' }}
 *   className="custom-row-index"
 *   tablePath={[0, 2]}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的表格行索引组件
 *
 * @remarks
 * - 使用 ConfigProvider context 生成 className
 * - 支持自定义样式覆盖
 * - 根据列宽度数组生成对应的间隔单元格
 * - 包含行索引单元格和列间隔单元格
 */
export const TableRowIndex: React.FC<TableRowIndexProps> = ({
  colWidths = [],
  style,
  className,
  tablePath,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(
    'agentic-md-editor-table-row-index',
  );

  return (
    <tr
      className={classNames(baseClassName, className, 'config-tr')}
      style={style}
    >
      <TableCellIndexSpacer
        style={{
          height: 12,
          width: 12,
          minHeight: 12,
          maxHeight: 12,
          padding: 0,
        }}
        columnIndex={-1}
        key={-1}
        tablePath={tablePath}
      />
      {colWidths.map((_: number, index: number) => (
        <TableCellIndexSpacer
          key={index}
          columnIndex={index}
          tablePath={tablePath}
        />
      ))}
    </tr>
  );
};
