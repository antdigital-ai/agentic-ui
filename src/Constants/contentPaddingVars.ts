import type { CSSProperties } from 'react';

/** 桌面/通用：由 contentStyle 写入的容器内边距 */
export const CONTENT_PADDING_CSS_VAR = '--agentic-ui-content-padding';

/** 移动端优先的容器内边距（断点内注册默认值） */
export const CONTENT_PADDING_MOBILE_CSS_VAR = '--agentic-ui-content-padding-sm';

/** 宿主可覆盖：MarkdownEditor 容器移动端默认内边距 */
export const MOBILE_CONTENT_PADDING_CSS_VAR = '--agentic-ui-mobile-content-padding';

/** 宿主可覆盖：MarkdownInputField editor-content 移动端默认内边距 */
export const MOBILE_INPUT_FIELD_EDITOR_CONTENT_PADDING_CSS_VAR =
  '--agentic-ui-mobile-input-field-editor-content-padding';

/** MarkdownInputField editor-content 移动端 padding 变量 */
export const INPUT_FIELD_EDITOR_CONTENT_PADDING_MOBILE_CSS_VAR =
  '--agentic-ui-input-field-editor-content-padding-sm';

/** 移动端容器默认：4px（对齐 --padding-1x） */
export const MOBILE_CONTENT_PADDING_DEFAULT = `var(${MOBILE_CONTENT_PADDING_CSS_VAR}, var(--padding-1x, 4px))`;

/** 移动端输入框 editor-content 默认：2px */
export const MOBILE_INPUT_FIELD_EDITOR_CONTENT_PADDING_DEFAULT = `var(${MOBILE_INPUT_FIELD_EDITOR_CONTENT_PADDING_CSS_VAR}, var(--padding-1x, 2px))`;

export const DESKTOP_CONTENT_PADDING_FALLBACK = '4px 20px';

export function toContentPaddingCssVar(
  padding: string | number,
): Record<string, string> {
  return {
    [CONTENT_PADDING_CSS_VAR]:
      typeof padding === 'number' ? `${padding}px` : padding,
  };
}

/**
 * 将 contentStyle.padding 转为 CSS 变量 + var() 链，避免内联固定值压过移动端变量。
 */
export function resolveContainerContentStyle(
  contentStyle: CSSProperties | undefined,
): CSSProperties {
  if (!contentStyle) return {};
  const { padding, ...rest } = contentStyle;
  if (padding === undefined) return contentStyle;
  return {
    ...rest,
    ...toContentPaddingCssVar(padding),
  };
}
