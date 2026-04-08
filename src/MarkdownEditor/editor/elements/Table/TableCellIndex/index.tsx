import {
  DeleteOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useRef } from 'react';
import { useSlate } from 'slate-react';
import { useClickAway } from '../../../../../Hooks/useClickAway';
import { useRefFunction } from '../../../../../Hooks/useRefFunction';
import { I18nContext } from '../../../../../I18n';
import {
  clearTableSelection,
  insertTableRow,
  removeTableRow,
  selectTableRow,
} from '../commands/tableCommands';
import { TablePropsContext } from '../TableContext';

/**
 * TableCellIndex 组件的属性接口
 */
export interface TableCellIndexProps {
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 目标行元素 */
  targetRow: any;
  /** 行索引，用于选中整行 */
  rowIndex?: number;
  /** 表格路径，用于定位表格元素 */
  tablePath?: number[];
}

/**
 * TableCellIndex 组件 - 表格行索引单元格组件
 *
 * 该组件用于渲染表格行的索引单元格，显示行号或索引信息。
 * 使用 context 来生成 className，支持样式自定义。
 *
 * @component
 * @description 表格行索引单元格组件，用于显示行索引
 * @param {TableCellIndexProps} props - 组件属性
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义类名
 * @param {any} props.targetRow - 目标行元素
 * @param {number} [props.rowIndex] - 行索引，用于选中整行
 * @param {number[]} [props.tablePath] - 表格路径，用于定位表格元素
 *
 * @example
 * ```tsx
 * <TableCellIndex
 *   style={{ backgroundColor: '#f5f5f5' }}
 *   className="custom-index-cell"
 *   targetRow={rowElement}
 *   rowIndex={0}
 *   tablePath={[0]}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的表格索引单元格组件
 *
 * @remarks
 * - 使用 ConfigProvider context 生成 className
 * - 支持自定义样式覆盖
 * - 不可编辑状态
 * - 固定宽度和垂直对齐
 * - 支持点击选中整行功能
 */
export const TableCellIndex: React.FC<TableCellIndexProps> = ({
  style,
  className,
  rowIndex,
  tablePath,
}) => {
  const { locale } = useContext(I18nContext);
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(
    'agentic-md-editor-table-cell-index',
  );
  const editor = useSlate();
  const tableContext = useContext(TablePropsContext);

  const { deleteIconPosition, setDeleteIconPosition } = tableContext;

  /**
   * 清除表格中所有单元格的选中状态
   */

  const clearSelect = useRefFunction((clearIcon = true) => {
    if (clearIcon) {
      setDeleteIconPosition?.(null);
    }
    if (!tablePath) {
      return;
    }

    try {
      clearTableSelection(editor, tablePath);
    } catch (error) {
      console.warn('Failed to clear table selection:', error);
    }
  });

  /**
   * 处理点击事件，选中整行或显示删除图标
   */
  const handleClick = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果提供了行索引，显示删除图标
    if (rowIndex !== undefined) {
      setDeleteIconPosition?.({
        rowIndex: rowIndex,
        columnIndex: undefined,
      });
    }

    if (rowIndex === undefined || !tablePath) {
      return;
    }

    try {
      clearSelect(false);
      selectTableRow(editor, tablePath, rowIndex);
    } catch (error) {
      console.warn('Failed to select table row:', error);
    }
  });

  /**
   * 处理删除图标点击事件
   */
  const handleDeleteClick = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || rowIndex === undefined) {
        return;
      }
      removeTableRow(editor, tablePath, rowIndex);
      clearSelect();
    } catch (error) {
      console.warn('Failed to delete table row:', error);
    }
  });

  /**
   * 处理在前面增加一行点击事件
   */
  const handleInsertRowBefore = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || rowIndex === undefined) {
        return;
      }
      insertTableRow(editor, tablePath, rowIndex, 'before');
      clearSelect();
    } catch (error) {
      console.warn('Failed to insert row before:', error);
    }
  });

  /**
   * 处理在后面增加一行点击事件
   */
  const handleInsertRowAfter = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || rowIndex === undefined) {
        return;
      }
      insertTableRow(editor, tablePath, rowIndex, 'after');
      clearSelect();
    } catch (error) {
      console.warn('Failed to insert row after:', error);
    }
  });

  const ref = useRef<HTMLTableDataCellElement>(null);

  // 检查是否应该显示删除图标
  const shouldShowDeleteIcon =
    deleteIconPosition &&
    deleteIconPosition.rowIndex === rowIndex &&
    deleteIconPosition.columnIndex === undefined;

  useClickAway(() => {
    if (
      shouldShowDeleteIcon &&
      deleteIconPosition &&
      deleteIconPosition.rowIndex === rowIndex
    ) {
      clearSelect();
    }
  }, ref);

  return (
    <td
      ref={ref}
      className={classNames(baseClassName, className, 'config-td')}
      contentEditable={false}
      style={{
        padding: 0,
        cursor: rowIndex !== undefined ? 'pointer' : 'default',
        position: 'relative',
        backgroundColor: shouldShowDeleteIcon
          ? 'var(--color-primary-control-fill-primary-active)'
          : undefined,
        ...style,
      }}
      onClick={handleClick}
      title={
        rowIndex !== undefined
          ? locale?.['table.clickToShowActions'] || '点击显示操作按钮'
          : undefined
      }
    >
      <div
        className={classNames(
          `${baseClassName}-action-buttons`,
          shouldShowDeleteIcon && `${baseClassName}-action-buttons-visible`,
        )}
      >
        {/* 在上面插入一行 */}
        {shouldShowDeleteIcon && (
          <div
            className={classNames(
              `${baseClassName}-action-button`,
              `${baseClassName}-insert-row-before`,
            )}
            onClick={handleInsertRowBefore}
            title={locale?.['table.insertRowBefore'] || '在上面增加一行'}
          >
            <InsertRowAboveOutlined />
          </div>
        )}
        <div
          className={classNames(
            `${baseClassName}-action-button`,
            `${baseClassName}-delete-icon`,
          )}
          onClick={handleDeleteClick}
          title={locale?.['table.deleteRow'] || '删除整行'}
        >
          <DeleteOutlined />
        </div>
        {/* 在下面插入一行 */}
        {shouldShowDeleteIcon && (
          <div
            className={classNames(
              `${baseClassName}-action-button`,
              `${baseClassName}-insert-row-after`,
            )}
            onClick={handleInsertRowAfter}
            title={locale?.['table.insertRowAfter'] || '在下面增加一行'}
          >
            <InsertRowBelowOutlined />
          </div>
        )}
      </div>
    </td>
  );
};
