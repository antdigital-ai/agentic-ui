import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { getSlateElementPlainText } from '../../utils/codeBlockPlainText';

export const InlineKatex = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  debugInfo('InlineKatex - 渲染内联数学公式', {
    value: element?.value?.substring(0, 50),
  });
  return (
    <code
      {...attributes}
      style={{
        display: 'inline-block',
      }}
    >
      {getSlateElementPlainText(element)}
      <div
        style={{
          display: 'none',
        }}
      >
        {children}
      </div>
    </code>
  );
};
