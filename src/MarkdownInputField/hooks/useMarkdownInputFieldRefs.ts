import { useEffect, useImperativeHandle, useRef } from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseMarkdownInputFieldRefsParams extends Pick<
  MarkdownInputFieldProps,
  'inputRef' | 'value'
> {
  setValue: (value: string) => void;
}

/**
 * Refs 管理 Hook
 * 管理组件中所有的 refs 和相关逻辑
 */
export const useMarkdownInputFieldRefs = (
  props: UseMarkdownInputFieldRefsParams,
) => {
  const markdownEditorRef = useRef<MarkdownEditorInstance>();
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  // 同步外部 value 到编辑器
  useEffect(() => {
    if (!markdownEditorRef.current) return;
    markdownEditorRef.current?.store?.setMDContent(props.value ?? '');
  }, [props.value]);

  // 通过 ref 暴露编辑器实例，包装 store.setMDContent 以同步 value 状态，确保发送按钮正确响应
  useImperativeHandle(
    props.inputRef,
    (): MarkdownEditorInstance | undefined => {
      const editor = markdownEditorRef.current;

      const syncValueAndSetMDContent = (
        md?: string,
        plugins?: any,
        options?: any,
      ) => {
        if (md !== undefined) {
          props.setValue(md);
        }
        return editor?.store?.setMDContent(md, plugins, options);
      };

      if (!editor) {
        return {
          store: {
            setMDContent: syncValueAndSetMDContent,
          },
        } as unknown as MarkdownEditorInstance;
      }

      return {
        ...editor,
        store: {
          ...editor.store,
          setMDContent: syncValueAndSetMDContent,
        },
      } as MarkdownEditorInstance;
    },
    [props.setValue],
  );

  return {
    markdownEditorRef,
    quickActionsRef,
    actionsRef,
    isSendingRef,
  };
};
