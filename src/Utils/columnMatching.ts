/**
 * 表头列名 ↔ 注释字段名 的宽松匹配工具集。
 *
 * **零外部依赖**（仅原生字符串/正则），可被解析层（`parseTable`）与
 * 渲染层（`Plugins/chart/DocCards`）共用而不引入循环依赖或额外 bundle 体积。
 *
 * 设计原则：
 * - 与 `chart` 的 x/y 字段匹配规则保持一致，避免「同一份契约多套实现」漂移；
 * - 不引入任何 React / remark / antd 等运行时依赖。
 */

/**
 * 表头列名在「逻辑名」后仅跟一段或多段中英文括号内的单位/补充说明时的后缀。
 *
 * 例如 `GDP总量（万亿元）`、`销量(万台)`、`指标(A)(B)`。
 */
const TRAILING_UNIT_SUFFIX_PATTERN = /^(\s*[（(][^）)]+[）)])+\s*$/;

/**
 * 判断表头列名 `columnKey` 是否对应注释里配置的字段 `configuredField`。
 *
 * 命中条件：
 * - 精确相等；
 * - 列名 = 配置名 + 中英文括号内的单位/补充说明（如 `GDP总量（万亿元）` 命中 `GDP总量`）。
 */
export const columnKeyMatchesConfiguredField = (
  columnKey: string,
  configuredField: string,
): boolean => {
  const ck = (columnKey || '').trim();
  const f = (configuredField || '').trim();
  if (!ck || !f) return false;
  if (ck === f) return true;
  if (!ck.startsWith(f)) return false;
  const rest = ck.slice(f.length);
  return rest === '' || TRAILING_UNIT_SUFFIX_PATTERN.test(rest);
};

/**
 * 将注释中的 x/y 字段名解析为表格列的 dataIndex（表头可带单位括号而注释写短名）。
 *
 * 找不到匹配时返回原 `configuredField`，由后续校验决定是否降级。
 */
export const resolveChartAxisFieldToColumnKey = (
  configuredField: string | undefined,
  columnKeys: string[],
): string | undefined => {
  if (configuredField === undefined || configuredField === null) {
    return configuredField;
  }
  const f = configuredField.trim();
  if (!f) return configuredField;
  const keySet = new Set(columnKeys);
  if (keySet.has(f)) return f;
  const hit = columnKeys.find((k) => columnKeyMatchesConfiguredField(k, f));
  return hit ?? configuredField;
};

/**
 * docCards 的 4 个语义字段。
 *
 * - `title`：主标题，必填；
 * - `url`：副标题/链接，可选；
 * - `description`：正文段落，可选；
 * - `tags`：标签列表，可选。
 */
export type DocCardsField = 'title' | 'url' | 'description' | 'tags';

/**
 * docCards 字段映射：将语义字段名映射到表头 dataIndex。
 *
 * 缺省值为 `undefined` 时由 {@link DOC_CARDS_FIELD_ALIASES} 推断。
 */
export type DocCardsFieldMap = Partial<Record<DocCardsField, string>>;

/**
 * docCards 字段别名表（按语义字段聚合）。
 *
 * 列名匹配遵循「精确相等」或「逻辑名 + 中英文括号单位/补充」的宽松规则
 * （复用 {@link columnKeyMatchesConfiguredField}），与 chart x/y 字段匹配一致。
 *
 * 解析层与渲染层引用同一份常量，避免别名漂移。
 */
export const DOC_CARDS_FIELD_ALIASES: Record<DocCardsField, string[]> = {
  title: ['名称', '标题', 'name', 'title', 'Name', 'Title'],
  url: ['地址', '链接', 'URL', 'url', 'Link', 'link', '网址'],
  description: ['简介', '描述', '说明', 'description', 'desc', 'summary'],
  tags: ['亮点', '标签', 'tags', 'tag', '关键词'],
};

/**
 * 在表头列名集合中按别名顺序查找首个命中列；同时支持外部覆盖名。
 */
const findFieldKey = (
  field: DocCardsField,
  columnKeys: string[],
  override?: string,
): string | undefined => {
  const candidates = override
    ? [override, ...DOC_CARDS_FIELD_ALIASES[field]]
    : DOC_CARDS_FIELD_ALIASES[field];
  for (const alias of candidates) {
    if (!alias) continue;
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
 * 渲染阶段返回空态）。
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
 * 解析阶段的快速判定：能否在给定表头中锁定 docCards 主标题列。
 *
 * 与 {@link resolveDocCardsFields} 行为对齐，但仅校验 `title` 一项，
 * 用于 `parseTable` 在不引入渲染层的情况下做整表降级判断。
 */
export const canResolveDocCardsTitleColumn = (
  columnKeys: string[],
  override?: string,
): boolean => findFieldKey('title', columnKeys, override) !== undefined;
