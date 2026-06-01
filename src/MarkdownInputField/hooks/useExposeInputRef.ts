import { useImperativeHandle } from 'react';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

interface UseExposeInputRefParams {
  /** 由调用方传入的对外 ref */
  inputRef: MarkdownInputFieldProps['inputRef'];
  /** 由 useInputFieldRefContainer 提供的内部编辑器实例 ref */
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  /** 受控 value 的 setter，需在 setMDContent 调用时同步触发，确保发送按钮等派生状态正确 */
  setValue: (value: string) => void;
}

/**
 * 把内部 MarkdownEditor 实例透出到调用方传入的 `inputRef`。
 *
 * 单一职责：仅处理「内部实例 → 外部 ref」的桥接，并保证通过外部 ref
 * 直接调用 `store.setMDContent` 时也能同步主组件的受控 `value` 状态
 * （否则发送按钮等派生 disabled 状态不会更新）。
 *
 * 实现：用 `Proxy` 包装 `editor.store`，仅劫持 `setMDContent` 方法以
 * 在调用前同步 `setValue`，其余方法（`getMDContent` / `clearContent` /
 * `focus` 等）通过 `Reflect.get` 透传，保留完整的 store 表面。
 */
export const useExposeInputRef = ({
  inputRef,
  markdownEditorRef,
  setValue,
}: UseExposeInputRefParams): void => {
  useImperativeHandle(inputRef, (): MarkdownEditorInstance | undefined => {
    const editor = markdownEditorRef.current;

    const syncValueAndSetMDContent = (
      md?: string,
      plugins?: any,
      options?: any,
    ) => {
      if (md !== undefined) {
        setValue(md);
      }
      return editor?.store?.setMDContent(md, plugins, options);
    };

    // editor 尚未就绪时，仍提供一个最小可用的 store，至少保证 setMDContent
    // 调用安全（同步外部 value，方便父组件做受控初始化）。
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
  }, [setValue]);
};
