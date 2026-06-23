import type { ComponentProps } from 'react';
import React, { useContext } from 'react';
import { Editable, useSlate } from 'slate-react';
import { I18nContext } from '../../../../I18n';
import { useEditorStore } from '../../store';
import { canUseSlateNativePlaceholder } from '../../utils/canUseSlateNativePlaceholder';
import { renderEditorPlaceholder } from '../../utils/renderEditorPlaceholder';
import { resolveEditorPlaceholderFromProps } from '../../utils/resolveEditorPlaceholder';

export type EditorEditableProps = Omit<
  ComponentProps<typeof Editable>,
  'placeholder' | 'renderPlaceholder'
> & {
  /** 中文等 IME 组合输入期间隐藏 Slate placeholder */
  suppressPlaceholder?: boolean;
};

export function EditorEditable(props: EditorEditableProps) {
  const { suppressPlaceholder = false, ...editableProps } = props;
  const editor = useSlate();
  const { locale } = useContext(I18nContext);
  const { editorProps, readonly } = useEditorStore();

  const placeholderText = resolveEditorPlaceholderFromProps(
    editorProps,
    locale?.inputPlaceholder,
  );

  const placeholder =
    !readonly &&
    !suppressPlaceholder &&
    canUseSlateNativePlaceholder(editor)
      ? placeholderText
      : undefined;

  return (
    <Editable
      {...editableProps}
      placeholder={placeholder}
      renderPlaceholder={renderEditorPlaceholder}
    />
  );
}
