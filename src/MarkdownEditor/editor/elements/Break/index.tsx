import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Break = ({ attributes, children }: RenderElementProps) => {
  return (
    <span {...attributes} contentEditable={false}>
      {children}
      <br />
    </span>
  );
};
