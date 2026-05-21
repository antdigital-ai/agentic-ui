import type { CSSProperties } from 'react';

/** 含 on* 事件处理器（onerror、onload 等） */
export const DANGEROUS_EVENT_HANDLER_PATTERN = /\bon\w+\s*=/i;

/** 非法 / 危险 URL 降级为纯文本时的展示样式 */
export const UNSAFE_URL_PLAIN_TEXT_STYLE: CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  color: 'rgba(0, 0, 0, 0.65)',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  fontFamily: 'monospace',
  fontSize: '0.9em',
  maxWidth: '100%',
  boxSizing: 'border-box',
};

export const DANGEROUS_URL_SCHEMES = ['javascript:', 'vbscript:'] as const;

/** 携带 href/src 等 URL 且不宜解包为纯文本的媒体/链接标签 */
const PLAIN_TEXT_ELEMENT_TAGS = new Set([
  'a',
  'audio',
  'embed',
  'iframe',
  'img',
  'object',
  'source',
  'svg',
  'video',
]);

const HTML_SNIPPET_PATTERN = /<\s*\/?\s*[a-z][\w-]*[^>]*>/i;

const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const hasDangerousEventHandlers = (value: string): boolean =>
  DANGEROUS_EVENT_HANDLER_PATTERN.test(value);

export const hasDangerousUrlScheme = (value: string): boolean => {
  const lower = value.toLowerCase().trimStart();
  return DANGEROUS_URL_SCHEMES.some((scheme) => lower.startsWith(scheme));
};

/** 字符串是否形如 HTML 片段（非法 URL，如 `<img src=x onerror=...>`） */
export const looksLikeHtmlSnippet = (value: string): boolean =>
  HTML_SNIPPET_PATTERN.test(value.trim());

/**
 * URL / 属性值是否应降级为纯文本展示（非法 HTML URL 或含事件处理器）。
 */
export const shouldRenderUrlAsPlainText = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (hasDangerousEventHandlers(trimmed)) return true;
  if (hasDangerousUrlScheme(trimmed)) return true;
  if (looksLikeHtmlSnippet(trimmed)) return true;
  return false;
};

const URL_ATTRIBUTE_KEYS = new Set(['href', 'src', 'xlink:href', 'poster']);

const formatAttrValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(String).join(' ');
  return String(value);
};

/** 将 hast element 序列化为原始 HTML 字符串（用于纯文本降级展示） */
export const serializeHastElement = (node: {
  tagName: string;
  properties?: Record<string, unknown>;
  children?: Array<{ type: string; value?: string; tagName?: string }>;
}): string => {
  const tag = node.tagName;
  const props = node.properties || {};
  const attrPart = Object.entries(props)
    .map(([key, value]) => `${key}="${formatAttrValue(value)}"`)
    .join(' ');
  const attrStr = attrPart ? ` ${attrPart}` : '';

  if (VOID_HTML_TAGS.has(tag)) {
    return `<${tag}${attrStr}>`;
  }

  const inner = (node.children || [])
    .map((child) => {
      if (child.type === 'text') return child.value ?? '';
      if (child.type === 'element' && child.tagName) {
        return serializeHastElement(child as Parameters<typeof serializeHastElement>[0]);
      }
      return '';
    })
    .join('');

  return `<${tag}${attrStr}>${inner}</${tag}>`;
};

const elementHasDangerousProperties = (
  properties: Record<string, unknown>,
): boolean => {
  if (!properties) return false;
  for (const [key, value] of Object.entries(properties)) {
    if (key.startsWith('on')) return true;
    if (typeof value !== 'string') continue;
    if (hasDangerousUrlScheme(value)) return true;
    if (URL_ATTRIBUTE_KEYS.has(key) && shouldRenderUrlAsPlainText(value)) {
      return true;
    }
  }
  return false;
};

/** hast 元素是否应整体降级为纯文本（而非仅剥离危险属性） */
export const shouldElementRenderAsPlainText = (node: {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
}): boolean => {
  if (node.type !== 'element' || !node.tagName) return false;
  if (!PLAIN_TEXT_ELEMENT_TAGS.has(node.tagName)) return false;
  return elementHasDangerousProperties(node.properties || {});
};
