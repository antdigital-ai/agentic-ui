import type { CSSProperties } from 'react';

const PADDING_KEYS = [
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const;

/**
 * 清理会产生无效内联声明的样式值（如 `padding-top: ;`、`--foo: ;`）。
 * 用于 BaseMarkdownEditor 根 `style` 与 `contentStyle`。
 */
export function sanitizeEditorChromeStyle(
  style: CSSProperties | undefined,
): CSSProperties {
  if (!style) return {};
  const out: CSSProperties = { ...style };

  for (const k of PADDING_KEYS) {
    if (out[k] === '') {
      delete out[k];
    }
  }

  for (const key of Object.keys(out)) {
    if (
      key.startsWith('--') &&
      (out as Record<string, string | number | undefined>)[key] === ''
    ) {
      delete (out as Record<string, unknown>)[key];
    }
  }

  return out;
}
