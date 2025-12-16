import React from 'react';
import { RenderElementProps } from 'slate-react';
import { debugInfo } from '../../../../Utils/debugUtils';

export const Hr = ({ attributes, children }: RenderElementProps) => {
  debugInfo('Hr - 渲染分割线');
  return (
    <div
      {...attributes}
      contentEditable={false}
      className={'select-none'}
      style={{
        height: '1px',
        backgroundColor: 'rgb(229 231 235 / 1)',
        margin: '2em 0',
        border: 'none',
      }}
    >
      {children}
    </div>
  );
};
