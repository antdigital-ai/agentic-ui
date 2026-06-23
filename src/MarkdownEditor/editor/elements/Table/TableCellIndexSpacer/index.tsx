import {
  DeleteOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useRef } from 'react';
import { useClickAway } from '../../../../../Hooks/useClickAway';
import { useRefFunction } from '../../../../../Hooks/useRefFunction';
import { I18nContext } from '../../../../../I18n';
import { useEditorStore } from '../../../store';
import {
  clearTableSelection,
  insertTableColumn,
  removeTableColumn,
  selectTableColumn,
  selectWholeTable,
} from '../commands/tableCommands';
import {
  useSetTableChromePosition,
  useTableColumnChromeActive,
} from '../TableContext';

/**
 * TableCellIndexSpacer 组件的属性接口
 */
export interface TableCellIndexSpacerProps {
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 单元格的唯一标识 */
  key?: React.Key;
  /** 列索引，用于选中整列 */
  columnIndex?: number;
  /** 表格路径，用于定位表格元素 */
  tablePath?: number[];
}

/**
 * TableCellIndexSpacer 组件 - 表格索引间隔单元格组件
 *
 * 该组件用于渲染表格行索引中的间隔单元格，用于占位和布局。
 * 使用 context 来生成 className，支持样式自定义。
 *
 * @component
 * @description 表格索引间隔单元格组件，用于占位和布局
 * @param {TableCellIndexSpacerProps} props - 组件属性
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.className] - 自定义类名
 * @param {React.Key} [props.key] - 单元格的唯一标识
 * @param {number} [props.columnIndex] - 列索引，用于选中整列
 * @param {number[]} [props.tablePath] - 表格路径，用于定位表格元素
 *
 * @example
 * ```tsx
 * <TableCellIndexSpacer
 *   style={{ backgroundColor: '#f5f5f5' }}
 *   className="custom-spacer-cell"
 *   key={0}
 *   columnIndex={1}
 *   tablePath={[0, 2]}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的表格索引间隔单元格组件
 *
 * @remarks
 * - 使用 ConfigProvider context 生成 className
 * - 支持自定义样式覆盖
 * - 不可编辑状态
 * - 用于占位和布局
 * - 支持点击选中整列功能
 */
export const TableCellIndexSpacer: React.FC<TableCellIndexSpacerProps> = memo(({
  style,
  className,
  columnIndex,
  tablePath,
}) => {
  const { locale } = useContext(I18nContext);
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(
    'agentic-md-editor-table-cell-index-spacer',
  );
  const { markdownEditorRef } = useEditorStore();
  const setDeleteIconPosition = useSetTableChromePosition();
  const shouldShowDeleteIcon = useTableColumnChromeActive(columnIndex);
  const isSelectWholeTable = columnIndex === -1;
  const actionColumnIndex = isSelectWholeTable ? 0 : columnIndex;

  const clearSelect = useRefFunction((clearIcon = true) => {
    if (clearIcon) {
      setDeleteIconPosition(null);
    }
    if (!tablePath) return;
    const editor = markdownEditorRef.current;
    if (!editor) return;
    clearTableSelection(editor, tablePath);
  });

  /**
   * 处理点击事件，选中整列或显示删除图标
   */
  const handleClick = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果提供了列索引，显示删除图标
    if (columnIndex !== undefined) {
      setDeleteIconPosition({
        columnIndex,
      });
    }

    if (columnIndex === undefined || !tablePath) {
      return;
    }

    try {
      clearSelect(false);
      const editor = markdownEditorRef.current;
      if (!editor) return;
      if (isSelectWholeTable) {
        selectWholeTable(editor, tablePath);
        return;
      }

      selectTableColumn(editor, tablePath, columnIndex);
    } catch (error) {
      console.warn('Failed to select table column:', error);
    }
  });

  /**
   * 处理删除图标点击事件
   */
  const handleDeleteClick = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || actionColumnIndex === undefined) {
        return;
      }
      const editor = markdownEditorRef.current;
      if (!editor) return;
      removeTableColumn(editor, tablePath, actionColumnIndex);
      clearSelect();
    } catch (error) {
      console.warn('Failed to delete table column:', error);
    }
  });

  /**
   * 处理在前面增加一列点击事件
   */
  const handleInsertColumnBefore = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || actionColumnIndex === undefined) {
        return;
      }
      const editor = markdownEditorRef.current;
      if (!editor) return;
      insertTableColumn(editor, tablePath, actionColumnIndex, 'before');
      clearSelect();
    } catch (error) {
      console.warn('Failed to insert column before:', error);
    }
  });

  /**
   * 处理在后面增加一列点击事件
   */
  const handleInsertColumnAfter = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!tablePath || actionColumnIndex === undefined) {
        return;
      }
      const editor = markdownEditorRef.current;
      if (!editor) return;
      insertTableColumn(editor, tablePath, actionColumnIndex, 'after');
      clearSelect();
    } catch (error) {
      console.warn('Failed to insert column after:', error);
    }
  });

  const ref = useRef<HTMLTableDataCellElement>(null);

  useClickAway(() => {
    if (shouldShowDeleteIcon) {
      clearSelect();
    }
  }, ref);

  const shouldShowInsertButtons = shouldShowDeleteIcon;

  const stopEditorMouseDown = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  });

  return (
    <td
      ref={ref}
      className={classNames(baseClassName, className, 'config-td')}
      contentEditable={false}
      style={{
        cursor: columnIndex !== undefined ? 'pointer' : 'default',
        padding: 0,
        position: 'relative',
        backgroundColor: shouldShowDeleteIcon
          ? 'var(--color-primary-control-fill-primary-active)'
          : undefined,
        ...style,
      }}
      onClick={handleClick}
      onMouseDown={stopEditorMouseDown}
      title={
        columnIndex !== undefined
          ? columnIndex === -1
            ? locale?.['table.clickToSelectTable'] || '点击选中整个表格'
            : locale?.['table.clickToSelectColumn'] ||
              '点击选中整列，显示操作按钮'
          : undefined
      }
    >
      <div
        className={classNames(
          `${baseClassName}-action-buttons`,
          shouldShowDeleteIcon && `${baseClassName}-action-buttons-visible`,
        )}
      >
        {/* 总是显示增加列的按钮 */}
        {shouldShowInsertButtons && (
          <div
            className={classNames(
              `${baseClassName}-action-button`,
              `${baseClassName}-insert-column-before`,
            )}
            onClick={handleInsertColumnBefore}
            onMouseDown={stopEditorMouseDown}
            title={locale?.['table.insertColumnBefore'] || '在前面增加一列'}
          >
            <InsertRowLeftOutlined />
          </div>
        )}
        <div
          className={classNames(
            `${baseClassName}-action-button`,
            `${baseClassName}-delete-icon`,
          )}
          onClick={handleDeleteClick}
          onMouseDown={stopEditorMouseDown}
          title={locale?.['table.deleteColumn'] || '删除整列'}
        >
          <DeleteOutlined />
        </div>
        {/* 总是显示增加列的按钮 */}
        {shouldShowInsertButtons && (
          <div
            className={classNames(
              `${baseClassName}-action-button`,
              `${baseClassName}-insert-column-after`,
            )}
            onClick={handleInsertColumnAfter}
            onMouseDown={stopEditorMouseDown}
            title={locale?.['table.insertColumnAfter'] || '在后面增加一列'}
          >
            <InsertRowRightOutlined />
          </div>
        )}
      </div>
    </td>
  );
});

TableCellIndexSpacer.displayName = 'TableCellIndexSpacer';
