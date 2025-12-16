import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { useStyle } from './style';

export const Mermaid = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  debugInfo('Mermaid - 渲染 Mermaid 图表', {
    hasError: element?.otherProps?.error === true,
    valueLength: element?.value?.length,
  });
  const context = useContext(ConfigProvider.ConfigContext);
  const baseCls = context?.getPrefixCls('agentic-md-editor-mermaid');
  const { wrapSSR, hashId } = useStyle(baseCls);
  const hasError = element?.otherProps?.error === true;

  return wrapSSR(
    <pre
      {...attributes}
      className={classNames(baseCls, hashId, {
        [`${baseCls}-error`]: hasError,
      })}
    >
      <code>{children}</code>
    </pre>,
  );
};
