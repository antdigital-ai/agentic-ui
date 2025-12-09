import React from 'react';
import { RenderElementProps, useSlate } from 'slate-react';
import { useSelStatus } from '../../../../MarkdownEditor/hooks/editor';
import { debugInfo } from '../../../../Utils/debugUtils';
import { useEditorStore } from '../../store';

export const WarpCard = (props: RenderElementProps) => {
  debugInfo('WarpCard - 渲染卡片', {
    block: props.element.block,
    childrenCount: props.element.children?.length,
  });
  const [selected, path] = useSelStatus(props.element);
  const editor = useSlate();
  const { readonly } = useEditorStore();

  return React.useMemo(() => {
    debugInfo('WarpCard - useMemo 渲染', {
      readonly,
      selected,
      block: props.element.block,
    });
    if (readonly) {
      return (
        <div {...props.attributes} data-be={'card'} role="button">
          {props.children}
        </div>
      );
    }
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
  }, [props.element.children, selected, path, props.element.block, editor]);
};
