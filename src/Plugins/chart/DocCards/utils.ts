import { columnKeyMatchesConfiguredField } from '../../../MarkdownEditor/editor/parser/parse/parseTable';

/**
 * docCards 的 4 个语义字段。
 *
 * - `title`：主标题，必填；用于卡片头部的大字粗体。
 * - `url`：副标题/链接，可选；非空时渲染为 `a[href]`，否则不显示。
 * - `description`：正文段落，可选。
 * - `tags`：标签列表，可选；按 {@link splitTags} 拆分后渲染为胶囊。
 */
export type DocCardsField = 'title' | 'url' | 'description' | 'tags';

/**
 * 字段映射：将语义字段名映射到表头 dataIndex。
 *
 * 缺省值为 `undefined` 时由 {@link DEFAULT_FIELD_ALIASES} 推断。
 */
export type DocCardsFieldMap = Partial<Record<DocCardsField, string>>;

/**
 * 字段别名表（按语义字段聚合）。
 *
 * 列名匹配遵循「精确相等」或「逻辑名 + 中英文括号单位/补充」的宽松规则
 * （复用 {@link columnKeyMatchesConfiguredField}），与 x/y 字段匹配一致。
 */
export const DEFAULT_FIELD_ALIASES: Record<DocCardsField, string[]> = {
  title: ['名称', '标题', 'name', 'title', 'Name', 'Title'],
  url: ['地址', '链接', 'URL', 'url', 'Link', 'link', '网址'],
  description: ['简介', '描述', '说明', 'description', 'desc', 'summary'],
  tags: ['亮点', '标签', 'tags', 'tag', '关键词'],
};

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
 * 在表头列名集合中按别名顺序查找首个命中列。
 */
const findFieldKey = (
  field: DocCardsField,
  columnKeys: string[],
  override?: string,
): string | undefined => {
  if (override) {
    if (columnKeys.includes(override)) return override;
    const matched = columnKeys.find((key) =>
      columnKeyMatchesConfiguredField(key, override),
    );
    if (matched) return matched;
  }
  for (const alias of DEFAULT_FIELD_ALIASES[field]) {
    if (columnKeys.includes(alias)) return alias;
    const matched = columnKeys.find((key) =>
      columnKeyMatchesConfiguredField(key, alias),
    );
    if (matched) return matched;
  }
  return undefined;
};

/**
 * 解析后的 docCards 字段映射。
 *
 * `title` 必为命中列名；其余字段未命中时为 `undefined`。
 */
export type ResolvedDocCardsFields = {
  title: string;
} & Partial<Record<Exclude<DocCardsField, 'title'>, string>>;

/**
 * 根据表头列与可选覆盖映射，解析出 docCards 各语义字段对应的 dataIndex。
 *
 * 当 `title` 列无法解析时返回 `null`，调用方应据此降级（解析阶段降为普通表格、
 * 渲染阶段返回空容器）。
 */
export const resolveDocCardsFields = (
  columnKeys: string[],
  override?: DocCardsFieldMap,
): ResolvedDocCardsFields | null => {
  const title = findFieldKey('title', columnKeys, override?.title);
  if (!title) return null;
  const url = findFieldKey('url', columnKeys, override?.url);
  const description = findFieldKey(
    'description',
    columnKeys,
    override?.description,
  );
  const tags = findFieldKey('tags', columnKeys, override?.tags);
  return {
    title,
    ...(url ? { url } : {}),
    ...(description ? { description } : {}),
    ...(tags ? { tags } : {}),
  };
};

/**
 * 校验给定 url 是否为可安全渲染为 `a[href]` 的链接。
 *
 * 仅放行 `http://`、`https://`、`mailto:`、`tel:`，以及站内相对路径 `/...` 与 `#...`；
 * 其它形式（含 `javascript:`）一律视为纯文本以避免 XSS。
 */
export const isSafeHref = (raw: unknown): boolean => {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  return /^(https?:|mailto:|tel:)/i.test(trimmed);
};
