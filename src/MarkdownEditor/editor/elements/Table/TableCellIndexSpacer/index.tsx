import {
  DeleteOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
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
export const TableCellIndexSpacer: React.FC<TableCellIndexSpacerProps> = ({
  style,
  className,
  columnIndex,
  tablePath,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(
    'agentic-md-editor-table-cell-index-spacer',
  );
  const editor = useSlate();
  const tableContext = useContext(TablePropsContext);

  const { deleteIconPosition, setDeleteIconPosition } = tableContext;

  const clearSelect = useRefFunction((clearIcon = true) => {
    if (clearIcon) {
      setDeleteIconPosition?.(null);
    }
    if (!tablePath) return;
    const tableElement = Editor.node(editor, tablePath)[0] as any;
    if (!tableElement || tableElement.type !== 'table') return;
    const rowCount = tableElement.children?.length || 0;
    if (rowCount === 0) return;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowElement = tableElement.children[rowIndex];
      if (rowElement && rowElement.children) {
        for (
          let colIndex = 0;
          colIndex < rowElement.children.length;
          colIndex++
        ) {
          const cellPath = [...tablePath, rowIndex, colIndex];
          if (Editor.hasPath(editor, cellPath)) {
            const [cellNode] = Editor.node(editor, cellPath);
            if (cellNode && (cellNode as any).type === 'table-cell') {
              const domNode = ReactEditor.toDOMNode(editor, cellNode);
              if (domNode) {
                domNode.removeAttribute('data-select');
              }
            }
          }
        }
      }
    }
  });

  /**
   * 处理点击事件，选中整列或显示删除图标
   */
  const handleClick = useRefFunction((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果提供了列索引，显示删除图标
    setDeleteIconPosition?.({
      columnIndex: columnIndex,
    });

    if (columnIndex === undefined || !tablePath) {
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

      // 根据 columnIndex 的值决定选中逻辑
      if (columnIndex === -1) {
        // 选中所有单元格 - 只使用 DOM 操作
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
          const rowElement = tableElement.children[rowIndex];
          if (rowElement && rowElement.children) {
            for (
              let colIndex = 0;
              colIndex < rowElement.children.length;
              colIndex++
            ) {
              const cellPath = [...tablePath, rowIndex, colIndex];
              if (Editor.hasPath(editor, cellPath)) {
                const [cellNode] = Editor.node(editor, cellPath);
                if (cellNode && (cellNode as any).type === 'table-cell') {
                  // 只使用 DOM 操作设置 data-select 属性
                  const domNode = ReactEditor.toDOMNode(editor, cellNode);
                  if (domNode) {
                    domNode.setAttribute('data-select', 'true');
                  }
                }
              }
            }
          }
        }
        return;
      }
      clearSelect(false);
      // 选中指定列的所有单元格 - 只使用 DOM 操作
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cellPath = [...tablePath, rowIndex, columnIndex];
        if (Editor.hasPath(editor, cellPath)) {
          const [cellNode] = Editor.node(editor, cellPath);
          if (cellNode && (cellNode as any).type === 'table-cell') {
            // 只使用 DOM 操作设置 data-select 属性
            const domNode = ReactEditor.toDOMNode(editor, cellNode);
            if (domNode) {
              domNode.setAttribute('data-select', 'true');
            }
          }
        }
      }
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
      if (!tablePath || columnIndex === undefined) {
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

      // 检查是否只有一列
      if (colCount <= 1) {
        // 如果只有一列，删除整个表格
        NativeTableEditor.removeTable(editor, tablePath);
        return;
      }

      // 删除每一行的指定列
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cellPath = [...tablePath, rowIndex, columnIndex];
        if (Editor.hasPath(editor, cellPath)) {
          Transforms.removeNodes(editor, { at: cellPath });
        }
      }

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
      if (!tablePath || columnIndex === undefined) {
        return;
      }

      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      const rowCount = tableElement.children.length;

      // 为每一行在当前列之前插入新单元格
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cellPath = [...tablePath, rowIndex, columnIndex];
        const newCell = {
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        };

        Transforms.insertNodes(editor, newCell, { at: cellPath });
      }

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
      if (!tablePath || columnIndex === undefined) {
        return;
      }

      // 获取表格元素
      const tableElement = Editor.node(editor, tablePath)[0] as any;
      if (!tableElement || tableElement.type !== 'table') {
        return;
      }

      const rowCount = tableElement.children.length;

      // 为每一行在当前列之后插入新单元格
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cellPath = [...tablePath, rowIndex, columnIndex + 1];
        const newCell = {
          type: 'table-cell',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
            },
          ],
        };

        Transforms.insertNodes(editor, newCell, { at: cellPath });
      }

      clearSelect();
    } catch (error) {
      console.warn('Failed to insert column after:', error);
    }
  });

  const ref = useRef<HTMLTableDataCellElement>(null);

  useClickAway(() => {
    if (deleteIconPosition && deleteIconPosition.columnIndex === columnIndex) {
      clearSelect();
    }
  }, ref);

  // 检查是否应该显示删除图标
  const shouldShowDeleteIcon =
    deleteIconPosition && deleteIconPosition.columnIndex === columnIndex;

  // 判断是否应该显示增加列的按钮（总是显示）
  const shouldShowInsertButtons = shouldShowDeleteIcon;

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
      title={
        columnIndex !== undefined
          ? columnIndex === -1
            ? '点击选中整个表格'
            : '点击选中整列，显示操作按钮'
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
            title="在前面增加一列"
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
          title="删除整列"
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
            title="在后面增加一列"
          >
            <InsertRowRightOutlined />
          </div>
        )}
      </div>
    </td>
  );
};
