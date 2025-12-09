import React from 'react';
import { debugInfo } from '../../../../Utils/debugUtils';
import { RenderElementProps } from 'slate-react';

export const Break = ({ attributes, children }: RenderElementProps) => {
  debugInfo('Break - 渲染换行');
  return (
    <span {...attributes} contentEditable={false}>
      {children}
      <br />
    </span>
  );
};
