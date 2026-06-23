import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext } from 'react';
import { RenderElementProps } from 'slate-react';
import { isSameTableCellRenderProps } from '../utils/tableCellMemo';

/**
 * Td 组件的属性接口
 */
export interface TdProps extends RenderElementProps {
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * Td 组件 - 表格数据单元格组件
 */
const TdComponent: React.FC<TdProps> = ({
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
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefix = getPrefixCls('agentic-md-editor-table-td');

  const handleRef = (node: HTMLTableDataCellElement | null) => {
    if (attributes?.ref) {
      if (typeof attributes.ref === 'function') {
        attributes.ref(node);
      }
    }
  };

  if (element.hidden) {
    return (
      <td
        className={classNames(prefix)}
        style={{ display: 'none' }}
        ref={handleRef}
      />
    );
  }

  return (
    <td
      className={classNames(prefix)}
      style={{
        textAlign: align || 'left',
        width: width || 'auto',
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

export const Td = memo(TdComponent, isSameTableCellRenderProps);

Td.displayName = 'Td';
