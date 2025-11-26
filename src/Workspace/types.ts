import React, { type ReactNode } from 'react';
import type { MarkdownEditorProps } from '../MarkdownEditor';
import type { BrowserItemInput } from './Browser';
import type { RealtimeFollowData } from './RealtimeFollow';
import type { TaskItem, TaskItemInput } from './Task';

// 标签页配置
export interface TabConfiguration {
  key?: string;
  icon?: ReactNode;
  title?: ReactNode;
  count?: number;
}

// 标签页数据结构
export interface TabItem {
  key: string;
  label: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  content?: ReactNode;
  componentType?: string; // 组件类型，用于判断是否在特定组件后插入分隔符
}

// 工作空间主组件属性
export interface WorkspaceProps {
  activeTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  style?: React.CSSProperties;
  className?: string;
  title?: ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  /** 纯净模式，关闭阴影和边框 */
  pure?: boolean;
}

// 子组件基础属性
export interface BaseChildProps {
  tab?: TabConfiguration;
}

// 具体子组件属性
export interface RealtimeProps extends BaseChildProps {
  data?: RealtimeFollowData;
}

export interface BrowserProps extends BaseChildProps {
  data?: BrowserItemInput;
}

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
  Archive = 'archive',
  Other = 'other',
}

// 基础文件类型定义
export interface FileTypeDefinition {
  category: FileCategory;
  extensions: string[];
  mimeTypes: string[];
  name: string;
}

// 文件类型注册表
export const FILE_TYPES: Record<string, FileTypeDefinition> = {
  plainText: {
    category: FileCategory.Text,
    extensions: ['txt'],
    mimeTypes: ['text/plain'],
    name: '文本文件',
  },
  markdown: {
    category: FileCategory.Text,
    extensions: ['md', 'markdown'],
    mimeTypes: ['text/markdown'],
    name: 'Markdown',
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
    name: '图片',
  },
  video: {
    category: FileCategory.Video,
    extensions: ['mp4', 'webm', 'ogg'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    name: '视频',
  },
  audio: {
    category: FileCategory.Audio,
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/mp4',
    ],
    name: '音频',
  },
  pdf: {
    category: FileCategory.PDF,
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    name: 'PDF文档',
  },
  word: {
    category: FileCategory.Word,
    extensions: ['doc', 'docx'],
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    name: 'Word文档',
  },
  excel: {
    category: FileCategory.Excel,
    extensions: ['xls', 'xlsx'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    name: 'Excel表格',
  },
  csv: {
    category: FileCategory.Excel,
    extensions: ['csv'],
    mimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel'],
    name: 'CSV文件',
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
    name: '压缩文件',
  },
  // 代码文件类型
  javascript: {
    category: FileCategory.Code,
    extensions: ['js', 'mjs', 'cjs'],
    mimeTypes: ['text/javascript', 'application/javascript'],
    name: 'JavaScript',
  },
  typescript: {
    category: FileCategory.Code,
    extensions: ['ts'],
    mimeTypes: ['text/typescript', 'application/typescript'],
    name: 'TypeScript',
  },
  react: {
    category: FileCategory.Code,
    extensions: ['jsx', 'tsx'],
    mimeTypes: ['text/jsx', 'text/tsx'],
    name: 'React',
  },
  python: {
    category: FileCategory.Code,
    extensions: ['py', 'pyw', 'pyi'],
    mimeTypes: ['text/x-python', 'application/x-python-code'],
    name: 'Python',
  },
  java: {
    category: FileCategory.Code,
    extensions: ['java'],
    mimeTypes: ['text/x-java-source'],
    name: 'Java',
  },
  cpp: {
    category: FileCategory.Code,
    extensions: ['cpp', 'cc', 'cxx', 'c++', 'hpp', 'hxx', 'h++'],
    mimeTypes: ['text/x-c++src', 'text/x-c++hdr'],
    name: 'C++',
  },
  c: {
    category: FileCategory.Code,
    extensions: ['c', 'h'],
    mimeTypes: ['text/x-csrc', 'text/x-chdr'],
    name: 'C',
  },
  csharp: {
    category: FileCategory.Code,
    extensions: ['cs'],
    mimeTypes: ['text/x-csharp'],
    name: 'C#',
  },
  go: {
    category: FileCategory.Code,
    extensions: ['go'],
    mimeTypes: ['text/x-go'],
    name: 'Go',
  },
  rust: {
    category: FileCategory.Code,
    extensions: ['rs'],
    mimeTypes: ['text/x-rust'],
    name: 'Rust',
  },
  php: {
    category: FileCategory.Code,
    extensions: ['php', 'php3', 'php4', 'php5', 'phtml'],
    mimeTypes: ['text/x-php', 'application/x-httpd-php'],
    name: 'PHP',
  },
  ruby: {
    category: FileCategory.Code,
    extensions: ['rb', 'rbw'],
    mimeTypes: ['text/x-ruby'],
    name: 'Ruby',
  },
  shell: {
    category: FileCategory.Code,
    extensions: ['sh', 'bash', 'zsh', 'fish'],
    mimeTypes: ['text/x-shellscript', 'application/x-sh'],
    name: 'Shell脚本',
  },
  powershell: {
    category: FileCategory.Code,
    extensions: ['ps1', 'psm1', 'psd1'],
    mimeTypes: ['text/x-powershell'],
    name: 'PowerShell',
  },
  sql: {
    category: FileCategory.Code,
    extensions: ['sql'],
    mimeTypes: ['text/x-sql', 'application/sql'],
    name: 'SQL',
  },
  lua: {
    category: FileCategory.Code,
    extensions: ['lua'],
    mimeTypes: ['text/x-lua'],
    name: 'Lua',
  },
  perl: {
    category: FileCategory.Code,
    extensions: ['pl', 'pm', 'perl'],
    mimeTypes: ['text/x-perl'],
    name: 'Perl',
  },
  scala: {
    category: FileCategory.Code,
    extensions: ['scala', 'sc'],
    mimeTypes: ['text/x-scala'],
    name: 'Scala',
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
    name: '配置文件',
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
  onGroupDownload?: (files: FileNode[], groupType: FileType) => void;
  onDownload?: (file: FileNode) => void;
  onFileClick?: (file: FileNode) => void;
  onLocate?: (file: FileNode) => void;
  onToggleGroup?: (groupType: FileType, collapsed: boolean) => void;
  /** 重置标识，用于重置预览状态（内部使用） */
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
   * @deprecated 请使用 isLoading 代替
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
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /**
   * 是否在文件项根元素上绑定 DOM id
   * @default false
   * @description 置为 false 时，不会向元素写入 id 属性（不影响 React key）
   */
  bindDomId?: boolean;
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
