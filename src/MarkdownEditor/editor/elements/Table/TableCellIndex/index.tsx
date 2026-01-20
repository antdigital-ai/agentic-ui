import {
  DeleteOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useRef } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useClickAway } from '../../../../../Hooks/useClickAway';
import { useRefFunction } from '../../../../../Hooks/useRefFunction';
import { NativeTableEditor } from '../../../../utils/native-table';
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
      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      // 获取表格的行数
      const rowCount = tableElement.children?.length || 0;
      if (rowCount === 0) {
        return;
      }

      // 清除所有行的选中状态 - 通过 DOM 操作移除 data-select 属性
      for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const rowElement = tableElement.children[rowIdx];
        if (rowElement && rowElement.children) {
          for (let colIdx = 0; colIdx < rowElement.children.length; colIdx++) {
            const cellPath = [...tablePath, rowIdx, colIdx];
            if (Editor.hasPath(editor, cellPath)) {
              const [cellNode] = Editor.node(editor, cellPath);
              if (cellNode && (cellNode as any).type === 'table-cell') {
                // 通过 DOM 操作移除 data-select 属性
                const domNode = ReactEditor.toDOMNode(editor, cellNode);
                if (domNode) {
                  domNode.removeAttribute('data-select');
                }
              }
            }
          }
        }
      }
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
      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      // 获取表格的行数和列数
      const rowCount = tableElement.children?.length || 0;
      if (rowCount === 0) {
        return;
      }

      clearSelect(false);

      // 选中指定行的所有单元格 - 通过 DOM 操作设置 data-select 属性
      const rowElement = tableElement.children[rowIndex];
      if (rowElement && rowElement.children) {
        for (let colIdx = 0; colIdx < rowElement.children.length; colIdx++) {
          const cellPath = [...tablePath, rowIndex, colIdx];
          if (Editor.hasPath(editor, cellPath)) {
            const [cellNode] = Editor.node(editor, cellPath);
            if (cellNode && (cellNode as any).type === 'table-cell') {
              // 通过 DOM 操作设置 data-select 属性
              const domNode = ReactEditor.toDOMNode(editor, cellNode);
              if (domNode) {
                domNode.setAttribute('data-select', 'true');
              }
            }
          }
        }
      }
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

      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      const rowCount = tableElement.children.length;
      const firstRow = tableElement.children[0] as any;
      const colCount = firstRow.children.length;

      // 检查是否只有一行一列
      if (rowCount <= 1 && colCount <= 1) {
        // 如果只有一行一列，删除整个表格
        NativeTableEditor.removeTable(editor, tablePath);
        return;
      }

      // 检查是否只有一行
      if (rowCount <= 1) {
        // 如果只有一行，删除整个表格
        NativeTableEditor.removeTable(editor, tablePath);
        return;
      }

      // 删除指定行
      const rowPath = [...tablePath, rowIndex];
      if (Editor.hasPath(editor, rowPath)) {
        Transforms.removeNodes(editor, { at: rowPath });
      }

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

      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      const firstRow = tableElement.children[0] as any;
      const colCount = firstRow.children.length;

      // 创建新行
      const newRow = {
        type: 'table-row',
        children: Array.from({ length: colCount }).map(() => ({
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        })),
      };

      // 在当前行之前插入新行
      const rowPath = [...tablePath, rowIndex];
      Transforms.insertNodes(editor, newRow, { at: rowPath });

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

      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      const firstRow = tableElement.children[0] as any;
      const colCount = firstRow.children.length;

      // 创建新行
      const newRow = {
        type: 'table-row',
        children: Array.from({ length: colCount }).map(() => ({
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        })),
      };

      // 在当前行之后插入新行
      // 获取表格的行数来检查边界
      const rowCount = tableElement.children.length;
      const insertRowIndex = Math.min(rowIndex + 1, rowCount);
      const rowPath = [...tablePath, insertRowIndex];
      Transforms.insertNodes(editor, newRow, { at: rowPath });

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
      title={rowIndex !== undefined ? '点击显示操作按钮' : undefined}
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
            title="在上面增加一行"
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
          title="删除整行"
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
            title="在下面增加一行"
          >
            <InsertRowBelowOutlined />
          </div>
        )}
      </div>
    </td>
  );
};
