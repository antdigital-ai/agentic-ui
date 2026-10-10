/**
 * 内联原子 chip 节点（对齐 dtcoder-ide composerSlashAtom / mention 节点）。
 *
 * 设计说明：
 * - IDE 的 Tiptap `atom + inline` 节点在 Slate 中对应「inline + void」元素：
 *   整个 chip 是一个不可编辑的原子，作为行内节点参与段落排版。
 * - chip 的真实数据承载在 `chip` 属性上（类型见 {@link ComposerChipData}），
 *   children 按惯例为 `[{ text: '' }]` 占位。
 * - 序列化到 markdown 时由 parserSlateNodeToMarkdown 统一处理，
 *   与 IDE 的 `renderText` 对齐：slash → `/name`，mention → `@path`，
 *   折叠长文本 → 原文 fenced code 或原文内联。
 */
export type ComposerChipNode<
  T extends Record<string, any> = Record<string, any>,
> = {
  type: 'composer-chip';
  /** chip 身份数据，void 元素的唯一真实内容源 */
  chip: ComposerChipData;
  /** void 惯例占位 children */
  children: [{ text: '' }];
  contextProps?: T;
  otherProps?: T;
};

/**
 * Slash 命令 chip 数据（对齐 dtcoder-ide ComposerSlashAtomValue）。
 */
export interface ComposerSlashChip {
  kind: 'slash';
  /** chip 结构版本，读取侧做兼容校验 */
  version: 1;
  /** 唯一 id（用于 chip wave 动画认领与 gate 定位） */
  id: string;
  /** 命令名，不带前导斜杠 */
  name: string;
  /** 分区：内置 / 自定义 / 技能 */
  section: 'default' | 'custom' | 'skill';
  /** 提供方标识（宿主自定义） */
  extensionId: string;
  /** 未配置参数时的 placeholder key（宿主解析） */
  placeholderKey?: string;
  /**
   * 结构化参数载荷。undefined / 空对象视为「未配置」，
   * 发送前 gate（onSendGate）可据此拦截并提示配置。
   */
  payload?: Record<string, string | number | boolean | null>;
}

/**
 * @file / @folder mention chip 数据（对齐 dtcoder-ide ComposerPathFragment）。
 */
export interface ComposerFileChip {
  kind: 'file' | 'folder';
  /** 唯一 id */
  id: string;
  /** 完整路径（发送序列化的依据） */
  path: string;
  /** chip 显示名（文件名 / 目录名） */
  name: string;
  /** 引用来源：project（项目内引用）| local（本地上传） */
  source?: 'project' | 'local';
  /** 文件大小（local 上传场景展示用） */
  size?: number;
}

/**
 * @symbol mention chip 数据（对齐 dtcoder-ide ComposerSymbolFragment）。
 */
export interface ComposerSymbolChip {
  kind: 'symbol';
  /** 唯一 id */
  id: string;
  /** Symbol 名（方法名 / 类名），chip 主标签 */
  name: string;
  /** 种类：function / class / method ... */
  symbolKind: string;
  /** 所属容器名（chip 副标题） */
  containerName?: string;
  /** 所在文件 URI */
  uri?: string;
  /** 起止行号（1-based, inclusive） */
  range?: {
    startLine: number;
    endLine: number;
  };
}

/**
 * 长文本粘贴折叠 chip 数据（对齐 dtcoder-ide pastedLongText 节点）。
 */
export interface ComposerLongTextChip {
  kind: 'long-text';
  /** 唯一 id */
  id: string;
  /** 折叠保存的完整原文（含换行与缩进） */
  text: string;
  /** 字符数（展示用） */
  characterCount: number;
  /** 行数（展示用） */
  lineCount: number;
}

/** 所有 chip 数据的联合类型 */
export type ComposerChipData =
  | ComposerSlashChip
  | ComposerFileChip
  | ComposerSymbolChip
  | ComposerLongTextChip;

/** 长文本折叠阈值（对齐 dtcoder-ide LONG_TEXT_PASTE_MIN_*） */
export const LONG_TEXT_PASTE_MIN_CHARS = 1200;
export const LONG_TEXT_PASTE_MIN_LINES = 12;

const SLASH_SECTIONS = new Set(['default', 'custom', 'skill']);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** 宽松读取 + 校验 chip 数据，非法数据返回 undefined（对齐 readComposerSlashAtom） */
export const readComposerChipData = (
  value: unknown,
): ComposerChipData | undefined => {
  if (!isPlainObject(value)) return undefined;
  const chip = value as Partial<ComposerChipData>;

  if (chip.kind === 'long-text') {
    if (
      typeof chip.id === 'string' &&
      chip.id &&
      typeof chip.text === 'string' &&
      typeof chip.characterCount === 'number' &&
      typeof chip.lineCount === 'number'
    ) {
      return chip as ComposerLongTextChip;
    }
    return undefined;
  }

  if (chip.kind === 'file' || chip.kind === 'folder') {
    if (
      typeof chip.id === 'string' &&
      chip.id &&
      typeof chip.path === 'string' &&
      typeof chip.name === 'string'
    ) {
      return chip as ComposerFileChip;
    }
    return undefined;
  }

  if (chip.kind === 'symbol') {
    if (
      typeof chip.id === 'string' &&
      chip.id &&
      typeof chip.name === 'string' &&
      typeof chip.symbolKind === 'string'
    ) {
      return chip as ComposerSymbolChip;
    }
    return undefined;
  }

  if (chip.kind === 'slash') {
    if (
      chip.version === 1 &&
      typeof chip.id === 'string' &&
      chip.id &&
      typeof chip.name === 'string' &&
      chip.name &&
      typeof chip.extensionId === 'string' &&
      typeof chip.section === 'string' &&
      SLASH_SECTIONS.has(chip.section)
    ) {
      return chip as ComposerSlashChip;
    }
    return undefined;
  }

  return undefined;
};

/** 生成 chip 唯一 id（挂载内自增，避免同帧多 chip 撞 id） */
let chipIdSeed = 0;
export const createComposerChipId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${(chipIdSeed++).toString(36)}`;

/** slash chip 序列化文本：`/name`（对齐 composerSlashAtomText） */
export const composerSlashChipText = (chip: ComposerSlashChip): string =>
  `/${chip.name.trim().replace(/^\/+/, '')}`;

/** file/folder chip 序列化文本：`@path`（路径含空格时用尖括号包裹） */
export const composerFileChipText = (chip: ComposerFileChip): string => {
  const path = chip.path.trim();
  return /[\s()]/.test(path) ? `@<${path}>` : `@${path}`;
};

/** symbol chip 序列化文本：`@name`（附 uri#range 供宿主解析） */
export const composerSymbolChipText = (chip: ComposerSymbolChip): string =>
  `@${chip.name.trim()}`;

/** chip 统一序列化：发送文本 / markdown 同源 */
export const composerChipToText = (chip: ComposerChipData): string => {
  switch (chip.kind) {
    case 'slash':
      return composerSlashChipText(chip);
    case 'file':
    case 'folder':
      return composerFileChipText(chip);
    case 'symbol':
      return composerSymbolChipText(chip);
    case 'long-text':
      return chip.text;
    default:
      return '';
  }
};

/**
 * 判断 slash chip 是否「未配置」（发送前 gate 依据）。
 * 对齐 IDE 行为：无 payload 或 payload 为空对象时视为未配置，
 * placeholderKey 存在说明宿主期望用户补参数。
 */
export const isSlashChipUnconfigured = (chip: ComposerSlashChip): boolean =>
  !chip.payload || Object.keys(chip.payload).length === 0;

/** 统计长文本（对齐 getComposerLongTextStats） */
export const getLongTextStats = (text: string) => {
  const normalized = text.replace(/\r\n?/g, '\n');
  return {
    characterCount: normalized.length,
    lineCount: normalized.length === 0 ? 0 : normalized.split('\n').length,
  };
};

/** 是否应折叠粘贴文本（对齐 shouldCollapsePastedText） */
export const shouldCollapsePastedText = (text: string): boolean => {
  const normalized = text.replace(/\r\n?/g, '\n');
  if (normalized.trim().length === 0) return false;
  const stats = getLongTextStats(normalized);
  return (
    stats.characterCount >= LONG_TEXT_PASTE_MIN_CHARS ||
    stats.lineCount >= LONG_TEXT_PASTE_MIN_LINES
  );
};

/** 创建 slash chip 节点 */
export const createSlashChipNode = (
  chip: Omit<ComposerSlashChip, 'version' | 'id'> & { id?: string },
): ComposerChipNode => ({
  type: 'composer-chip',
  chip: {
    version: 1,
    id: chip.id ?? createComposerChipId('slash'),
    ...chip,
  } as ComposerSlashChip,
  children: [{ text: '' }],
});

/** 创建 file/folder chip 节点 */
export const createFileChipNode = (
  chip: Omit<ComposerFileChip, 'id'> & { id?: string },
): ComposerChipNode => ({
  type: 'composer-chip',
  chip: {
    id: chip.id ?? createComposerChipId(chip.kind),
    ...chip,
  } as ComposerFileChip,
  children: [{ text: '' }],
});

/** 创建 symbol chip 节点 */
export const createSymbolChipNode = (
  chip: Omit<ComposerSymbolChip, 'id'> & { id?: string },
): ComposerChipNode => ({
  type: 'composer-chip',
  chip: {
    id: chip.id ?? createComposerChipId('symbol'),
    ...chip,
  } as ComposerSymbolChip,
  children: [{ text: '' }],
});

/** 创建长文本折叠 chip 节点 */
export const createLongTextChipNode = (text: string): ComposerChipNode => {
  const stats = getLongTextStats(text);
  return {
    type: 'composer-chip',
    chip: {
      kind: 'long-text',
      id: createComposerChipId('long-text'),
      text,
      characterCount: stats.characterCount,
      lineCount: stats.lineCount,
    },
    children: [{ text: '' }],
  };
};
