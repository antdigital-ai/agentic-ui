import { FILE_TYPES, FileCategory, FileNode } from '../types';

const DEFAULT_MIME_TYPE = 'application/octet-stream';
const TEXT_MIME_TYPE = 'text/plain';

/**
 * 从 URL 中提取文件扩展名，忽略 query / hash（CDN 签名链接常见）。
 */
const getUrlFileExtension = (url?: string): string | undefined => {
  if (!url) return undefined;
  const pathWithoutQueryOrHash = url.split(/[?#]/)[0];
  const extension = pathWithoutQueryOrHash.split('.').pop()?.toLowerCase();
  return extension || undefined;
};

const CODE_MIME_TYPES: string[] = [
  'text/javascript',
  'application/javascript',
  'text/typescript',
  'application/typescript',
  'text/jsx',
  'text/tsx',
  'text/x-python',
  'application/x-python-code',
  'text/x-java-source',
  'text/x-c++src',
  'text/x-c++hdr',
  'text/x-csrc',
  'text/x-chdr',
  'text/x-csharp',
  'text/x-go',
  'text/x-rust',
  'text/x-php',
  'application/x-httpd-php',
  'text/x-ruby',
  'text/x-shellscript',
  'application/x-sh',
  'text/x-powershell',
  'text/x-sql',
  'application/sql',
  'text/x-kotlin',
  'text/x-swift',
  'text/x-dart',
  'text/x-lua',
  'text/x-perl',
  'text/x-r',
  'text/x-matlab',
  'text/x-scala',
  'application/json',
  'application/yaml',
  'text/yaml',
  'application/toml',
];

/**
 * 文件数据源枚举
 */
export enum DataSourceType {
  URL = 'url',
  CONTENT = 'content',
  FILE = 'file',
}

/**
 * 预览能力枚举
 */
export enum PreviewCapability {
  FULL = 'full', // 完全支持预览
  BASIC = 'basic', // 基础预览（如图片）
  NONE = 'none', // 不支持预览
}

/**
 * 数据源处理结果
 */
export interface DataSourceResult {
  /** 数据源类型 */
  sourceType: DataSourceType;
  /** 预览能力 */
  previewCapability: PreviewCapability;
  /** 预览用的资源URL */
  previewUrl?: string;
  /** 内容数据 */
  content?: string;
  /** MIME类型 */
  mimeType?: string;
  /** 是否需要清理资源 */
  needsCleanup: boolean;
}

/**
 * 数据源策略抽象接口
 */
export interface DataSourceStrategy {
  /** 检查是否可以处理该文件 */
  canHandle(file: FileNode): boolean;
  /** 处理文件数据并返回结果 */
  process(file: FileNode): DataSourceResult;
}

/**
 * URL数据源策略
 */
export class UrlDataSourceStrategy implements DataSourceStrategy {
  canHandle(file: FileNode): boolean {
    return Boolean(file.url);
  }

  process(file: FileNode): DataSourceResult {
    if (!file.url) {
      throw new Error('URL not provided');
    }

    const fileCategory = this.getFileCategory(file);

    return {
      sourceType: DataSourceType.URL,
      previewCapability: this.getPreviewCapability(fileCategory),
      previewUrl: file.url,
      mimeType: this.inferMimeType(file),
      needsCleanup: false,
    };
  }

  private getFileCategory(file: FileNode): FileCategory {
    const extension = getUrlFileExtension(file.url);
    if (!extension) return FileCategory.Other;

    // 根据扩展名判断分类
    for (const [, definition] of Object.entries(FILE_TYPES)) {
      if (definition.extensions.includes(extension)) {
        return definition.category;
      }
    }

    return FileCategory.Other;
  }

  private getPreviewCapability(category: FileCategory): PreviewCapability {
    switch (category) {
      case FileCategory.Image:
        return PreviewCapability.BASIC;
      case FileCategory.Word:
      case FileCategory.Excel:
      case FileCategory.Presentation:
        return PreviewCapability.FULL;
      default:
        return PreviewCapability.NONE;
    }
  }

  private inferMimeType(file: FileNode): string {
    const extension = getUrlFileExtension(file.url);
    if (!extension) return DEFAULT_MIME_TYPE;

    for (const [, definition] of Object.entries(FILE_TYPES)) {
      if (definition.extensions.includes(extension)) {
        return definition.mimeTypes[0];
      }
    }

    return DEFAULT_MIME_TYPE;
  }
}

/**
 * 内容数据源策略
 */
export class ContentDataSourceStrategy implements DataSourceStrategy {
  canHandle(file: FileNode): boolean {
    return Boolean(file.content);
  }

  process(file: FileNode): DataSourceResult {
    if (!file.content) {
      throw new Error('Content not provided');
    }

    let previewUrl: string | undefined;
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      const blob = new Blob([file.content], { type: TEXT_MIME_TYPE });
      previewUrl = URL.createObjectURL(blob);
    }

    return {
      sourceType: DataSourceType.CONTENT,
      previewCapability: PreviewCapability.FULL,
      previewUrl,
      content: file.content,
      mimeType: TEXT_MIME_TYPE,
      needsCleanup: Boolean(previewUrl),
    };
  }
}

/**
 * File对象数据源策略
 */
export class FileDataSourceStrategy implements DataSourceStrategy {
  canHandle(file: FileNode): boolean {
    return Boolean(file.file);
  }

  process(file: FileNode): DataSourceResult {
    if (!file.file) {
      throw new Error('File object not provided');
    }

    // 为File对象创建URL（仅在浏览器环境中）
    let previewUrl: string | undefined;
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      previewUrl = URL.createObjectURL(file.file);
    }

    const fileCategory = this.getCategoryFromMimeType(file.file.type);

    return {
      sourceType: DataSourceType.FILE,
      previewCapability: this.getPreviewCapability(fileCategory),
      previewUrl,
      mimeType: file.file.type,
      needsCleanup: Boolean(previewUrl),
    };
  }

  private getCategoryFromMimeType(mimeType: string): FileCategory {
    if (mimeType.startsWith('image/')) return FileCategory.Image;
    if (mimeType.startsWith('video/')) return FileCategory.Video;
    // 先识别具体的代码类 MIME，避免被通用的 text/* 提前匹配
    if (this.isCodeMimeType(mimeType)) return FileCategory.Code;
    if (mimeType.startsWith('text/')) return FileCategory.Text;
    if (mimeType === 'application/pdf') return FileCategory.PDF;
    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return FileCategory.Word;
    }
    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    ) {
      return FileCategory.Excel;
    }
    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mimeType === 'application/vnd.ms-powerpoint'
    ) {
      return FileCategory.Presentation;
    }
    return FileCategory.Other;
  }

  private isCodeMimeType(mimeType: string): boolean {
    return CODE_MIME_TYPES.includes(mimeType);
  }

  private getPreviewCapability(category: FileCategory): PreviewCapability {
    switch (category) {
      case FileCategory.Text:
      case FileCategory.Code:
      case FileCategory.Image:
      case FileCategory.Video:
      case FileCategory.PDF:
      case FileCategory.Word:
      case FileCategory.Excel:
      case FileCategory.Presentation:
        return PreviewCapability.FULL;
      default:
        return PreviewCapability.NONE;
    }
  }
}

/**
 * 数据源管理器
 */
export class DataSourceManager {
  private strategies: DataSourceStrategy[] = [
    new ContentDataSourceStrategy(),
    new FileDataSourceStrategy(),
    new UrlDataSourceStrategy(),
  ];

  /**
   * 处理文件数据源
   */
  processFile(file: FileNode): DataSourceResult {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(file)) {
        return strategy.process(file);
      }
    }

    // 默认处理
    return {
      sourceType: DataSourceType.URL,
      previewCapability: PreviewCapability.NONE,
      needsCleanup: false,
    };
  }

  /**
   * 清理资源
   */
  cleanupResult(result: DataSourceResult): void {
    if (!result.needsCleanup || !result.previewUrl?.startsWith('blob:')) return;

    // 直接清理 Blob URL，不需要找到具体的策略（仅在浏览器环境中）
    if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(result.previewUrl);
    }
  }

  /**
   * 注册新的数据源策略
   */
  registerStrategy(strategy: DataSourceStrategy): void {
    this.strategies.unshift(strategy); // 新策略优先级更高
  }
}

/**
 * 全局数据源管理器实例
 */
export const dataSourceManager = new DataSourceManager();
