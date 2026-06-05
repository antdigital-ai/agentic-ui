import React from 'react';
import BaseMarkdownEditorSlate from './BaseMarkdownEditorSlate';
import ReadonlyMarkdownEditorView from './ReadonlyMarkdownEditorView';
import { parserMdToSchema } from './editor/parser/parserMdToSchema';
import { EditorUtils } from './editor/utils/editorUtils';
import { MarkdownEditorProps } from './types';

export { sanitizeEditorChromeStyle } from './utils/sanitizeChromeStyle';
export { EditorUtils, parserMdToSchema };

export * from './editor/elements';
export * from './editor/utils';
export * from './el';
export * from './types';

export type { EditorSelChangePayload } from './editor/utils/editorSelChange';
export { createEditorSelChangeSubject } from './editor/utils/editorSelChange';
export { ReadonlyMarkdownEditorView };
export { ReadonlyMarkdownEditorStore } from './readonly/ReadonlyMarkdownEditorStore';
export { findTextInReadonlyMarkdownDom } from './readonly/findTextInReadonlyMarkdownDom';

/**
 * 按只读模式与 renderMode 分流：
 * - `readonly` 且 `renderMode`（或 `renderType`）为 `markdown` 时仅挂载轻量只读视图（无 Slate）
 * - 其余情况（可编辑，或只读但需 Slate 文档行为）走 Slate 编辑壳
 */
export const BaseMarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const effectiveRenderMode = props.renderMode ?? props.renderType ?? 'slate';
  if (props.readonly && effectiveRenderMode === 'markdown') {
    return <ReadonlyMarkdownEditorView {...props} />;
  }
  return <BaseMarkdownEditorSlate {...props} />;
};
