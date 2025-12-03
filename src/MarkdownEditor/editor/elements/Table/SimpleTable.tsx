import { ConfigProvider, Skeleton } from 'antd';
import classNames from 'classnames';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { TableNode } from '../../types/Table';
import { useTableStyle } from './style';
import { SlateTable } from './Table';
import { TablePropsProvider } from './TableContext';

/**
 * 简单表格组件 - 仅支持只读显示
 * 用于替代复杂的 Handsontable 实现，提供基础的表格功能
 */
export const SimpleTable = (props: RenderElementProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-editor-content-table');
  const editor = useSlate();
  const { wrapSSR, hashId } = useTableStyle(baseCls, {});
  const [showAsText, setShowAsText] = useState(false);
  const tableNode = props.element as TableNode;

  const tablePath = useMemo(
    () => ReactEditor.findPath(editor, props.element),
    [props.element],
  );

  // 如果 finished 为 false，设置 5 秒超时，超时后显示为文本
  useEffect(() => {
    if (tableNode.finished === false) {
      setShowAsText(false);
      const timer = setTimeout(() => {
        setShowAsText(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowAsText(false);
    }
  }, [tableNode.finished]);

  // 如果是不完整状态
  if (tableNode.finished === false) {
    // 如果 5 秒后仍未完成，显示为文本
    if (showAsText) {
      return (
        <div {...props.attributes}>
          <div
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              color: 'rgba(0, 0, 0, 0.65)',
              wordBreak: 'break-all',
            }}
          >
            表格链接
          </div>
          {props.children}
        </div>
      );
    }
    // 5 秒内显示加载骨架屏
    return (
      <div {...props.attributes}>
        <Skeleton active paragraph={{ rows: 3 }} />
        {props.children}
      </div>
    );
  }

  return wrapSSR(
    <TablePropsProvider
      tablePath={tablePath}
      tableNode={props.element as TableNode}
    >
      <div
        {...props.attributes}
        data-be={'table'}
        draggable={false}
        className={classNames(`${baseCls}-container`, hashId)}
        style={{ position: 'relative' }}
      >
        <SlateTable {...props} hashId={hashId}>
          {props.children}
        </SlateTable>
      </div>
    </TablePropsProvider>,
  );
};
