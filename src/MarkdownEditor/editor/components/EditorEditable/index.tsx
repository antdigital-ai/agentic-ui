import type { ComponentProps } from 'react';
import React, { useCallback, useContext, useRef } from 'react';
import type { Node } from 'slate';
import { Editable, useSlateSelector } from 'slate-react';
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
  const placeholderBlock = useRef<{ node: Node; eligible: boolean } | null>(
    null,
  );
  const selectPlaceholder = useCallback(
    (editor: Parameters<typeof canUseSlateNativePlaceholder>[0]) => {
      if (editor.children.length !== 1) return false;
      const node = editor.children[0];
      const cached = placeholderBlock.current;
      if (cached && cached.node === node) return cached.eligible;
      const eligible = canUseSlateNativePlaceholder(editor);
      placeholderBlock.current = { node, eligible };
      return eligible;
    },
    [],
  );
  const canShowPlaceholder = useSlateSelector(selectPlaceholder);
  const { locale } = useContext(I18nContext);
  const { editorProps, readonly } = useEditorStore();

  const placeholderText = resolveEditorPlaceholderFromProps(
    editorProps,
    locale?.inputPlaceholder,
  );

  const placeholder =
    !readonly && !suppressPlaceholder && canShowPlaceholder
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
