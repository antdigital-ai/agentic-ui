import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { RenderElementProps } from 'slate-react';

export const Mermaid = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-mermaid');
  const hasError = element?.otherProps?.error === true;

  return (
    <pre
      {...attributes}
      className={classNames(baseCls, {
        [`${baseCls}-error`]: hasError,
      })}
    >
      <code>{children}</code>
    </pre>
  );
};
