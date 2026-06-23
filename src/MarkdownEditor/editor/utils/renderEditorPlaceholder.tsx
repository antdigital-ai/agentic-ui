import React from 'react';
import type { RenderPlaceholderProps } from 'slate-react';

/** Slate 原生 placeholder 渲染，对齐编辑器设计 token */
export function renderEditorPlaceholder({
  attributes,
  children,
}: RenderPlaceholderProps) {
  return (
    <span
      {...attributes}
      style={{
        ...attributes.style,
        opacity: 1,
        color: 'var(--color-gray-text-disabled, rgba(20, 22, 28, 0.25))',
        fontSize: '1em',
        lineHeight: '21px',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
      }}
    >
      {children}
    </span>
  );
}
