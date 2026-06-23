import { Editor } from 'slate';

const SLATE_EDITOR_METHOD_BLOCKLIST = new Set(['children', 'selection', 'marks']);

const ERROR_REPORTING_WRAPPED = Symbol('markdownEditorErrorReportingWrapped');

const tryCatchCallback =
  (editorFunc: (...args: unknown[]) => unknown) =>
  (...editorFuncArgs: unknown[]) => {
    try {
      return editorFunc(...editorFuncArgs);
    } catch (error) {
      console.error('[MarkdownEditor] Slate editor method failed:', error);
      throw error;
    }
  };

/**
 * 为 Slate 编辑器方法包一层错误日志；失败时 rethrow，避免静默吞错导致文档半一致状态。
 */
export const withErrorReporting = (editor: Editor): Editor => {
  const editorRecord = editor as unknown as Record<string, unknown>;
  Object.keys(editor).forEach((key) => {
    if (SLATE_EDITOR_METHOD_BLOCKLIST.has(key)) return;
    const value = editorRecord[key];
    if (typeof value !== 'function') return;
    if (
      (value as { [ERROR_REPORTING_WRAPPED]?: boolean })[
        ERROR_REPORTING_WRAPPED
      ]
    ) {
      return;
    }
    const wrapped = tryCatchCallback(
      value as (...args: unknown[]) => unknown,
    );
    (wrapped as { [ERROR_REPORTING_WRAPPED]?: boolean })[
      ERROR_REPORTING_WRAPPED
    ] = true;
    editorRecord[key] = wrapped;
  });

  return editor;
};
