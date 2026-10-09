import React from 'react';
import { RenderElementProps } from 'slate-react';
import { useSelStatus } from '../../../../MarkdownEditor/hooks/editor';
import { useEditorStore } from '../../store';

export const WarpCard = React.memo(function WarpCard(
  props: RenderElementProps,
) {
  const [selected] = useSelStatus(props.element);
  const { readonly } = useEditorStore();

  if (readonly) {
    return (
      <div {...props.attributes} data-be={'card'} role="button">
        {props.children}
      </div>
    );
  }
  // Slate replaces children and attributes when descendants change. Caching
  // this subtree by card metadata hides media edits and retains removed nodes.
  return (
    <div
      {...props.attributes}
      data-be={'card'}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      aria-label="可选择的卡片元素"
      style={{
        ...props.element.style,
        display: props.element.block === false ? 'inline-flex' : 'flex',
        maxWidth: '100%',
        alignItems: 'flex-end',
        outline: 'none',
        position: 'relative',
        width: 'max-content',
      }}
    >
      {props.children}
    </div>
  );
});
