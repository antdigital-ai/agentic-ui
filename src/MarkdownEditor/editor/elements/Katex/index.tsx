import React from 'react';
import { RenderElementProps } from 'slate-react';

export const Katex = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  return (
    <pre
      {...attributes}
      style={{
        background: 'rgb(242, 241, 241)',
        color: 'rgb(27, 27, 27)',
        padding: '1em',
        borderRadius: '0.5em',
        margin: '1em 0',
        fontSize: '0.8em',
        fontFamily: 'monospace',
        lineHeight: '1.5',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        wordWrap: 'break-word',
      }}
    >
      <code>{element.value}</code>
      <div
        style={{
          display: 'none',
        }}
      >
        {children}
      </div>
    </pre>
  );
};
