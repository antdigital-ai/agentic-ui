import React from 'react';
import { RenderElementProps } from 'slate-react';

export const InlineKatex = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  return (
    <code
      {...attributes}
      style={{
        display: 'inline-block',
      }}
    >
      {element.value}
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
