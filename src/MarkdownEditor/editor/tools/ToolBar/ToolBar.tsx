import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext } from 'react';
import { BaseToolBar, ToolsKeyType } from './BaseBar';
import { useStyle } from './toolBarStyle';

/**
 * 浮动工具栏,用于设置文本样式
 */
const ToolBar = (props: {
  prefix?: string;
  extra?: React.ReactNode[];
  min?: boolean;
  hideTools?: ToolsKeyType[];
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context?.getPrefixCls(`agentic-md-editor-toolbar`);
  const { hashId } = useStyle(baseClassName);

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={classNames(baseClassName, hashId, props.prefix)}
    >
      <BaseToolBar
        prefix={baseClassName}
        showEditor={true}
        showInsertAction={true}
        hashId={hashId}
        {...props}
      />
    </div>
  );
};

export default React.memo(ToolBar);
