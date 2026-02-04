import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Hr = ({ attributes, children }: RenderElementProps) => {
  return (
    <div
      {...attributes}
      data-be="hr"
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
