/**
 * DocCards 渲染层工具函数集合。
 *
 * 本模块刻意保持「零外部依赖」（仅原生字符串/正则与 `src/Utils/columnMatching.ts`
 * 中的纯字符串工具）。请勿在此引入 React / antd / remark / rehype 等运行时依赖，
 * 以免被消费方按需引用时把整套 markdown 解析栈带进 bundle。
 */
import {
  DOC_CARDS_FIELD_ALIASES,
  resolveDocCardsFields as sharedResolveDocCardsFields,
  type DocCardsField,
  type DocCardsFieldMap,
  type ResolvedDocCardsFields,
} from '../../../Utils/columnMatching';

/**
 * 重新导出共享类型与解析函数，保持原有 import 路径向后兼容。
 *
 * 真实实现位于 `src/Utils/columnMatching.ts`，与 `parseTable` 共用同一份别名表，
 * 避免「同一份契约多处定义」漂移。
 */
export type { DocCardsField, DocCardsFieldMap, ResolvedDocCardsFields };
export const resolveDocCardsFields = sharedResolveDocCardsFields;

/**
 * 字段别名表。保持向后兼容的导出名。
 */
export const DEFAULT_FIELD_ALIASES = DOC_CARDS_FIELD_ALIASES;

/**
 * 标签拆分分隔符。
 *
 * 支持半角逗号、分号、竖线、斜杠，以及全角逗号、分号、顿号；
 * 连续分隔符与首尾空白会被忽略。
 */
const TAG_SPLIT_PATTERN = /[,;|/，；、]+/;

/**
 * 拆分单元格内的标签字符串为去重后的标签数组。
 *
 * 同时容忍 `tag1, tag2`、`tag1；tag2`、`tag1、tag2 / tag3` 等写法；
 * 空字符串、`null`/`undefined` 输入均返回 `[]`。
 */
export const splitTags = (raw: unknown): string[] => {
  if (raw === undefined || raw === null) return [];
  const text = String(raw).trim();
  if (!text) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  text
    .split(TAG_SPLIT_PATTERN)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      if (seen.has(item)) return;
      seen.add(item);
      result.push(item);
    });
  return result;
};

/**
 * 校验给定 url 是否可以安全渲染为 `a[href]`。
 *
 * 放行：
 * - `http://` / `https://` 绝对链接；
 * - `mailto:` / `tel:` 协议链接；
 * - 站内**单斜杠**绝对路径 `/foo`、相对路径 `./foo` / `../foo`；
 * - 站内锚点 `#section`。
 *
 * 拒绝：
 * - **protocol-relative URL** `//evil.com`（会沿用当前页协议跳到外部域，绕过协议白名单）；
 * - `javascript:` / `data:` / `vbscript:` 等可执行/数据 URI；
 * - 任何空值、空白字符串与非字符串输入。
 */
export const isSafeHref = (raw: unknown): boolean => {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  // protocol-relative URL（//host/...）会在 https 页面跳到 https://host，等价于绝对外链，
  // 但不会出现在协议白名单里；显式拒绝以避免被当作「站内绝对路径」混过去。
  if (trimmed.startsWith('//')) return false;
  // 站内绝对/相对路径 + 锚点
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('#')
  ) {
    return true;
  }
  return /^(https?:|mailto:|tel:)/i.test(trimmed);
};

/**
 * 判断给定链接是否「外部」需要在新 tab 中打开。
 *
 * `http(s)` / `mailto:` / `tel:` 视为外部；站内绝对路径、相对路径与锚点视为内部
 * （内部链接在原 tab 中跳转，避免破坏锚点滚动等浏览器原生行为）。
 *
 * 对未通过 {@link isSafeHref} 的 URL 直接返回 `false`，调用方应已先做安全校验。
 */
export const isExternalLink = (raw: unknown): boolean => {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return /^(https?:|mailto:|tel:)/i.test(trimmed);
};

/**
 * 将原始 URL 简写为「hostname + path」便于在卡片中展示，长链截断到指定字符数。
 *
 * - `http(s)` 链接：返回 `host + pathname + search`，去掉 protocol 与末尾 `/`；
 * - `mailto:` / `tel:`：返回去 scheme 后的纯地址；
 * - 站内相对路径 / 解析失败：原样返回；
 * - 任何超过 `maxLength` 的结果会按尾部省略，确保最终长度 ≤ `maxLength + 1`。
 */
export const formatDisplayUrl = (raw: unknown, maxLength = 64): string => {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  let display = trimmed;
  if (/^https?:/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const path = parsed.pathname === '/' ? '' : parsed.pathname;
      display = `${parsed.host}${path}${parsed.search}`;
    } catch {
      display = trimmed.replace(/^https?:\/\//i, '');
    }
  } else if (/^mailto:/i.test(trimmed)) {
    display = trimmed.slice('mailto:'.length);
  } else if (/^tel:/i.test(trimmed)) {
    display = trimmed.slice('tel:'.length);
  }
  return display.length > maxLength
    ? `${display.slice(0, maxLength)}…`
    : display;
};
