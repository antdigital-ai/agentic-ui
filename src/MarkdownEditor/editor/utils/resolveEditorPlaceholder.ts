import type { MarkdownEditorProps } from '../../types';

/** 编辑器空态占位符默认文案 */
export const DEFAULT_EDITOR_PLACEHOLDER = '请输入内容...';

export interface ResolveEditorPlaceholderOptions {
  placeholder?: string;
  textAreaProps?: { placeholder?: string };
  /** @deprecated 请使用 `placeholder` */
  titlePlaceholderContent?: string;
  localeInputPlaceholder?: string;
}

/**
 * 解析 MarkdownEditor 空态占位文案，优先级：
 * placeholder → textAreaProps.placeholder → titlePlaceholderContent → locale → 默认
 */
export function resolveEditorPlaceholder(
  options: ResolveEditorPlaceholderOptions,
): string {
  return (
    options.placeholder ??
    options.textAreaProps?.placeholder ??
    options.titlePlaceholderContent ??
    options.localeInputPlaceholder ??
    DEFAULT_EDITOR_PLACEHOLDER
  );
}

export function resolveEditorPlaceholderFromProps(
  editorProps: Pick<
    MarkdownEditorProps,
    'placeholder' | 'textAreaProps' | 'titlePlaceholderContent'
  >,
  localeInputPlaceholder?: string,
): string {
  return resolveEditorPlaceholder({
    placeholder: editorProps.placeholder,
    textAreaProps: editorProps.textAreaProps,
    titlePlaceholderContent: editorProps.titlePlaceholderContent,
    localeInputPlaceholder,
  });
}
