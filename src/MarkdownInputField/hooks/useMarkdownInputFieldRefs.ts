import { useEffect, useImperativeHandle, useRef } from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

/**
 * Refs 管理 Hook
 * 管理组件中所有的 refs 和相关逻辑
 */
export const useMarkdownInputFieldRefs = (
  props: Pick<MarkdownInputFieldProps, 'inputRef' | 'value'>,
  value: string,
) => {
  const markdownEditorRef = useRef<MarkdownEditorInstance>();
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  // 同步外部 value 到编辑器
  useEffect(() => {
    if (!markdownEditorRef.current) return;
    markdownEditorRef.current?.store?.setMDContent(value);
  }, [props.value]);

  // 通过 ref 暴露编辑器实例
  useImperativeHandle(props.inputRef, () => markdownEditorRef.current);

  return {
    markdownEditorRef,
    quickActionsRef,
    actionsRef,
    isSendingRef,
  };
};
