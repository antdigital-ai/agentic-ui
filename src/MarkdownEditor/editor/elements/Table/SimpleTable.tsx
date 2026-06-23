import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useMemo } from 'react';
import { ReactEditor, RenderElementProps } from 'slate-react';
import { useEditorStore } from '../../store';
import { TableNode } from '../../types/Table';
import { SlateTable } from './Table';
import { TablePropsProvider } from './TableContext';

/**
 * 简单表格组件 - 仅支持只读显示
 * 用于替代复杂的 Handsontable 实现，提供基础的表格功能
 */
export const SimpleTable = (props: RenderElementProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-editor-content-table');
  const { markdownEditorRef } = useEditorStore();

  const tablePath = useMemo(() => {
    const editor = markdownEditorRef.current;
    if (!editor) {
      return [];
    }
    try {
      return ReactEditor.findPath(editor, props.element);
    } catch {
      return [];
    }
  }, [markdownEditorRef, props.element]);

  return (
    <TablePropsProvider
      tablePath={tablePath}
      tableNode={props.element as TableNode}
    >
      <div
        {...props.attributes}
        data-be={'table'}
        draggable={false}
        className={classNames(`${baseCls}-container`)}
        style={{ position: 'relative' }}
      >
        <SlateTable {...props}>{props.children}</SlateTable>
      </div>
    </TablePropsProvider>
  );
};
