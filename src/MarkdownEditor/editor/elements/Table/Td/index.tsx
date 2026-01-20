import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useRef } from 'react';
import { RenderElementProps, useSlateSelection } from 'slate-react';

/**
 * Td 组件的属性接口
 */
export interface TdProps extends RenderElementProps {
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 单元格路径 */
  cellPath?: number[];
}

/**
 * Td 组件 - 表格数据单元格组件
 *
 * 该组件用于渲染表格的数据单元格，支持选择状态、对齐方式、宽度设置等功能。
 * 集成到 Slate 编辑器中，提供表格编辑功能。
 *
 * @component
 * @description 表格数据单元格组件，渲染表格数据
 * @param {TdProps} props - 组件属性
 * @param {Object} props.attributes - 元素属性
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {Element} props.element - 表格数据元素
 * @param {number[]} [props.cellPath] - 单元格路径
 *
 * @example
 * ```tsx
 * <Td
 *   attributes={attributes}
 *   element={dataElement}
 *   style={{ textAlign: 'center' }}
 *   cellPath={[0, 1]}
 * >
 *   单元格内容
 * </Td>
 * ```
 *
 * @returns {React.ReactElement} 渲染的表格数据单元格组件
 *
 * @remarks
 * - 集成 Slate 编辑器
 * - 支持选择状态高亮
 * - 支持单元格对齐方式
 * - 支持单元格宽度设置
 * - 支持行合并和列合并
 * - 支持隐藏单元格
 * - 提供文本溢出处理
 * - 类型安全检查
 */
export const Td: React.FC<TdProps> = ({
  attributes,
  children,
  style,
  element,
}) => {
  if (element.type !== 'table-cell') {
    throw new Error('Element "Td" must be of type "table-cell"');
  }

  const align = element?.align;
  const width = element?.width;
  useSlateSelection();
  // 根据节点的 select 属性判断是否被选中
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefix = getPrefixCls('agentic-md-editor-table-td');
  const tdRef = useRef<HTMLTableDataCellElement | null>(null);

  // 创建 ref 回调函数来处理 ref 冲突
  const handleRef = (node: HTMLTableDataCellElement | null) => {
    tdRef.current = node;
    if (attributes?.ref) {
      if (typeof attributes.ref === 'function') {
        attributes.ref(node);
      }
    }
  };

  if (element.hidden) {
    return (
      <td
        ref={tdRef}
        className={classNames(prefix)}
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <td
      className={classNames(prefix)}
      style={{
        textAlign: align || 'left', // 默认左对齐
        width: width || 'auto', // 如果有指定宽度则使用，否则自动
        ...style,
      }}
      rowSpan={element?.rowSpan}
      colSpan={element?.colSpan}
      {...attributes}
      ref={handleRef}
    >
      {children}
    </td>
  );
};
