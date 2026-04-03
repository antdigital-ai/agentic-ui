import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
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

  /**
   * Tracks the last value emitted by the editor's own onChange callback.
   * When props.value matches this ref we know the update originated from the
   * editor itself and there is no need to call setMDContent — doing so would
   * replace the live Slate document while the user is actively typing, causing
   * ReactEditor.deselect() to throw "Failed to execute 'collapseToEnd' on
   * 'Selection': There is no selection", which crashes the component tree.
   */
  const lastEditorValueRef = useRef<string | undefined>(undefined);

  /** Called by MarkdownInputField's onChange handler to record what the editor just emitted. */
  const onEditorChange = useCallback((value: string) => {
    lastEditorValueRef.current = value;
  }, []);

  // 同步外部 value 到编辑器 — 只在 value 来自外部（非编辑器自身输入）时写回
  useEffect(() => {
    if (!markdownEditorRef.current) return;
    // Skip the round-trip: if the editor itself produced this value, it already
    // has the correct document and calling setMDContent would overwrite the live
    // selection state while the user is typing.
    if (props.value === lastEditorValueRef.current) return;
    markdownEditorRef.current?.store?.setMDContent(props.value ?? '');
  }, [props.value]);

  // 通过 ref 暴露编辑器实例，包装 store.setMDContent 以同步 value 状态，确保发送按钮正确响应
  // 使用 Proxy 包装 store，仅覆盖 setMDContent，保留 getMDContent、clearContent、focus 等全部方法
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

      const storeProxy = new Proxy(editor.store, {
        get(target, prop) {
          if (prop === 'setMDContent') {
            return syncValueAndSetMDContent;
          }
          return Reflect.get(target, prop);
        },
      });

      return {
        ...editor,
        store: storeProxy,
      } as MarkdownEditorInstance;
    },
    [props.setValue],
  );

  return {
    markdownEditorRef,
    quickActionsRef,
    actionsRef,
    isSendingRef,
    onEditorChange,
  };
};
