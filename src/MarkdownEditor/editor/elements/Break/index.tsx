import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';

export const Break = ({ attributes, children }: RenderElementProps) => {
  debugInfo('Break - 渲染换行');
  return (
    <span {...attributes} contentEditable={false}>
      {children}
      <br />
    </span>
  );
};
