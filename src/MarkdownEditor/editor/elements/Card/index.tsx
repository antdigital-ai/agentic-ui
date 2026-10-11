import React from 'react';
import { RenderElementProps } from 'slate-react';
import { useElementSelected } from '../../../../MarkdownEditor/hooks/editor';
import { useEditorStore } from '../../store';

const EditableCard = React.memo(function EditableCard(
  props: RenderElementProps,
) {
  const selected = useElementSelected(props.element);
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

export const WarpCard = React.memo(function WarpCard(
  props: RenderElementProps,
) {
  const { readonly } = useEditorStore();
  if (readonly) {
    return (
      <div {...props.attributes} data-be="card" role="button">
        {props.children}
      </div>
    );
  }
  return <EditableCard {...props} />;
});
