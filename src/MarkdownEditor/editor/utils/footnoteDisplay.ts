/** 与 useHighlight 脚注引用匹配一致（全局匹配） */
export const FOOTNOTE_REF_REG = /\[\^[^\]]+\]/g;

/** 从 `[^id]` 片段提取 identifier */
export const FOOTNOTE_REF_IDENTIFIER_REG = /\[\^([^\]]+)\]/;

/** 脚注定义行前缀 `[^id]:` */
const FOOTNOTE_DEF_PREFIX_REG = /^\[\^([^\]]+)\]:?/;

export function extractFootnoteRefIdentifier(text?: string): string | undefined {
  if (!text) {
    return undefined;
  }
  const match = FOOTNOTE_REF_IDENTIFIER_REG.exec(text);
  return match?.[1];
}

/**
 * 展示用脚注标识：优先 leaf.identifier（字符串），否则从 text 解析 `[^…]`
 */
export function resolveFootnoteRefIdentifier(
  text?: string,
  leafIdentifier?: string | boolean,
): string | undefined {
  if (typeof leafIdentifier === 'string' && leafIdentifier.length > 0) {
    return leafIdentifier;
  }
  return extractFootnoteRefIdentifier(text);
}

export function formatFootnoteRefDisplayLabel(
  text?: string,
  leafIdentifier?: string | boolean,
): string {
  const identifier = resolveFootnoteRefIdentifier(text, leafIdentifier);
  if (identifier) {
    return identifier;
  }
  return text ?? '';
}

export function extractFootnoteDefinitionIdentifier(
  text?: string,
): string | undefined {
  if (!text) {
    return undefined;
  }
  const trimmed = text.trim();
  const defMatch = FOOTNOTE_DEF_PREFIX_REG.exec(trimmed);
  if (defMatch?.[1]) {
    return defMatch[1];
  }
  return extractFootnoteRefIdentifier(text);
}

export function buildFootnoteDefinitionChangePayload(
  children: {
    type?: string;
    id?: unknown;
    identifier?: unknown;
    value?: unknown;
    url?: unknown;
  }[],
) {
  return children
    .filter((item) => item.type === 'footnoteDefinition')
    .map((item, index) => ({
      id: item.id ?? index,
      placeholder: item.identifier,
      origin_text: item.value,
      url: item.url,
      origin_url: item.url,
    }));
}
