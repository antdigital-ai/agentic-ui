import React, { type ReactNode } from 'react';
import type { MarkdownEditorProps } from '../MarkdownEditor';
import type { BrowserProps as InternalBrowserProps } from './Browser';
import type { RealtimeFollowData } from './RealtimeFollow';
import type { TaskItem, TaskItemInput } from './Task';

export type { BrowserItem, BrowserSuggestion } from './Browser';

// 标签页配置
export interface TabConfiguration {
  key?: string;
  icon?: ReactNode;
  title?: ReactNode;
  count?: number;
}

/**
 * 工作区内置子面板类型，与 `Workspace.Realtime` / `Workspace.File` 等一一对应
 */
export type WorkspacePanelType =
  | 'realtime'
  | 'browser'
  | 'task'
  | 'file'
  | 'fileTree'
  | 'custom';

// 标签页数据结构
export interface TabItem {
  key: string;
  label: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
  /** 子面板类型，用于分割线与内容策略 */
  componentType?: WorkspacePanelType;
}

// 工作空间主组件属性
export interface WorkspaceProps {
  /**
   * 当前激活的标签页 key（受控）
   * @description 未传则为非受控。非法 key 时界面回退到有效项；`notifyOnInvalidActiveTabKey` 为 true 时会 `onTabChange` 建议值
   */
  activeTabKey?: string;
  /**
   * 非受控模式下的初始激活标签 key
   * @description 须与某个子面板的 `tab.key` 或默认 key 一致；未传则取第一个有效标签
   */
  defaultActiveTabKey?: string;
  /**
   * 切换标签页回调（用户点击 Segmented 或受控非法 key 回退时）
   * @description 受控模式下应同步更新 `activeTabKey`
   */
  onTabChange?: (tabKey: string) => void;
  /**
   * 受控模式下 `activeTabKey` 不在当前标签列表时，是否通过 `onTabChange` 通知父组件回退到有效 key
   * @default true
   */
  notifyOnInvalidActiveTabKey?: boolean;
  /**
   * 切换标签时是否保留 File / FileTree 的预览态（离开文件类标签再返回时不重置）
   * @default false
   */
  preserveFilePreviewOnTabChange?: boolean;
  style?: React.CSSProperties;
  className?: string;
  title?: ReactNode;
  onClose?: () => void;
  /** 子面板：`Workspace.Realtime` 等内置子组件；支持 memo 包裹（需保留面板标记）或通过 `panelType` 显式声明 */
  children?: React.ReactNode;
  /** 无有效子面板时的占位内容；未传则渲染 `null` */
  emptyContent?: ReactNode;
  /** 纯净模式，关闭阴影和边框 */
  pure?: boolean;
  /** 自定义 header 右侧区域内容 */
  headerExtra?: ReactNode;
}

// 子组件基础属性
export interface BaseChildProps {
  tab?: TabConfiguration;
  /**
   * 显式声明子面板类型
   * @description 使用 HOC 包裹且无法自动识别时传入；一般无需设置
   */
  panelType?: WorkspacePanelType;
}

// 具体子组件属性
export interface RealtimeProps extends BaseChildProps {
  data?: RealtimeFollowData;
}

// Browser 使用 Browser 组件自身的 props 类型，并额外支持 tab 配置
export interface BrowserProps extends BaseChildProps, InternalBrowserProps {}

export interface TaskProps extends BaseChildProps {
  data?: TaskItemInput;
  /** 点击任务项时的回调 */
  onItemClick?: (item: TaskItem) => void;
}

// 文件类型分类
export enum FileCategory {
  Text = 'text',
  Code = 'code',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  PDF = 'pdf',
  Word = 'word',
  Excel = 'excel',
  Presentation = 'presentation',
  Archive = 'archive',
  Other = 'other',
}

// 基础文件类型定义
export interface FileTypeDefinition {
  category: FileCategory;
  extensions: string[];
  mimeTypes: string[];
  /** Locale key for the file type display name (e.g. 'fileType.plainText') */
  nameKey: string;
}

// 文件类型注册表
export const FILE_TYPES: Record<string, FileTypeDefinition> = {
  plainText: {
    category: FileCategory.Text,
    extensions: ['txt'],
    mimeTypes: ['text/plain'],
    nameKey: 'fileType.plainText',
  },
  markdown: {
    category: FileCategory.Text,
    extensions: ['md', 'markdown'],
    mimeTypes: ['text/markdown'],
    nameKey: 'markdown',
  },
  image: {
    category: FileCategory.Image,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml',
    ],
    nameKey: 'fileType.image',
  },
  video: {
    category: FileCategory.Video,
    extensions: [
      'mp4',
      'webm',
      'ogv',
      'mov',
      'avi',
      'mkv',
      'flv',
      '3gp',
      'm4v',
    ],
    mimeTypes: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/x-flv',
      'video/3gpp',
      'video/x-m4v',
    ],
    nameKey: 'fileType.video',
  },
  audio: {
    category: FileCategory.Audio,
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma', 'opus'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/mp4',
      'audio/flac',
      'audio/x-ms-wma',
      'audio/opus',
    ],
    nameKey: 'fileType.audio',
  },
  pdf: {
    category: FileCategory.PDF,
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    nameKey: 'fileType.pdf',
  },
  word: {
    category: FileCategory.Word,
    extensions: ['doc', 'docx'],
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    nameKey: 'fileType.word',
  },
  excel: {
    category: FileCategory.Excel,
    extensions: ['xls', 'xlsx'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    nameKey: 'fileType.excel',
  },
  csv: {
    category: FileCategory.Excel,
    extensions: ['csv'],
    mimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel'],
    nameKey: 'fileType.csv',
  },
  powerpoint: {
    category: FileCategory.Presentation,
    extensions: ['ppt', 'pptx'],
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    nameKey: 'fileType.powerpoint',
  },
  archive: {
    category: FileCategory.Archive,
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
    ],
    nameKey: 'fileType.archive',
  },
  // 代码文件类型
  javascript: {
    category: FileCategory.Code,
    extensions: ['js', 'mjs', 'cjs'],
    mimeTypes: ['text/javascript', 'application/javascript'],
    nameKey: 'javascript',
  },
  typescript: {
    category: FileCategory.Code,
    extensions: ['ts'],
    mimeTypes: ['text/typescript', 'application/typescript'],
    nameKey: 'typescript',
  },
  react: {
    category: FileCategory.Code,
    extensions: ['jsx', 'tsx'],
    mimeTypes: ['text/jsx', 'text/tsx'],
    nameKey: 'react',
  },
  python: {
    category: FileCategory.Code,
    extensions: ['py', 'pyw', 'pyi'],
    mimeTypes: ['text/x-python', 'application/x-python-code'],
    nameKey: 'python',
  },
  java: {
    category: FileCategory.Code,
    extensions: ['java'],
    mimeTypes: ['text/x-java-source'],
    nameKey: 'java',
  },
  cpp: {
    category: FileCategory.Code,
    extensions: ['cpp', 'cc', 'cxx', 'c++', 'hpp', 'hxx', 'h++'],
    mimeTypes: ['text/x-c++src', 'text/x-c++hdr'],
    nameKey: 'c++',
  },
  c: {
    category: FileCategory.Code,
    extensions: ['c', 'h'],
    mimeTypes: ['text/x-csrc', 'text/x-chdr'],
    nameKey: 'c',
  },
  csharp: {
    category: FileCategory.Code,
    extensions: ['cs'],
    mimeTypes: ['text/x-csharp'],
    nameKey: 'c#',
  },
  go: {
    category: FileCategory.Code,
    extensions: ['go'],
    mimeTypes: ['text/x-go'],
    nameKey: 'go',
  },
  rust: {
    category: FileCategory.Code,
    extensions: ['rs'],
    mimeTypes: ['text/x-rust'],
    nameKey: 'rust',
  },
  php: {
    category: FileCategory.Code,
    extensions: ['php', 'php3', 'php4', 'php5', 'phtml'],
    mimeTypes: ['text/x-php', 'application/x-httpd-php'],
    nameKey: 'php',
  },
  ruby: {
    category: FileCategory.Code,
    extensions: ['rb', 'rbw'],
    mimeTypes: ['text/x-ruby'],
    nameKey: 'ruby',
  },
  shell: {
    category: FileCategory.Code,
    extensions: ['sh', 'bash', 'zsh', 'fish'],
    mimeTypes: ['text/x-shellscript', 'application/x-sh'],
    nameKey: 'fileType.shell',
  },
  powershell: {
    category: FileCategory.Code,
    extensions: ['ps1', 'psm1', 'psd1'],
    mimeTypes: ['text/x-powershell'],
    nameKey: 'powershell',
  },
  sql: {
    category: FileCategory.Code,
    extensions: ['sql'],
    mimeTypes: ['text/x-sql', 'application/sql'],
    nameKey: 'sql',
  },
  lua: {
    category: FileCategory.Code,
    extensions: ['lua'],
    mimeTypes: ['text/x-lua'],
    nameKey: 'lua',
  },
  perl: {
    category: FileCategory.Code,
    extensions: ['pl', 'pm', 'perl'],
    mimeTypes: ['text/x-perl'],
    nameKey: 'perl',
  },
  scala: {
    category: FileCategory.Code,
    extensions: ['scala', 'sc'],
    mimeTypes: ['text/x-scala'],
    nameKey: 'scala',
  },
  config: {
    category: FileCategory.Code,
    extensions: [
      'json',
      'yaml',
      'yml',
      'toml',
      'ini',
      'conf',
      'cfg',
      'properties',
    ],
    mimeTypes: [
      'application/json',
      'application/yaml',
      'text/yaml',
      'application/toml',
      'text/plain',
      'application/x-wine-extension-ini',
    ],
    nameKey: 'fileType.config',
  },
} as const;

// 文件类型
export type FileType = keyof typeof FILE_TYPES;

// 节点基础属性
export interface BaseNode {
  id?: string;
  name: string;
  icon?: ReactNode;
}

/**
 * 内置操作按钮
 */
export interface FileBuiltinActions {
  /** 预览按钮 */
  preview: ReactNode;
  /** 定位按钮 */
  locate: ReactNode;
  /** 分享按钮 */
  share: ReactNode;
  /** 下载按钮 */
  download: ReactNode;
}

/**
 * 文件卡片自定义渲染函数参数
 */
export interface FileRenderContext {
  /** 当前文件节点 */
  file: FileNode;
  /** 样式前缀 */
  prefixCls: string;
  /** 样式 hash */
  hashId: string;
  /** 是否禁用 */
  disabled: boolean;
  /** 内置操作按钮，可在 renderActions 中复用 */
  actions: FileBuiltinActions;
}

// 文件节点（叶子节点）
export interface FileNode extends BaseNode {
  displayType?: string; // 用于展示在文件标题下方的类型：文件类型、文件大小、文件更新时间
  type?: FileType;
  size?: string | number;
  lastModified?: string | number | Date;
  url?: string;
  file?: File | Blob;
  previewUrl?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  canPreview?: boolean; // 用户自定义是否可以预览
  canDownload?: boolean; // 用户自定义是否可以下载（默认显示，设置为 false 隐藏）
  /** 用户自定义是否可以分享（默认隐藏，设置为 true 显示） */
  canShare?: boolean;
  /** 用户自定义是否可以定位（默认隐藏，设置为 true 显示） */
  canLocate?: boolean;
  loading?: boolean; // 文件是否处于加载中
  /**
   * 是否禁用文件卡片
   * @description 禁用后文件卡片不可点击，操作按钮也会隐藏
   */
  disabled?: boolean;
  /**
   * 自定义渲染文件名区域
   * @description 传入后将替换默认的文件名渲染
   */
  renderName?: (ctx: FileRenderContext) => ReactNode;
  /**
   * 自定义渲染详情行区域
   * @description 传入后将替换默认的详情行（类型、大小、时间等）渲染
   */
  renderDetails?: (ctx: FileRenderContext) => ReactNode;
  /**
   * 自定义渲染操作按钮区域
   * @description 传入后将替换默认的操作按钮（预览、下载、分享等）渲染
   */
  renderActions?: (ctx: FileRenderContext) => ReactNode;
}

// 分组节点
export interface GroupNode extends BaseNode {
  collapsed?: boolean;
  children: FileNode[];
  type: FileType;
  /** 用户自定义是否可以下载分组（默认显示，设置为 false 隐藏） */
  canDownload?: boolean;
}

// 文件组件外部可调用方法
export interface FileActionRef {
  openPreview: (file: FileNode) => void;
  backToList: () => void;
  /**
   * 跨页更新预览标题区域的文件信息（仅影响标题展示，不改变实际预览内容）
   */
  updatePreviewHeader?: (partial: Partial<FileNode>) => void;
}

// 文件组件属性
export interface FileProps extends BaseChildProps {
  nodes: (GroupNode | FileNode)[];
  /** Group 子组件下载事件 */
  onGroupDownload?: (files: FileNode[], groupType: FileType) => void;
  /** 文件下载事件 */
  onDownload?: (file: FileNode) => void;
  /** File 子组件点击事件 */
  onFileClick?: (file: FileNode) => void;
  onLocate?: (file: FileNode) => void;
  /**
   * Group 子组件切换事件
   * @deprecated @since 2.29.0 请使用 onGroupToggle 替代（符合命名规范），但为保持兼容性暂时保留
   */
  onToggleGroup?: (groupType: FileType, collapsed: boolean) => void;
  /** Group 子组件切换事件 */
  onGroupToggle?: (groupType: FileType, collapsed: boolean) => void;
  /**
   * 重置标识：切换工作区标签时 `Workspace` 会递增，仅在**当前激活**的 `Workspace.File` 上注入，用于关闭预览等；非激活页不接收以避免隐藏面板重复重置
   * @internal
   */
  resetKey?: number;
  onPreview?: (
    file: FileNode,
  ) =>
    | void
    | false
    | FileNode
    | ReactNode
    | Promise<void | false | FileNode | ReactNode>;
  /**
   * 自定义预览页返回行为
   * @description 返回 false 可阻止组件默认的返回列表行为
   */
  onBack?: (file: FileNode) => void | boolean | Promise<void | boolean>;
  /**
   * 分享回调（文件列表与预览页均会调用）
   * @param file 当前文件
   * @param ctx  上下文，包含 anchorEl（分享按钮元素）与来源
   */
  onShare?: (
    file: FileNode,
    ctx?: { anchorEl?: HTMLElement; origin: 'list' | 'preview' },
  ) => void;
  /**
   * MarkdownEditor 的配置项，用于自定义预览效果
   * @description 这里的配置会覆盖默认的预览配置
   */
  markdownEditorProps?: Partial<
    Omit<MarkdownEditorProps, 'editorRef' | 'initValue' | 'readonly'>
  >;
  /**
   * 自定义预览页面右侧操作区域
   * @description 可以是 ReactNode 或者根据文件返回 ReactNode 的函数
   */
  customActions?: React.ReactNode | ((file: FileNode) => React.ReactNode);
  /**
   * 对外暴露的操作引用，允许外部主动打开预览或返回列表
   */
  actionRef?: React.MutableRefObject<FileActionRef | null>;
  /**
   * @deprecated @since 2.29.0 请使用 isLoading 代替
   * @description 已废弃，将在未来版本移除
   */
  loading?: boolean;
  /**
   * 是否显示加载状态
   * @description 当为true时，显示加载动画，通常在文件列表数据加载过程中使用
   */
  isLoading?: boolean;
  /**
   * 自定义加载渲染函数
   * @description 当isLoading为true时，如果提供了此函数则使用自定义渲染，否则使用默认的Spin组件
   */
  loadingRender?: () => React.ReactNode;
  /**
   * 自定义空状态渲染
   * @description 当文件列表为空且非loading状态时，优先使用该渲染；未提供时使用默认的 Empty
   */
  emptyRender?: React.ReactNode | (() => React.ReactNode);
  /** 搜索关键字（受控） */
  keyword?: string;
  /** 搜索关键字变化回调（外部自行过滤） */
  onChange?: (keyword: string) => void;
  /** 是否显示搜索框（默认不显示） */
  showSearch?: boolean;
  /** 搜索框占位符（平铺列表模式；未配置 `fileTreeSwitch` 时两种模式均用此项） */
  searchPlaceholder?: string;
  /**
   * 文件树模式下的搜索框占位符
   * @description 仅在与 `fileTreeSwitch` 并存且当前为树视图时生效；未传时依次回退 `workspace.fileTreeSearchPlaceholder`、`searchPlaceholder`、`workspace.searchPlaceholder`
   */
  searchPlaceholderTree?: string;
  /**
   * 列表与文件树视图切换：传入后在搜索框旁展示段选择器；未传入时不展示
   * @description 与 `showSearch` 并存时，树模式仍显示搜索框；树内筛选仅匹配已展开目录下的已加载子节点（由 `Workspace.File` 注入 `filterKeyword`）
   */
  fileTreeSwitch?: FileTreeSwitchConfig;
  /**
   * 是否在文件项根元素上绑定 DOM id
   * @default false
   * @description 置为 false 时，不会向元素写入 id 属性（不影响 React key）
   */
  bindDomId?: boolean;
}

/**
 * 工作区文件树节点（用于 {@link FileTreeProps}，与 `antd` Tree 的 `key` 对齐）
 */
export interface FileTreeNode {
  /** 树节点唯一 key，与 Ant Design Tree 一致 */
  key: string;
  /** 展示名称 */
  name: string;
  /**
   * 叶子节点对应的文件数据（可选）
   * @description 未传时由 `name` 与 `id`/`key` 合成与平铺列表一致的 {@link FileNode}，预览/下载按钮与选中行为与 {@link FileItem} 对齐；传入后与 {@link FileTreeProps} 的 `onPreview` / `onDownload` 等配合
   */
  file?: FileNode;
  /**
   * 是否叶子（文件）节点
   * @description
   * - 懒加载**目录**必须 `isLeaf: false`；若未传 `isLeaf` 且也无 `children` 时视为**文件**（`isLeaf: true`），与「仅省略 `isLeaf` 表示普通文件」一致
   * - 已有子节点时视为目录
   */
  isLeaf?: boolean;
  /** 子节点；懒加载目录为 `isLeaf: false` 时可为 `[]` 或省略，展开后由 `onLoadChildren` 填充，空目录也保持为目录 */
  children?: FileTreeNode[];
  /** 节点图标 */
  icon?: ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
  /** 业务 id，可选，便于与接口字段对应 */
  id?: string;
}

/**
 * Workspace 文件树：懒加载目录子项
 */
export interface FileTreeProps extends BaseChildProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * 根级树数据
   * @description 子目录可在展开时通过 `onLoadChildren` 拉取并注入
   */
  treeData: FileTreeNode[];
  /**
   * 展开非叶子节点时拉取子节点
   * @param node 当前被展开的节点
   * @returns 子节点列表，可同步或异步
   */
  onLoadChildren: (
    node: FileTreeNode,
  ) => FileTreeNode[] | Promise<FileTreeNode[]>;
  /** 选中节点（点击标题区域）时触发 */
  onSelect?: (node: FileTreeNode) => void;
  /**
   * 叶子节点带 `file` 时，点击行（选中）优先触发；未传且存在 `onPreview` 时选中叶子会打开预览
   * @description 与平铺 {@link FileProps.onFileClick} 一致
   */
  onFileClick?: (file: FileNode) => void;
  /** 下载；未传时对有下载源的叶子仍可使用内置 `handleFileDownload` */
  onDownload?: (file: FileNode) => void;
  /** 预览；语义同 {@link FileProps.onPreview} */
  onPreview?: FileProps['onPreview'];
  /** 分享 */
  onShare?: FileProps['onShare'];
  /** 定位 */
  onLocate?: (file: FileNode) => void;
  /** 是否显示连接线，透传 antd Tree */
  showLine?: boolean;
  /**
   * 由 `Workspace` 在激活项上透传，与 `Workspace.File` 的 `resetKey` 同槽位；不用于清空已懒加载的树状态（树以 `treeData` 为唯一数据源同步）
   * @internal
   */
  resetKey?: number;
  /**
   * 无数据时展示
   * @description 与 File 的 `emptyRender` 行为一致
   */
  emptyRender?: ReactNode | (() => ReactNode);
  /**
   * 名称筛选关键字（`Workspace.File` 内嵌树时注入）
   * @description 仅匹配已展开目录下的已加载子节点；未传或空不筛选。无匹配时：未展开任何目录为 `workspace.treeFilterNoMatchVisibleRoots`，已展开过为 `workspace.treeFilterNoMatchInExpanded`
   */
  filterKeyword?: string;
  /**
   * 是否整行可点选（antd Tree `blockNode`），默认 `true`
   */
  blockNode?: boolean;
}

/** 文件面板在「列表」与「文件树」之间的视图模式 */
export type FilePanelViewMode = 'list' | 'tree';

/**
 * 在 {@link FileProps} 上启用「列表 / 文件树」段选择器时的配置
 * @description 配置后搜索行右侧展示切换；开启 `showSearch` 时树模式仍显示搜索框，筛选仅作用于已展开分支（`filterKeyword` 由 `Workspace.File` 注入）。`treeProps` 与独立使用 `Workspace.FileTree` 时一致（`tab`、`resetKey`、`filterKeyword` 由 `Workspace.File` 注入；`onDownload`、`onPreview`、`onShare`、`onLocate`、`onFileClick` 由 `Workspace.File` 与列表共用，勿在 `treeProps` 中重复传入）
 */
export interface FileTreeSwitchConfig {
  treeProps: Omit<
    FileTreeProps,
    | 'tab'
    | 'resetKey'
    | 'filterKeyword'
    | 'onDownload'
    | 'onPreview'
    | 'onShare'
    | 'onLocate'
    | 'onFileClick'
  >;
  /** 非受控时的初始视图，默认 `list` */
  defaultView?: FilePanelViewMode;
  /** 受控当前视图 */
  view?: FilePanelViewMode;
  onViewChange?: (view: FilePanelViewMode) => void;
  /**
   * 平铺视图的无障碍名称与浏览器 `title`（段控件为图标时使用）
   * @default 取 `locale['workspace.file']`
   */
  listLabel?: React.ReactNode;
  /**
   * 文件树视图的无障碍名称与浏览器 `title`（段控件为图标时使用）
   * @default 取 `locale['workspace.fileTree']`
   */
  treeLabel?: React.ReactNode;
}

export interface CustomProps extends BaseChildProps {
  children?: ReactNode;
}

// 工具函数
export const getFileType = (filename: string): FileType => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  for (const [type, definition] of Object.entries(FILE_TYPES)) {
    if (definition.extensions.includes(extension)) {
      return type as FileType;
    }
  }

  return 'plainText';
};

export const getMimeType = (fileType: FileType): string => {
  return FILE_TYPES[fileType].mimeTypes[0];
};

export const getFileCategory = (fileType: FileType): FileCategory => {
  return FILE_TYPES?.[fileType]?.category;
};

/**
 * Get the localized display name for a file type.
 * Falls back to the nameKey itself when no locale is provided.
 */
export const getFileTypeName = (
  fileType: FileType,
  locale?: Record<string, string>,
): string => {
  const definition = FILE_TYPES[fileType];
  if (!definition) return fileType;
  return locale?.[definition.nameKey] ?? definition.nameKey;
};
